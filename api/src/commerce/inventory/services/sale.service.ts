import AppDataSource from "../../../core/config/data-source.js";
import { getCurrentTenantId } from "../../../core/tenancy/tenant-context.js";
import { InventoryService } from "./inventory.service.js";
import { SaleDao } from "../daos/sale.dao.js";
import { SaleItemDao } from "../daos/sale-item.dao.js";
import { Sale } from "../entities/sale.entity.js";
import { SaleItem } from "../entities/sale-item.entity.js";

export interface SaleItemInput {
  inventoryItemId: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateSalePayload {
  localId: string;
  customerName?: string | null;
  paymentMethod: Sale["paymentMethod"];
  createdByEmployeeId?: string | null;
  items: SaleItemInput[];
}

export class SaleService {
  constructor(
    private saleDao: SaleDao,
    private saleItemDao: SaleItemDao,
    private inventoryService: InventoryService,
  ) {}

  async getAll(): Promise<Sale[]> {
    return this.saleDao.findAllOrdered();
  }

  async getById(id: string): Promise<Sale | null> {
    return this.saleDao.findById(id);
  }

  async getItems(saleId: string): Promise<SaleItem[]> {
    return this.saleItemDao.findBySaleId(saleId);
  }

  // Todo-o-nada: si cualquier item no tiene stock suficiente, la venta
  // completa se revierte -- nunca queda una venta a medias ni movimientos
  // huerfanos (una sola transaccion para la venta, sus items y cada
  // movimiento de stock que disparan).
  async create(data: CreateSalePayload): Promise<Sale> {
    if (data.items.length === 0) {
      throw new Error("La venta debe tener al menos un item");
    }

    const tenantId = getCurrentTenantId();
    const totalValue = data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

    return AppDataSource.transaction(async (manager) => {
      const sale = manager.create(Sale, {
        tenantId,
        localId: data.localId,
        customerName: data.customerName ?? null,
        paymentMethod: data.paymentMethod,
        createdByEmployeeId: data.createdByEmployeeId ?? null,
        totalValue,
      });
      const savedSale = await manager.save(sale);

      for (const item of data.items) {
        await this.inventoryService.applyMovement(manager, {
          inventoryItemId: item.inventoryItemId,
          type: "out",
          quantity: item.quantity,
          relatedEntityType: "sale",
          relatedEntityId: savedSale.id,
          createdByEmployeeId: data.createdByEmployeeId ?? null,
        });

        const saleItem = manager.create(SaleItem, {
          tenantId,
          saleId: savedSale.id,
          inventoryItemId: item.inventoryItemId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        });
        await manager.save(saleItem);
      }

      return savedSale;
    });
  }
}
