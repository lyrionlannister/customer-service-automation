import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../../identity/auth/entities/user.entity.js";
import { ExcludedPhone } from "../../messaging/whatsapp-admin/entities/excluded-phone.entity.js";
import { WhatsappSettings } from "../../messaging/whatsapp-admin/entities/whatsapp-settings.entity.js";
import { ContactName } from "../../messaging/chats/entities/contact-name.entity.js";
import { Local } from "../../app_platform/local/entities/local.entity.js";
import { RepairNote } from "../../commerce/repair-notes/entities/repair-note.entity.js";
import { MessageTemplate } from "../../messaging/message-templates/entities/message-template.entity.js";
import { PriceListItem } from "../../commerce/price-list/entities/price-list-item.entity.js";
import { Supplier } from "../../commerce/suppliers/entities/supplier.entity.js";
import { Notification } from "../../messaging/notifications/entities/notification.entity.js";
import { Tenant } from "../tenancy/entities/tenant.entity.js";
import { RepairNoteItem } from "../../commerce/repair-notes/entities/repair-note-item.entity.js";
import { RepairNoteServiceType } from "../../commerce/repair-notes/entities/repair-note-service-type.entity.js";
import { ServiceType } from "../../commerce/service-types/entities/service-type.entity.js";
import { InventoryItem } from "../../commerce/inventory/entities/inventory-item.entity.js";
import { InventoryMovement } from "../../commerce/inventory/entities/inventory-movement.entity.js";
import { Sale } from "../../commerce/inventory/entities/sale.entity.js";
import { SaleItem } from "../../commerce/inventory/entities/sale-item.entity.js";
import { Quote } from "../../commerce/quotes/entities/quote.entity.js";
import { QuoteItem } from "../../commerce/quotes/entities/quote-item.entity.js";
import { CashSession } from "../../commerce/cash/entities/cash-session.entity.js";
import { CashMovement } from "../../commerce/cash/entities/cash-movement.entity.js";
import { RevenueAttributionSetting } from "../../commerce/revenue-attribution/entities/revenue-attribution-setting.entity.js";
import { Branch } from "../../identity/branches/entities/branch.entity.js";
import { Customer } from "../../commerce/customers/entities/customer.entity.js";

const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432", 10),
  username: process.env.DB_USERNAME || "n8n",
  password: process.env.DB_PASSWORD || "n8n_password_dev",
  database: process.env.DB_NAME || "app_db",
  synchronize: true, // Auto-sync entities (deshabilitar en producción)
  logging: process.env.NODE_ENV === "development",
  entities: [
    Tenant,
    User,
    ExcludedPhone,
    WhatsappSettings,
    ContactName,
    Local,
    RepairNote,
    RepairNoteItem,
    RepairNoteServiceType,
    ServiceType,
    MessageTemplate,
    PriceListItem,
    Supplier,
    Notification,
    InventoryItem,
    InventoryMovement,
    Sale,
    SaleItem,
    Quote,
    QuoteItem,
    CashSession,
    CashMovement,
    RevenueAttributionSetting,
    Branch,
    Customer,
  ],
});

export default AppDataSource;
