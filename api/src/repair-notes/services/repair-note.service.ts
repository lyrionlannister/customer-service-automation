import { RepairNoteDao } from "../daos/repair-note.dao.js";
import { RepairNoteItemDao } from "../daos/repair-note-item.dao.js";
import { LocalService } from "../../local/services/local.service.js";
import { InventoryService } from "../../inventory/services/inventory.service.js";
import { RepairNote } from "../entities/repair-note.entity.js";
import { RepairNoteItem } from "../entities/repair-note-item.entity.js";
import AppDataSource from "../../config/data-source.js";
import { getCurrentTenantId } from "../../tenancy/tenant-context.js";

type CreatePayload = Omit<RepairNote, "id" | "publicId" | "controlNumber" | "createdAt" | "updatedAt">;
type UpdatePayload = Partial<Omit<RepairNote, "id" | "publicId" | "controlNumber" | "createdAt" | "updatedAt">>;

export interface RepairNoteItemInput {
  inventoryItemId: string;
  quantity: number;
  unitPrice: number;
}

export class RepairNoteService {
  constructor(
    private repairNoteDao: RepairNoteDao,
    private localService: LocalService,
    private repairNoteItemDao: RepairNoteItemDao,
    private inventoryService: InventoryService,
  ) {}

  async getAll(): Promise<RepairNote[]> {
    return this.repairNoteDao.findAllOrdered();
  }

  async getById(id: string): Promise<RepairNote | null> {
    return this.repairNoteDao.findById(id);
  }

  async getItems(repairNoteId: string): Promise<RepairNoteItem[]> {
    return this.repairNoteItemDao.findByRepairNoteId(repairNoteId);
  }

  // Si la nota lleva items (accesorios/partes usados), crearla y registrar
  // los movimientos de salida de stock corre en una sola transaccion:
  // nunca se crea la nota con items que no pudieron descontar su stock.
  async create(data: CreatePayload, items: RepairNoteItemInput[] = []): Promise<RepairNote> {
    const controlNumber = await this.localService.consumeControlNumber();
    const tenantId = getCurrentTenantId();

    if (items.length === 0) {
      return this.repairNoteDao.create({ ...data, controlNumber } as Partial<RepairNote>);
    }

    return AppDataSource.transaction(async (manager) => {
      const note = manager.create(RepairNote, { ...data, controlNumber, tenantId } as Partial<RepairNote>);
      const savedNote = await manager.save(note);

      for (const item of items) {
        await this.inventoryService.applyMovement(manager, {
          inventoryItemId: item.inventoryItemId,
          type: "out",
          quantity: item.quantity,
          relatedEntityType: "repair_note",
          relatedEntityId: savedNote.id,
        });
        const noteItem = manager.create(RepairNoteItem, {
          tenantId,
          repairNoteId: savedNote.id,
          inventoryItemId: item.inventoryItemId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        });
        await manager.save(noteItem);
      }

      return savedNote;
    });
  }

  // Reemplazar los items de una nota existente revierte el stock de los
  // items anteriores (movimiento "in" compensatorio, nunca se borra el
  // ledger silenciosamente) y vuelve a descontar los nuevos -- todo en la
  // misma transaccion que el update de la nota.
  async update(id: string, data: UpdatePayload, items?: RepairNoteItemInput[]): Promise<RepairNote | null> {
    if (items === undefined) {
      return this.repairNoteDao.update(id, data as Partial<RepairNote>);
    }

    const tenantId = getCurrentTenantId();
    return AppDataSource.transaction(async (manager) => {
      const note = await manager.findOneBy(RepairNote, { id, tenantId } as any);
      if (!note) return null;

      const oldItems = await manager.find(RepairNoteItem, { where: { repairNoteId: id, tenantId } as any });
      for (const oldItem of oldItems) {
        await this.inventoryService.applyMovement(manager, {
          inventoryItemId: oldItem.inventoryItemId,
          type: "in",
          quantity: oldItem.quantity,
          relatedEntityType: "repair_note",
          relatedEntityId: id,
          reason: "Edición de nota: reverso de item anterior",
        });
      }
      await manager.delete(RepairNoteItem, { repairNoteId: id, tenantId } as any);

      Object.assign(note, data);
      const savedNote = await manager.save(note);

      for (const item of items) {
        await this.inventoryService.applyMovement(manager, {
          inventoryItemId: item.inventoryItemId,
          type: "out",
          quantity: item.quantity,
          relatedEntityType: "repair_note",
          relatedEntityId: id,
        });
        const noteItem = manager.create(RepairNoteItem, {
          tenantId,
          repairNoteId: id,
          inventoryItemId: item.inventoryItemId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        });
        await manager.save(noteItem);
      }

      return savedNote;
    });
  }

  async delete(id: string): Promise<boolean> {
    return this.repairNoteDao.delete(id);
  }
}
