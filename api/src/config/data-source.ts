import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../auth/entities/user.entity.js";

const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432", 10),
  username: process.env.DB_USERNAME || "n8n",
  password: process.env.DB_PASSWORD || "n8n_password_dev",
  database: process.env.DB_NAME || "app_db",
  synchronize: true, // Auto-sync entities (deshabilitar en producción)
  logging: process.env.NODE_ENV === "development",
  entities: [User],
});

export default AppDataSource;
