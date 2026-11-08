import "reflect-metadata";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import AppDataSource from "../../../src/config/data-source.js";
import { Local } from "../../../src/local/entities/local.entity.js";
import { LocalDao } from "../../../src/local/daos/local.dao.js";
import { LocalService } from "../../../src/local/services/local.service.js";
import { RepairNote } from "../../../src/repair-notes/entities/repair-note.entity.js";
import { RepairNoteItem } from "../../../src/repair-notes/entities/repair-note-item.entity.js";
import { RepairNoteDao } from "../../../src/repair-notes/daos/repair-note.dao.js";
import { RepairNoteItemDao } from "../../../src/repair-notes/daos/repair-note-item.dao.js";
import { RepairNoteService } from "../../../src/repair-notes/services/repair-note.service.js";
import { InventoryItem } from "../../../src/inventory/entities/inventory-item.entity.js";
import { InventoryMovement } from "../../../src/inventory/entities/inventory-movement.entity.js";
import { InventoryItemDao } from "../../../src/inventory/daos/inventory-item.dao.js";
import { InventoryMovementDao } from "../../../src/inventory/daos/inventory-movement.dao.js";
import { InventoryService } from "../../../src/inventory/services/inventory.service.js";
import { runWithTenant } from "../../../src/tenancy/tenant-context.js";

// Integration test against a real Postgres. Proves the "si se usa un
// accesorio/parte en una nota, se registra el movimiento" rule: crear o
// editar una nota con items decrementa quantityOnHand correctamente y
// nunca a mano / por fuera de InventoryService.
describe("RepairNoteService items -> inventory movements", () => {
  let repairNoteService: RepairNoteService;
  let inventoryService: InventoryService;
  const tenantId = `${Date.now()}3`;

  beforeAll(async () => {
    await AppDataSource.initialize();
    const localService = new LocalService(new LocalDao(AppDataSource.getRepository(Local)));
    const itemDao = new InventoryItemDao(AppDataSource.getRepository(InventoryItem));
    const movementDao = new InventoryMovementDao(AppDataSource.getRepository(InventoryMovement));
    inventoryService = new InventoryService(itemDao, movementDao);
    repairNoteService = new RepairNoteService(
      new RepairNoteDao(AppDataSource.getRepository(RepairNote)),
      localService,
      new RepairNoteItemDao(AppDataSource.getRepository(RepairNoteItem)),
      inventoryService,
    );
  });

  afterAll(async () => {
    await AppDataSource.destroy();
  });

  it("decrements stock when the note is created with items", async () => {
    const item = await runWithTenant(tenantId, () =>
      inventoryService.create({
        localId: "1",
        name: "Bateria A52",
        sku: "A52-BAT",
        kind: "part",
        costPrice: 150,
        salePrice: 300,
      } as any),
    );
    await runWithTenant(tenantId, () =>
      inventoryService.registerMovement({ inventoryItemId: item.id, type: "in", quantity: 4 }),
    );

    const note = await runWithTenant(tenantId, () =>
      repairNoteService.create(
        {
          customerName: "Cliente Items",
          brand: "Samsung",
          model: "A52",
          reportedFailure: "No carga",
          receivedAt: "2026-01-01",
        } as any,
        [{ inventoryItemId: item.id, quantity: 1, unitPrice: 300 }],
      ),
    );

    const stock = await runWithTenant(tenantId, () => inventoryService.getById(item.id));
    expect(stock?.quantityOnHand).toBe(3);
    const items = await runWithTenant(tenantId, () => repairNoteService.getItems(note.id));
    expect(items).toHaveLength(1);
  });

  it("reverses the old item and applies the new one when items are replaced on update", async () => {
    const item = await runWithTenant(tenantId, () =>
      inventoryService.create({
        localId: "1",
        name: "Flex A52",
        sku: "A52-FLEX",
        kind: "part",
        costPrice: 80,
        salePrice: 150,
      } as any),
    );
    await runWithTenant(tenantId, () =>
      inventoryService.registerMovement({ inventoryItemId: item.id, type: "in", quantity: 5 }),
    );

    const note = await runWithTenant(tenantId, () =>
      repairNoteService.create(
        {
          customerName: "Cliente Edicion",
          brand: "Samsung",
          model: "A52",
          reportedFailure: "No enciende",
          receivedAt: "2026-01-01",
        } as any,
        [{ inventoryItemId: item.id, quantity: 2, unitPrice: 150 }],
      ),
    );
    expect((await runWithTenant(tenantId, () => inventoryService.getById(item.id)))?.quantityOnHand).toBe(3);

    // Editar la nota reemplazando items por una cantidad menor: 5 - 1 = 4,
    // no 5 - 2 + 1 = 4 por casualidad -- se revierte el 2 anterior (vuelve a
    // 5) y se vuelve a descontar 1 (queda en 4).
    await runWithTenant(tenantId, () =>
      repairNoteService.update(note.id, {}, [{ inventoryItemId: item.id, quantity: 1, unitPrice: 150 }]),
    );

    const stock = await runWithTenant(tenantId, () => inventoryService.getById(item.id));
    expect(stock?.quantityOnHand).toBe(4);
    const items = await runWithTenant(tenantId, () => repairNoteService.getItems(note.id));
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(1);
  });
});
