import AppDataSource from "../../config/data-source.js";
import { getCurrentTenantId } from "../../tenancy/tenant-context.js";
import { QuoteDao } from "../daos/quote.dao.js";
import { QuoteItemDao } from "../daos/quote-item.dao.js";
import { Quote, QuoteStatus } from "../entities/quote.entity.js";
import { QuoteItem } from "../entities/quote-item.entity.js";

export interface QuoteItemInput {
  inventoryItemId?: string | null;
  description: string;
  quantity: number;
  unitPrice: number;
}

type CreatePayload = Omit<
  Quote,
  "id" | "publicId" | "totalValue" | "status" | "createdAt" | "updatedAt"
>;
type UpdatePayload = Partial<Omit<Quote, "id" | "publicId" | "totalValue" | "createdAt" | "updatedAt">>;

const sumItems = (items: QuoteItemInput[]): number =>
  items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

export class QuoteService {
  constructor(
    private quoteDao: QuoteDao,
    private quoteItemDao: QuoteItemDao,
  ) {}

  async getAll(): Promise<Quote[]> {
    return this.quoteDao.findAllOrdered();
  }

  async getById(id: string): Promise<Quote | null> {
    return this.quoteDao.findById(id);
  }

  async getItems(quoteId: string): Promise<QuoteItem[]> {
    return this.quoteItemDao.findByQuoteId(quoteId);
  }

  // totalValue nunca se recibe del cliente: siempre se recalcula a partir de
  // los items, para que la cotizacion y lo que muestra el PDF nunca puedan
  // desincronizarse (mismo criterio que InventoryItem.quantityOnHand).
  async create(data: CreatePayload, items: QuoteItemInput[]): Promise<Quote> {
    if (items.length === 0) {
      throw new Error("La cotización debe tener al menos un item");
    }
    const tenantId = getCurrentTenantId();
    const totalValue = sumItems(items);

    return AppDataSource.transaction(async (manager) => {
      const quote = manager.create(Quote, {
        ...data,
        tenantId,
        totalValue,
        status: "pending" as QuoteStatus,
      } as Partial<Quote>);
      const savedQuote = await manager.save(quote);

      for (const item of items) {
        const quoteItem = manager.create(QuoteItem, {
          tenantId,
          quoteId: savedQuote.id,
          inventoryItemId: item.inventoryItemId ?? null,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        });
        await manager.save(quoteItem);
      }

      return savedQuote;
    });
  }

  async update(id: string, data: UpdatePayload, items?: QuoteItemInput[]): Promise<Quote | null> {
    if (items === undefined) {
      return this.quoteDao.update(id, data as Partial<Quote>);
    }
    if (items.length === 0) {
      throw new Error("La cotización debe tener al menos un item");
    }

    const tenantId = getCurrentTenantId();
    const totalValue = sumItems(items);

    return AppDataSource.transaction(async (manager) => {
      const quote = await manager.findOneBy(Quote, { id, tenantId } as any);
      if (!quote) return null;

      await manager.delete(QuoteItem, { quoteId: id, tenantId } as any);

      Object.assign(quote, data, { totalValue });
      const savedQuote = await manager.save(quote);

      for (const item of items) {
        const quoteItem = manager.create(QuoteItem, {
          tenantId,
          quoteId: id,
          inventoryItemId: item.inventoryItemId ?? null,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        });
        await manager.save(quoteItem);
      }

      return savedQuote;
    });
  }

  async setStatus(id: string, status: QuoteStatus): Promise<Quote | null> {
    return this.quoteDao.update(id, { status } as Partial<Quote>);
  }

  async delete(id: string): Promise<boolean> {
    return this.quoteDao.delete(id);
  }
}
