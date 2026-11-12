import { RepairNoteDao } from "../daos/repair-note.dao.js";
import { RepairNoteItemDao } from "../daos/repair-note-item.dao.js";
import { RepairNoteServiceTypeDao } from "../daos/repair-note-service-type.dao.js";
import { LocalService } from "../../../app_platform/local/services/local.service.js";
import { InventoryService } from "../../inventory/services/inventory.service.js";
import { ServiceTypeDao } from "../../service-types/daos/service-type.dao.js";
import { RepairNote } from "../entities/repair-note.entity.js";
import { RepairNoteItem } from "../entities/repair-note-item.entity.js";
import { RepairNoteServiceType } from "../entities/repair-note-service-type.entity.js";
import AppDataSource from "../../../core/config/data-source.js";
import { getCurrentTenantId } from "../../../core/tenancy/tenant-context.js";

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
    private repairNoteServiceTypeDao: RepairNoteServiceTypeDao,
    private serviceTypeDao: ServiceTypeDao,
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

  async getServiceTypeIds(repairNoteId: string): Promise<string[]> {
    const links = await this.repairNoteServiceTypeDao.findByRepairNoteId(repairNoteId);
    return links.map((l) => l.serviceTypeId);
  }

  async getServiceTypeNames(repairNoteId: string): Promise<string[]> {
    const [links, types] = await Promise.all([
      this.repairNoteServiceTypeDao.findByRepairNoteId(repairNoteId),
      this.serviceTypeDao.findAllOrdered(),
    ]);
    const nameById = new Map(types.map((t) => [t.id, t.name]));
    return links.map((l) => nameById.get(l.serviceTypeId)).filter((n): n is string => Boolean(n));
  }

  // Si la nota lleva items (accesorios/partes usados), crearla y registrar
  // los movimientos de salida de stock corre en una sola transaccion:
  // nunca se crea la nota con items que no pudieron descontar su stock.
  // serviceTypeIds va en la misma transaccion: nunca queda una nota sin
  // sus tipos de servicio por un fallo a medio camino.
  async create(
    data: CreatePayload,
    items: RepairNoteItemInput[] = [],
    serviceTypeIds: string[] = [],
  ): Promise<RepairNote> {
    const controlNumber = await this.localService.consumeControlNumber();
    const tenantId = getCurrentTenantId();

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

      for (const serviceTypeId of serviceTypeIds) {
        const link = manager.create(RepairNoteServiceType, {
          tenantId,
          repairNoteId: savedNote.id,
          serviceTypeId,
        });
        await manager.save(link);
      }

      return savedNote;
    });
  }

  // Reemplazar los items/tipos de servicio de una nota existente revierte
  // el stock de los items anteriores (movimiento "in" compensatorio, nunca
  // se borra el ledger silenciosamente) y vuelve a descontar los nuevos --
  // todo en la misma transaccion que el update de la nota.
  async update(
    id: string,
    data: UpdatePayload,
    items?: RepairNoteItemInput[],
    serviceTypeIds?: string[],
  ): Promise<RepairNote | null> {
    if (items === undefined && serviceTypeIds === undefined) {
      return this.repairNoteDao.update(id, data as Partial<RepairNote>);
    }

    const tenantId = getCurrentTenantId();
    return AppDataSource.transaction(async (manager) => {
      const note = await manager.findOneBy(RepairNote, { id, tenantId } as any);
      if (!note) return null;

      if (items !== undefined) {
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
      }

      Object.assign(note, data);
      const savedNote = await manager.save(note);

      if (items !== undefined) {
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
      }

      if (serviceTypeIds !== undefined) {
        await manager.delete(RepairNoteServiceType, { repairNoteId: id, tenantId } as any);
        for (const serviceTypeId of serviceTypeIds) {
          const link = manager.create(RepairNoteServiceType, { tenantId, repairNoteId: id, serviceTypeId });
          await manager.save(link);
        }
      }

      return savedNote;
    });
  }

  // Cancelar revierte el stock de los items ya descontados (mismo patron de
  // reverso que update()) y marca cancelled -- nunca se borra la nota.
  async cancel(id: string): Promise<RepairNote> {
    const tenantId = getCurrentTenantId();
    return AppDataSource.transaction(async (manager) => {
      const note = await manager.findOneBy(RepairNote, { id, tenantId } as any);
      if (!note) throw new Error("Nota no encontrada");
      if (note.status === "cancelled") throw new Error("La nota ya está cancelada");
      if (note.status === "delivered") throw new Error("No se puede cancelar una nota ya entregada");

      const items = await manager.find(RepairNoteItem, { where: { repairNoteId: id, tenantId } as any });
      for (const item of items) {
        await this.inventoryService.applyMovement(manager, {
          inventoryItemId: item.inventoryItemId,
          type: "in",
          quantity: item.quantity,
          relatedEntityType: "repair_note",
          relatedEntityId: id,
          reason: "Nota cancelada",
        });
      }

      note.status = "cancelled";
      return manager.save(note);
    });
  }

  async delete(id: string): Promise<boolean> {
    return this.repairNoteDao.delete(id);
  }
}
