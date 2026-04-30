import "reflect-metadata";
import express from "express";
import cors from "cors";
import { getRepository } from "typeorm";
import AppDataSource from "./config/data-source.js";
import { listener } from "./whatsapp/whatsapp-service.js";
import { User } from "./auth/entities/user.entity.js";
import { UserDao } from "./auth/daos/user.dao.js";
import { AuthService } from "./auth/services/auth.service.js";
import { AuthController } from "./auth/controllers/auth.controller.js";
import { createAuthRouter } from "./auth/routes/auth.routes.js";
import { createWhatsappAdminRouter } from "./whatsapp-admin/whatsapp-admin.routes.js";

const app = express();
const port = Number(process.env.PORT ?? 3000);
const enableWhatsappListener = process.env.ENABLE_WHATSAPP_LISTENER === "true";

app.use(
  cors({
    origin: "http://localhost:4300",
    credentials: true,
  }),
);
app.use(express.json());

// Inicializar base de datos
AppDataSource.initialize()
  .then(() => {
    console.log("Base de datos conectada exitosamente");

    // Configurar servicios y controladores
    const userRepository = AppDataSource.getRepository(User);
    const userDao = new UserDao(userRepository);
    const authService = new AuthService(userDao);
    const authController = new AuthController(authService);

    // Rutas
    app.use("/api/v1/auth", createAuthRouter(authController));
    app.use("/api/v1/whatsapp", createWhatsappAdminRouter());

    app.get("/", (_req, res) => {
      res.status(200).json({
        service: "customer-service",
        status: "ok",
      });
    });

    app.get("/health", (_req, res) => {
      res.status(200).json({
        status: "healthy",
      });
    });

    app.listen(port, "0.0.0.0", () => {
      console.log(
        `Servidor de atención al cliente escuchando en el puerto ${port}`,
      );
      console.log(
        `Listener de WhatsApp habilitado: ${enableWhatsappListener ? "sí" : "no"}`,
      );

      if (enableWhatsappListener) {
        listener.start();
      }
    });
  })
  .catch((error) => {
    console.error("Error al conectar la base de datos:", error);
    process.exit(1);
  });
