import "reflect-metadata";
import express from "express";
import cors from "cors";
import AppDataSource from "./config/data-source.js";
import CustomerServiceDataSource from "./config/customer-service-data-source.js";
import { listener } from "./whatsapp/whatsapp-service.js";
import { User } from "./auth/entities/user.entity.js";
import { UserDao } from "./auth/daos/user.dao.js";
import { AuthService } from "./auth/services/auth.service.js";
import { AuthController } from "./auth/controllers/auth.controller.js";
import { createAuthRouter } from "./auth/routes/auth.routes.js";
import { createWhatsappAdminRouter } from "./whatsapp-admin/whatsapp-admin.routes.js";
import { ExcludedPhone } from "./whatsapp-admin/entities/excluded-phone.entity.js";
import { createAutomationAdminRouter } from "./automation/automation-admin.routes.js";
import { createN8nIntegrationRouter } from "./integrations/n8n-admin.routes.js";
import { ChatHistory } from "./chats/entities/chat-history.entity.js";
import { ContactName } from "./chats/entities/contact-name.entity.js";
import { ChatHistoryDao } from "./chats/daos/chat-history.dao.js";
import { ChatsService } from "./chats/services/chats.service.js";
import { ChatsController } from "./chats/controllers/chats.controller.js";
import { createChatsRouter } from "./chats/routes/chats.routes.js";

const app = express();
const port = Number(process.env.PORT ?? 3000);
const enableWhatsappListener = process.env.ENABLE_WHATSAPP_LISTENER === "true";
const allowedOrigins = "http://localhost:4300"

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);
app.use(express.json());

// Inicializar bases de datos
Promise.all([AppDataSource.initialize(), CustomerServiceDataSource.initialize()])
  .then(() => {
    console.log("Bases de datos conectadas exitosamente");

    // Configurar servicios y controladores
    const userRepository = AppDataSource.getRepository(User);
    const exclusionsRepository = AppDataSource.getRepository(ExcludedPhone);
    const userDao = new UserDao(userRepository);
    const authService = new AuthService(userDao);
    const authController = new AuthController(authService);

    const chatHistoryRepository = CustomerServiceDataSource.getRepository(ChatHistory);
    const contactNameRepository = AppDataSource.getRepository(ContactName);
    const chatHistoryDao = new ChatHistoryDao(chatHistoryRepository);
    const chatsService = new ChatsService(chatHistoryDao, contactNameRepository);
    const chatsController = new ChatsController(chatsService);

    // Rutas
    app.use("/api/v1/auth", createAuthRouter(authController));
    app.use("/api/v1/whatsapp", createWhatsappAdminRouter(exclusionsRepository));
    app.use("/api/v1/automation", createAutomationAdminRouter());
    app.use("/api/v1/integrations/n8n", createN8nIntegrationRouter());
    app.use("/api/v1/chats", createChatsRouter(chatsController));

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
    console.error("Error al conectar las bases de datos:", error);
    process.exit(1);
  });
