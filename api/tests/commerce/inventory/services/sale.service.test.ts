import "reflect-metadata";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import AppDataSource from "../../../../src/core/config/data-source.js";
import { InventoryItem } from "../../../../src/commerce/inventory/entities/inventory-item.entity.js";
import { InventoryMovement } from "../../../../src/commerce/inventory/entities/inventory-movement.entity.js";
import { Sale } from "../../../../src/commerce/inventory/entities/sale.entity.js";
import { SaleItem } from "../../../../src/commerce/inventory/entities/sale-item.entity.js";
import { InventoryItemDao } from "../../../../src/commerce/inventory/daos/inventory-item.dao.js";
import { InventoryMovementDao } from "../../../../src/commerce/inventory/daos/inventory-movement.dao.js";
import { SaleDao } from "../../../../src/commerce/inventory/daos/sale.dao.js";
import { SaleItemDao } from "../../../../src/commerce/inventory/daos/sale-item.dao.js";
import { InventoryService } from "../../../../src/commerce/inventory/services/inventory.service.js";
import { SaleService } from "../../../../src/commerce/inventory/services/sale.service.js";
import { runWithTenant } from "../../../../src/core/tenancy/tenant-context.js";

// Integration test against a real Postgres. Proves SaleService.create is
// todo-o-nada: si cualquier item de la venta no tiene stock suficiente, la
// venta completa (y los movimientos de los items anteriores que si tenian
// stock) se revierte -- nunca queda una venta a medias ni un movimiento
// huerfano.
describe("SaleService.create atomicity", () => {
  let inventoryService: InventoryService;
  let saleService: SaleService;
  const tenantId = `${Date.now()}2`;

  beforeAll(async () => {
    await AppDataSource.initialize();
    const itemDao = new InventoryItemDao(AppDataSource.getRepository(InventoryItem));
    const movementDao = new InventoryMovementDao(AppDataSource.getRepository(InventoryMovement));
    inventoryService = new InventoryService(itemDao, movementDao);
    saleService = new SaleService(
      new SaleDao(AppDataSource.getRepository(Sale)),
      new SaleItemDao(AppDataSource.getRepository(SaleItem)),
      inventoryService,
    );
  });

  afterAll(async () => {
    await AppDataSource.destroy();
  });

  it("rolls back the whole sale when one item lacks stock", async () => {
    const itemWithStock = await runWithTenant(tenantId, () =>
      inventoryService.create({
        localId: "1",
        name: "Funda",
        sku: "FUNDA-1",
        kind: "accessory",
        costPrice: 20,
        salePrice: 50,
      } as any),
    );
    await runWithTenant(tenantId, () =>
      inventoryService.registerMovement({ inventoryItemId: itemWithStock.id, type: "in", quantity: 5 }),
    );

    const itemOutOfStock = await runWithTenant(tenantId, () =>
      inventoryService.create({
        localId: "1",
        name: "Cargador",
        sku: "CARGADOR-1",
        kind: "accessory",
        costPrice: 30,
        salePrice: 80,
      } as any),
    );
    // Sin stock (quantityOnHand = 0).

    await expect(
      runWithTenant(tenantId, () =>
        saleService.create({
          localId: "1",
          paymentMethod: "efectivo",
          items: [
            { inventoryItemId: itemWithStock.id, quantity: 2, unitPrice: 50 },
            { inventoryItemId: itemOutOfStock.id, quantity: 1, unitPrice: 80 },
          ],
        }),
      ),
    ).rejects.toThrow();

    const stockAfterFailure = await runWithTenant(tenantId, () => inventoryService.getById(itemWithStock.id));
    expect(stockAfterFailure?.quantityOnHand).toBe(5);

    const sales = await runWithTenant(tenantId, () => saleService.getAll());
    expect(sales).toHaveLength(0);
  });

  it("commits sale, items and stock decrements together when everything has stock", async () => {
    const item = await runWithTenant(tenantId, () =>
      inventoryService.create({
        localId: "1",
        name: "Mica",
        sku: "MICA-1",
        kind: "accessory",
        costPrice: 10,
        salePrice: 30,
      } as any),
    );
    await runWithTenant(tenantId, () =>
      inventoryService.registerMovement({ inventoryItemId: item.id, type: "in", quantity: 3 }),
    );

    const sale = await runWithTenant(tenantId, () =>
      saleService.create({
        localId: "1",
        paymentMethod: "tarjeta",
        items: [{ inventoryItemId: item.id, quantity: 2, unitPrice: 30 }],
      }),
    );

    expect(Number(sale.totalValue)).toBe(60);
    const stock = await runWithTenant(tenantId, () => inventoryService.getById(item.id));
    expect(stock?.quantityOnHand).toBe(1);
    const items = await runWithTenant(tenantId, () => saleService.getItems(sale.id));
    expect(items).toHaveLength(1);
  });
});
