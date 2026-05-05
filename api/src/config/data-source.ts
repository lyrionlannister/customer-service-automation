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

const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432", 10),
  username: process.env.DB_USERNAME || "n8n",
  password: process.env.DB_PASSWORD || "n8n_password_dev",
  database: process.env.DB_NAME || "app_db",
  synchronize: true, // Auto-sync entities (deshabilitar en producción)
  logging: process.env.NODE_ENV === "development",
  entities: [User, ExcludedPhone, WhatsappSettings, ContactName, Local, RepairNote, MessageTemplate, PriceListItem, Supplier],
});

export default AppDataSource;
