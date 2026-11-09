import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../auth/entities/user.entity.js";
import { ExcludedPhone } from "../whatsapp-admin/entities/excluded-phone.entity.js";
import { WhatsappSettings } from "../whatsapp-admin/entities/whatsapp-settings.entity.js";
import { ContactName } from "../chats/entities/contact-name.entity.js";
import { Local } from "../local/entities/local.entity.js";
import { RepairNote } from "../repair-notes/entities/repair-note.entity.js";
import { MessageTemplate } from "../message-templates/entities/message-template.entity.js";
import { PriceListItem } from "../price-list/entities/price-list-item.entity.js";
import { Supplier } from "../suppliers/entities/supplier.entity.js";
import { Notification } from "../notifications/entities/notification.entity.js";
import { Tenant } from "../tenancy/entities/tenant.entity.js";
import { RepairNoteItem } from "../repair-notes/entities/repair-note-item.entity.js";
import { RepairNoteServiceType } from "../repair-notes/entities/repair-note-service-type.entity.js";
import { ServiceType } from "../service-types/entities/service-type.entity.js";
import { InventoryItem } from "../inventory/entities/inventory-item.entity.js";
import { InventoryMovement } from "../inventory/entities/inventory-movement.entity.js";
import { Sale } from "../inventory/entities/sale.entity.js";
import { SaleItem } from "../inventory/entities/sale-item.entity.js";
import { Quote } from "../quotes/entities/quote.entity.js";
import { QuoteItem } from "../quotes/entities/quote-item.entity.js";
import { CashSession } from "../cash/entities/cash-session.entity.js";
import { CashMovement } from "../cash/entities/cash-movement.entity.js";
import { RevenueAttributionSetting } from "../revenue-attribution/entities/revenue-attribution-setting.entity.js";
import { Branch } from "../branches/entities/branch.entity.js";
import { Customer } from "../customers/entities/customer.entity.js";

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
