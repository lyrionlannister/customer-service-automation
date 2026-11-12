import "reflect-metadata";
import { DataSource } from "typeorm";
import { ChatHistory } from "../../messaging/chats/entities/chat-history.entity.js";

const CustomerServiceDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST ?? "localhost",
  port: parseInt(process.env.DB_PORT ?? "5432", 10),
  username: process.env.DB_USERNAME ?? "n8n",
  password: process.env.DB_PASSWORD ?? "n8n_password_dev",
  database: process.env.N8N_DB_DATABASE ?? "n8n",
  synchronize: false,
  logging: process.env.NODE_ENV === "development",
  entities: [ChatHistory],
});

export default CustomerServiceDataSource;
