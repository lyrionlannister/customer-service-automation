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
import { RepairNoteItem } from "./repair-notes/entities/repair-note-item.entity.js";
import { RepairNoteItemDao } from "./repair-notes/daos/repair-note-item.dao.js";
import { RepairNoteServiceType } from "./repair-notes/entities/repair-note-service-type.entity.js";
import { RepairNoteServiceTypeDao } from "./repair-notes/daos/repair-note-service-type.dao.js";
import { ServiceType } from "./service-types/entities/service-type.entity.js";
import { ServiceTypeDao } from "./service-types/daos/service-type.dao.js";
import { ServiceTypeService } from "./service-types/services/service-type.service.js";
import { ServiceTypeController } from "./service-types/controllers/service-type.controller.js";
import { createServiceTypeRouter } from "./service-types/routes/service-type.routes.js";
import { InventoryItem } from "./inventory/entities/inventory-item.entity.js";
import { InventoryMovement } from "./inventory/entities/inventory-movement.entity.js";
import { InventoryItemDao } from "./inventory/daos/inventory-item.dao.js";
import { InventoryMovementDao } from "./inventory/daos/inventory-movement.dao.js";
import { InventoryService } from "./inventory/services/inventory.service.js";
import { InventoryController } from "./inventory/controllers/inventory.controller.js";
import { createInventoryRouter } from "./inventory/routes/inventory.routes.js";
import { Sale } from "./inventory/entities/sale.entity.js";
import { SaleItem } from "./inventory/entities/sale-item.entity.js";
import { SaleDao } from "./inventory/daos/sale.dao.js";
import { SaleItemDao } from "./inventory/daos/sale-item.dao.js";
import { SaleService } from "./inventory/services/sale.service.js";
import { SaleController } from "./inventory/controllers/sale.controller.js";
import { createSaleRouter } from "./inventory/routes/sale.routes.js";
import { createN8nPublicRouter } from "./n8n/n8n-public.routes.js";
import { ImportStagingService } from "./import-staging/services/import-staging.service.js";
import { ImportStagingController } from "./import-staging/controllers/import-staging.controller.js";
import { createImportStagingRouter } from "./import-staging/routes/import-staging.routes.js";
import { redisClient } from "./config/redis-client.js";
import { PdfRendererService } from "./pdf/pdf-renderer.service.js";
import { Quote } from "./quotes/entities/quote.entity.js";
import { QuoteItem } from "./quotes/entities/quote-item.entity.js";
import { QuoteDao } from "./quotes/daos/quote.dao.js";
import { QuoteItemDao } from "./quotes/daos/quote-item.dao.js";
import { QuoteService } from "./quotes/services/quote.service.js";
import { QuoteController } from "./quotes/controllers/quote.controller.js";
import { createQuoteRouter } from "./quotes/routes/quote.routes.js";
import { CashSession } from "./cash/entities/cash-session.entity.js";
import { CashMovement } from "./cash/entities/cash-movement.entity.js";
import { CashSessionDao } from "./cash/daos/cash-session.dao.js";
import { CashMovementDao } from "./cash/daos/cash-movement.dao.js";
import { CashService } from "./cash/services/cash.service.js";
import { CashController } from "./cash/controllers/cash.controller.js";
import { createCashRouter } from "./cash/routes/cash.routes.js";
import { RevenueAttributionSetting } from "./revenue-attribution/entities/revenue-attribution-setting.entity.js";
import { RevenueAttributionSettingDao } from "./revenue-attribution/daos/revenue-attribution-setting.dao.js";
import { RevenueAttributionService } from "./revenue-attribution/services/revenue-attribution.service.js";
import { RevenueAttributionController } from "./revenue-attribution/controllers/revenue-attribution.controller.js";
import { createRevenueAttributionRouter } from "./revenue-attribution/routes/revenue-attribution.routes.js";
import { ReportsService } from "./reports/services/reports.service.js";
import { ReportsController } from "./reports/controllers/reports.controller.js";
import { createReportsRouter } from "./reports/routes/reports.routes.js";
import { Branch } from "./branches/entities/branch.entity.js";
import { BranchDao } from "./branches/daos/branch.dao.js";
import { BranchService } from "./branches/services/branch.service.js";
import { BranchController } from "./branches/controllers/branch.controller.js";
import { createBranchRouter } from "./branches/routes/branch.routes.js";
import { Customer } from "./customers/entities/customer.entity.js";
import { CustomerDao } from "./customers/daos/customer.dao.js";
import { CustomerService } from "./customers/services/customer.service.js";
import { CustomerController } from "./customers/controllers/customer.controller.js";
import { createCustomerRouter } from "./customers/routes/customer.routes.js";
import { seedAdminUser } from "./seed/admin-seed.js";
import { Tenant } from "./tenancy/entities/tenant.entity.js";
import { allowSystemScope, runWithTenant } from "./tenancy/tenant-context.js";

const app = express();
const port = Number(process.env.PORT ?? 3000);
const enableWhatsappListener = process.env.ENABLE_WHATSAPP_LISTENER === "true";
const allowedOrigins = ["http://localhost:4300", "https://app.kaltra.local"];

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

    const userRepository = AppDataSource.getRepository(User);
    const tenantRepository = AppDataSource.getRepository(Tenant);
    await seedAdminUser(userRepository, tenantRepository);

    // Configurar servicios y controladores
    const exclusionsRepository = AppDataSource.getRepository(ExcludedPhone);
    const userDao = new UserDao(userRepository);
    const authService = new AuthService(userDao, tenantRepository);
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

    const inventoryItemRepository = AppDataSource.getRepository(InventoryItem);
    const inventoryMovementRepository = AppDataSource.getRepository(InventoryMovement);
    const inventoryItemDao = new InventoryItemDao(inventoryItemRepository);
    const inventoryMovementDao = new InventoryMovementDao(inventoryMovementRepository);
    const inventoryService = new InventoryService(inventoryItemDao, inventoryMovementDao);
    const inventoryController = new InventoryController(inventoryService);

    const saleRepository = AppDataSource.getRepository(Sale);
    const saleItemRepository = AppDataSource.getRepository(SaleItem);
    const saleDao = new SaleDao(saleRepository);
    const saleItemDao = new SaleItemDao(saleItemRepository);
    const saleService = new SaleService(saleDao, saleItemDao, inventoryService);
    const saleController = new SaleController(saleService);

    const serviceTypeRepository = AppDataSource.getRepository(ServiceType);
    const serviceTypeDao = new ServiceTypeDao(serviceTypeRepository);
    const serviceTypeService = new ServiceTypeService(serviceTypeDao);
    const serviceTypeController = new ServiceTypeController(serviceTypeService);

    const repairNoteRepository = AppDataSource.getRepository(RepairNote);
    const repairNoteItemRepository = AppDataSource.getRepository(RepairNoteItem);
    const repairNoteServiceTypeRepository = AppDataSource.getRepository(RepairNoteServiceType);
    const repairNoteDao = new RepairNoteDao(repairNoteRepository);
    const repairNoteItemDao = new RepairNoteItemDao(repairNoteItemRepository);
    const repairNoteServiceTypeDao = new RepairNoteServiceTypeDao(repairNoteServiceTypeRepository);
    const repairNoteService = new RepairNoteService(
      repairNoteDao,
      localService,
      repairNoteItemDao,
      inventoryService,
      repairNoteServiceTypeDao,
      serviceTypeDao,
    );
    const pdfRendererService = new PdfRendererService();
    const repairNoteController = new RepairNoteController(
      repairNoteService,
      localService,
      pdfRendererService,
      authService,
    );

    const quoteRepository = AppDataSource.getRepository(Quote);
    const quoteItemRepository = AppDataSource.getRepository(QuoteItem);
    const quoteDao = new QuoteDao(quoteRepository);
    const quoteItemDao = new QuoteItemDao(quoteItemRepository);
    const quoteService = new QuoteService(quoteDao, quoteItemDao);
    const quoteController = new QuoteController(quoteService, localService, pdfRendererService);

    const cashSessionRepository = AppDataSource.getRepository(CashSession);
    const cashMovementRepository = AppDataSource.getRepository(CashMovement);
    const cashSessionDao = new CashSessionDao(cashSessionRepository);
    const cashMovementDao = new CashMovementDao(cashMovementRepository);
    const cashService = new CashService(cashSessionDao, cashMovementDao, localService);
    const cashController = new CashController(cashService);

    const revenueAttributionRepository = AppDataSource.getRepository(RevenueAttributionSetting);
    const revenueAttributionDao = new RevenueAttributionSettingDao(revenueAttributionRepository);
    const revenueAttributionService = new RevenueAttributionService(revenueAttributionDao);
    const revenueAttributionController = new RevenueAttributionController(revenueAttributionService);

    const reportsService = new ReportsService(
      repairNoteDao,
      repairNoteItemDao,
      saleDao,
      saleItemDao,
      inventoryItemDao,
      userDao,
      revenueAttributionService,
      serviceTypeDao,
      repairNoteServiceTypeDao,
    );
    const reportsController = new ReportsController(reportsService);

    const messageTemplateRepository = AppDataSource.getRepository(MessageTemplate);
    const messageTemplateDao = new MessageTemplateDao(messageTemplateRepository);
    const messageTemplateService = new MessageTemplateService(messageTemplateDao);
    const messageTemplateController = new MessageTemplateController(messageTemplateService);

    const supplierRepository = AppDataSource.getRepository(Supplier);
    const supplierDao = new SupplierDao(supplierRepository);
    const supplierService = new SupplierService(supplierDao);
    const supplierController = new SupplierController(supplierService);

    const priceListRepository = AppDataSource.getRepository(PriceListItem);
    const priceListDao = new PriceListDao(priceListRepository);
    const priceListService = new PriceListService(priceListDao);
    const priceListController = new PriceListController(priceListService);

    const importStagingService = new ImportStagingService(redisClient, priceListDao);
    const importStagingController = new ImportStagingController(importStagingService);

    const branchRepository = AppDataSource.getRepository(Branch);
    const branchDao = new BranchDao(branchRepository);
    const branchService = new BranchService(branchDao);
    const branchController = new BranchController(branchService);

    const customerRepository = AppDataSource.getRepository(Customer);
    const customerDao = new CustomerDao(customerRepository);
    const customerService = new CustomerService(customerDao, repairNoteDao);
    const customerController = new CustomerController(customerService);

    const notificationRepository = AppDataSource.getRepository(Notification);
    const notificationDao = new NotificationDao(notificationRepository);
    const notificationService = new NotificationService(notificationDao);
    const notificationController = new NotificationController(notificationService);

    // Seed de defaults (proveedores, plantillas) por cada tenant existente.
    // Idempotente: "seed" de cada servicio ya revisa si el dato existe antes
    // de crearlo. Un tenant creado via /register se sembrara en el proximo
    // arranque del servidor, no al instante -- simplificacion aceptada por
    // ahora, no es una garantia de aislamiento, solo de datos default.
    const allTenants = await allowSystemScope(() => tenantRepository.find());
    for (const tenant of allTenants) {
      await runWithTenant(tenant.id, async () => {
        await supplierService.seed();
        await messageTemplateService.seed();
        await serviceTypeService.seed();
        const localConfig = await localService.getConfig();
        await branchService.seed({
          name: localConfig.name,
          address: localConfig.address,
          phone: localConfig.phone,
        });
      });
    }

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
    app.use("/api/v1/import-staging", createImportStagingRouter(importStagingController));
    app.use("/api/v1/notifications", createNotificationRouter(notificationController));
    app.use("/api/v1/inventory", createInventoryRouter(inventoryController));
    app.use("/api/v1/sales", createSaleRouter(saleController));
    app.use("/api/v1/quotes", createQuoteRouter(quoteController));
    app.use("/api/v1/cash", createCashRouter(cashController));
    app.use("/api/v1/settings", createRevenueAttributionRouter(revenueAttributionController));
    app.use("/api/v1/reports", createReportsRouter(reportsController));
    app.use("/api/v1/service-types", createServiceTypeRouter(serviceTypeController));
    app.use("/api/v1/branches", createBranchRouter(branchController));
    app.use("/api/v1/customers", createCustomerRouter(customerController));
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
