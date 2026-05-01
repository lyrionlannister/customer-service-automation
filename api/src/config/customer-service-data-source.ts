import "reflect-metadata";
import { DataSource } from "typeorm";
import { ChatHistory } from "../chats/entities/chat-history.entity.js";

const CustomerServiceDataSource = new DataSource({
  type: "postgres",
  host: process.env.CS_DB_HOST ?? process.env.DB_HOST ?? "localhost",
  port: parseInt(process.env.CS_DB_PORT ?? process.env.DB_PORT ?? "5432", 10),
  username: process.env.CS_DB_USERNAME ?? "n8n",
  password: process.env.CS_DB_PASSWORD ?? "n8n_password_dev",
  database: process.env.CS_DB_NAME ?? "customer_service",
  synchronize: false,
  logging: process.env.NODE_ENV === "development",
  entities: [ChatHistory],
});

export default CustomerServiceDataSource;
