import { EntityManager } from "typeorm";
import AppDataSource from "../../../core/config/data-source.js";
import { getCurrentTenantId } from "../../../core/tenancy/tenant-context.js";
import { InventoryItemDao } from "../daos/inventory-item.dao.js";
import { InventoryMovementDao } from "../daos/inventory-movement.dao.js";
import { InventoryItem } from "../entities/inventory-item.entity.js";
import { InventoryMovement, MovementType, RelatedEntityType } from "../entities/inventory-movement.entity.js";
import type { InventoryImportRow } from "../utils/inventory-import-parser.js";

export interface RegisterMovementInput {
  inventoryItemId: string;
  type: MovementType;
  quantity: number;
  reason?: string | null;
  relatedEntityType?: RelatedEntityType;
  relatedEntityId?: string | null;
  createdByEmployeeId?: string | null;
}

type CreateItemPayload = Omit<InventoryItem, "id" | "publicId" | "quantityOnHand" | "createdAt" | "updatedAt">;
type UpdateItemPayload = Partial<CreateItemPayload>;

export class InventoryService {
  constructor(
    private itemDao: InventoryItemDao,
    private movementDao: InventoryMovementDao,
  ) {}

  async getAll(): Promise<InventoryItem[]> {
    return this.itemDao.findAllOrdered();
  }

  async getById(id: string): Promise<InventoryItem | null> {
    return this.itemDao.findById(id);
  }

  async create(data: CreateItemPayload): Promise<InventoryItem> {
    return this.itemDao.create({ ...data, quantityOnHand: 0 } as Partial<InventoryItem>);
  }

  async update(id: string, data: UpdateItemPayload): Promise<InventoryItem | null> {
    return this.itemDao.update(id, data as Partial<InventoryItem>);
  }

  async delete(id: string): Promise<boolean> {
    return this.itemDao.delete(id);
  }

  // Todo-o-nada, igual que Sale/RepairNote: una fila invalida no deja items
  // huerfanos a medio importar. El stock inicial de cada fila pasa por
  // applyMovement (nunca se escribe quantityOnHand directo) para que quede
  // registrado en el ledger como cualquier otro movimiento.
  async bulkImport(localId: string, rows: InventoryImportRow[]): Promise<{ imported: number }> {
    if (rows.length === 0) {
      throw new Error("No hay filas para importar");
    }
    const tenantId = getCurrentTenantId();

    return AppDataSource.transaction(async (manager) => {
      for (const row of rows) {
        const item = manager.create(InventoryItem, {
          tenantId,
          localId,
          name: row.name,
          sku: row.sku,
          kind: row.kind,
          costPrice: row.costPrice,
          salePrice: row.salePrice,
          quantityOnHand: 0,
        });
        const saved = await manager.save(item);

        if (row.quantity > 0) {
          await this.applyMovement(manager, {
            inventoryItemId: saved.id,
            type: "in",
            quantity: row.quantity,
            reason: "Carga inicial por importación CSV/Excel",
          });
        }
      }
      return { imported: rows.length };
    });
  }

  async getMovements(inventoryItemId: string): Promise<InventoryMovement[]> {
    return this.movementDao.findByItem(inventoryItemId);
  }

  // Punto de entrada standalone (p.ej. "Registrar movimiento" manual desde la UI):
  // abre su propia transaccion.
  async registerMovement(input: RegisterMovementInput): Promise<InventoryMovement> {
    return AppDataSource.transaction((manager) => this.applyMovement(manager, input));
  }

  // Reusable dentro de una transaccion mas grande que ya esta en curso
  // (crear una Sale o guardar los items de una RepairNote): el caller pasa
  // su propio EntityManager para que el decremento de stock, el insert del
  // movimiento y el resto de la operacion (venta/nota) sean todo-o-nada.
  //
  // Atomico por diseno: el UPDATE aplica el delta y valida
  // quantityOnHand + delta >= 0 en la misma sentencia -- no hay
  // read-then-write, asi que dos llamadas concurrentes sobre el mismo item
  // nunca pueden dejar el stock negativo ni perder un decremento (mismo
  // patron que consumeControlNumber en local.dao.ts).
  async applyMovement(manager: EntityManager, input: RegisterMovementInput): Promise<InventoryMovement> {
    const tenantId = getCurrentTenantId();
    const delta =
      input.type === "out" ? -Math.abs(input.quantity) : input.type === "in" ? Math.abs(input.quantity) : input.quantity;

    const result = await manager.query(
      `UPDATE inventory_items
       SET cantidad_disponible = cantidad_disponible + $1
       WHERE id = $2 AND tenant_id = $3 AND cantidad_disponible + $1 >= 0
       RETURNING id`,
      [delta, input.inventoryItemId, tenantId],
    );
    const rows = Array.isArray(result[0]) ? result[0] : result;
    if (rows.length === 0) {
      throw new Error("No se pudo registrar el movimiento: item inexistente o stock insuficiente");
    }

    const movement = manager.create(InventoryMovement, {
      tenantId,
      inventoryItemId: input.inventoryItemId,
      type: input.type,
      quantity: delta,
      reason: input.reason ?? null,
      relatedEntityType: input.relatedEntityType ?? "manual",
      relatedEntityId: input.relatedEntityId ?? null,
      createdByEmployeeId: input.createdByEmployeeId ?? null,
    });
    return manager.save(movement);
  }
}
