import "reflect-metadata";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import AppDataSource from "../../../src/config/data-source.js";
import { InventoryItem } from "../../../src/inventory/entities/inventory-item.entity.js";
import { InventoryMovement } from "../../../src/inventory/entities/inventory-movement.entity.js";
import { InventoryItemDao } from "../../../src/inventory/daos/inventory-item.dao.js";
import { InventoryMovementDao } from "../../../src/inventory/daos/inventory-movement.dao.js";
import { InventoryService } from "../../../src/inventory/services/inventory.service.js";
import { runWithTenant } from "../../../src/tenancy/tenant-context.js";

// Integration test against a real Postgres. Proves applyMovement's atomic
// guard: the UPDATE validates cantidad_disponible + delta >= 0 in the same
// statement, so concurrent "out" movements can never drive stock negative
// nor silently lose a decrement (same pattern as consumeControlNumber).
describe("InventoryService.registerMovement concurrency", () => {
  let service: InventoryService;
  const tenantId = `${Date.now()}1`;

  beforeAll(async () => {
    await AppDataSource.initialize();
    const itemDao = new InventoryItemDao(AppDataSource.getRepository(InventoryItem));
    const movementDao = new InventoryMovementDao(AppDataSource.getRepository(InventoryMovement));
    service = new InventoryService(itemDao, movementDao);
  });

  afterAll(async () => {
    await AppDataSource.destroy();
  });

  it("never lets concurrent 'out' movements drive stock negative", async () => {
    const item = await runWithTenant(tenantId, () =>
      service.create({
        localId: "1",
        name: "Pantalla A52",
        sku: "A52-SCR",
        kind: "part",
        costPrice: 500,
        salePrice: 900,
      } as any),
    );

    // Seed stock a 10 con un movimiento "in".
    await runWithTenant(tenantId, () =>
      service.registerMovement({ inventoryItemId: item.id, type: "in", quantity: 10 }),
    );

    // 5 salidas concurrentes de 2 unidades cada una: exactamente agotan el
    // stock, ninguna debe fallar y ninguna debe perderse.
    const results = await runWithTenant(tenantId, () =>
      Promise.allSettled(
        Array.from({ length: 5 }, () =>
          service.registerMovement({ inventoryItemId: item.id, type: "out", quantity: 2 }),
        ),
      ),
    );
    expect(results.every((r) => r.status === "fulfilled")).toBe(true);

    const final = await runWithTenant(tenantId, () => service.getById(item.id));
    expect(final?.quantityOnHand).toBe(0);

    // Una salida adicional ya sin stock debe rechazarse, no dejar negativo.
    await expect(
      runWithTenant(tenantId, () =>
        service.registerMovement({ inventoryItemId: item.id, type: "out", quantity: 1 }),
      ),
    ).rejects.toThrow();

    const afterRejected = await runWithTenant(tenantId, () => service.getById(item.id));
    expect(afterRejected?.quantityOnHand).toBe(0);
  });
});

describe("InventoryService.bulkImport", () => {
  let service: InventoryService;
  const tenantId = `${Date.now()}2`;

  beforeAll(async () => {
    await AppDataSource.initialize();
    const itemDao = new InventoryItemDao(AppDataSource.getRepository(InventoryItem));
    const movementDao = new InventoryMovementDao(AppDataSource.getRepository(InventoryMovement));
    service = new InventoryService(itemDao, movementDao);
  });

  afterAll(async () => {
    await AppDataSource.destroy();
  });

  it("crea cada fila con su stock inicial registrado como movimiento 'in'", async () => {
    const result = await runWithTenant(tenantId, () =>
      service.bulkImport("1", [
        { name: "Funda A", sku: null, kind: "accessory", costPrice: 10, salePrice: 30, quantity: 5 },
        { name: "Pantalla B", sku: null, kind: "part", costPrice: 100, salePrice: 200, quantity: 0 },
      ]),
    );

    expect(result).toEqual({ imported: 2 });

    const items = await runWithTenant(tenantId, () => service.getAll());
    const fundaA = items.find((i) => i.name === "Funda A");
    const pantallaB = items.find((i) => i.name === "Pantalla B");
    expect(fundaA?.quantityOnHand).toBe(5);
    expect(pantallaB?.quantityOnHand).toBe(0);

    const movements = await runWithTenant(tenantId, () => service.getMovements(fundaA!.id));
    expect(movements).toHaveLength(1);
    expect(movements[0].type).toBe("in");
  });

  it("no crea nada si la lista de filas está vacía", async () => {
    await expect(runWithTenant(tenantId, () => service.bulkImport("1", []))).rejects.toThrow(
      "No hay filas para importar",
    );
  });
});
