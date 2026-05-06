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
import { Local } from "./local/entities/local.entity.js";
import { LocalDao } from "./local/daos/local.dao.js";
import { LocalService } from "./local/services/local.service.js";
import { LocalController } from "./local/controllers/local.controller.js";
import { createLocalRouter } from "./local/routes/local.routes.js";
import { RepairNote } from "./repair-notes/entities/repair-note.entity.js";
import { RepairNoteDao } from "./repair-notes/daos/repair-note.dao.js";
import { RepairNoteService } from "./repair-notes/services/repair-note.service.js";
import { RepairNoteController } from "./repair-notes/controllers/repair-note.controller.js";
import { createRepairNoteRouter } from "./repair-notes/routes/repair-note.routes.js";
import { MessageTemplate } from "./message-templates/entities/message-template.entity.js";
import { MessageTemplateDao } from "./message-templates/daos/message-template.dao.js";
import { MessageTemplateService } from "./message-templates/services/message-template.service.js";
import { MessageTemplateController } from "./message-templates/controllers/message-template.controller.js";
import { createMessageTemplateRouter } from "./message-templates/routes/message-template.routes.js";
import { PriceListItem } from "./price-list/entities/price-list-item.entity.js";
import { PriceListDao } from "./price-list/daos/price-list.dao.js";
import { PriceListService } from "./price-list/services/price-list.service.js";
import { PriceListController } from "./price-list/controllers/price-list.controller.js";
import { createPriceListRouter } from "./price-list/routes/price-list.routes.js";
import { Supplier } from "./suppliers/entities/supplier.entity.js";
import { SupplierDao } from "./suppliers/daos/supplier.dao.js";
import { SupplierService } from "./suppliers/services/supplier.service.js";
import { SupplierController } from "./suppliers/controllers/supplier.controller.js";
import { createSupplierRouter } from "./suppliers/routes/supplier.routes.js";
import { Notification } from "./notifications/entities/notification.entity.js";
import { NotificationDao } from "./notifications/daos/notification.dao.js";
import { NotificationService } from "./notifications/services/notification.service.js";
import { NotificationController } from "./notifications/controllers/notification.controller.js";
import { createNotificationRouter } from "./notifications/routes/notification.routes.js";
import { createN8nPublicRouter } from "./n8n/n8n-public.routes.js";

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
  .then(async () => {
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

    const localRepository = AppDataSource.getRepository(Local);
    const localDao = new LocalDao(localRepository);
    const localService = new LocalService(localDao);
    const localController = new LocalController(localService);

    const repairNoteRepository = AppDataSource.getRepository(RepairNote);
    const repairNoteDao = new RepairNoteDao(repairNoteRepository);
    const repairNoteService = new RepairNoteService(repairNoteDao, localService);
    const repairNoteController = new RepairNoteController(repairNoteService);

    const messageTemplateRepository = AppDataSource.getRepository(MessageTemplate);
    const messageTemplateDao = new MessageTemplateDao(messageTemplateRepository);
    const messageTemplateService = new MessageTemplateService(messageTemplateDao);
    const messageTemplateController = new MessageTemplateController(messageTemplateService);

    const supplierRepository = AppDataSource.getRepository(Supplier);
    const supplierDao = new SupplierDao(supplierRepository);
    const supplierService = new SupplierService(supplierDao);
    await supplierService.seed();
    const supplierController = new SupplierController(supplierService);

    const priceListRepository = AppDataSource.getRepository(PriceListItem);
    const priceListDao = new PriceListDao(priceListRepository);
    const priceListService = new PriceListService(priceListDao);
    const priceListController = new PriceListController(priceListService, supplierService);

    const notificationRepository = AppDataSource.getRepository(Notification);
    const notificationDao = new NotificationDao(notificationRepository);
    const notificationService = new NotificationService(notificationDao);
    const notificationController = new NotificationController(notificationService);

    await messageTemplateService.seed();

    // Rutas
    app.use("/api/v1/auth", createAuthRouter(authController));
    app.use("/api/v1/whatsapp", createWhatsappAdminRouter(exclusionsRepository));
    app.use("/api/v1/automation", createAutomationAdminRouter());
    app.use("/api/v1/integrations/n8n", createN8nIntegrationRouter());
    app.use("/api/v1/chats", createChatsRouter(chatsController));
    app.use("/api/v1/local", createLocalRouter(localController));
    app.use("/api/v1/repair-notes", createRepairNoteRouter(repairNoteController));
    app.use("/api/v1/message-templates", createMessageTemplateRouter(messageTemplateController));
    app.use("/api/v1/suppliers", createSupplierRouter(supplierController));
    app.use("/api/v1/price-list", createPriceListRouter(priceListController));
    app.use("/api/v1/notifications", createNotificationRouter(notificationController));
    app.use("/api/v1/n8n", createN8nPublicRouter(messageTemplateDao, priceListDao, repairNoteDao));

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
