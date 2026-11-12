import "reflect-metadata";
import express from "express";
import cors from "cors";
import AppDataSource from "./core/config/data-source.js";
import CustomerServiceDataSource from "./core/config/customer-service-data-source.js";
import { listener } from "./messaging/whatsapp/whatsapp-service.js";
import { User } from "./identity/auth/entities/user.entity.js";
import { UserDao } from "./identity/auth/daos/user.dao.js";
import { AuthService } from "./identity/auth/services/auth.service.js";
import { AuthController } from "./identity/auth/controllers/auth.controller.js";
import { createAuthRouter } from "./identity/auth/routes/auth.routes.js";
import { createWhatsappAdminRouter } from "./messaging/whatsapp-admin/whatsapp-admin.routes.js";
import { ExcludedPhone } from "./messaging/whatsapp-admin/entities/excluded-phone.entity.js";
import { createAutomationAdminRouter } from "./app_platform/automation/automation-admin.routes.js";
import { createN8nIntegrationRouter } from "./app_platform/integrations/n8n-admin.routes.js";
import { ChatHistory } from "./messaging/chats/entities/chat-history.entity.js";
import { ContactName } from "./messaging/chats/entities/contact-name.entity.js";
import { ChatHistoryDao } from "./messaging/chats/daos/chat-history.dao.js";
import { ChatsService } from "./messaging/chats/services/chats.service.js";
import { ChatsController } from "./messaging/chats/controllers/chats.controller.js";
import { createChatsRouter } from "./messaging/chats/routes/chats.routes.js";
import { Local } from "./app_platform/local/entities/local.entity.js";
import { LocalDao } from "./app_platform/local/daos/local.dao.js";
import { LocalService } from "./app_platform/local/services/local.service.js";
import { LocalController } from "./app_platform/local/controllers/local.controller.js";
import { createLocalRouter } from "./app_platform/local/routes/local.routes.js";
import { RepairNote } from "./commerce/repair-notes/entities/repair-note.entity.js";
import { RepairNoteDao } from "./commerce/repair-notes/daos/repair-note.dao.js";
import { RepairNoteService } from "./commerce/repair-notes/services/repair-note.service.js";
import { RepairNoteController } from "./commerce/repair-notes/controllers/repair-note.controller.js";
import { createRepairNoteRouter } from "./commerce/repair-notes/routes/repair-note.routes.js";
import { MessageTemplate } from "./messaging/message-templates/entities/message-template.entity.js";
import { MessageTemplateDao } from "./messaging/message-templates/daos/message-template.dao.js";
import { MessageTemplateService } from "./messaging/message-templates/services/message-template.service.js";
import { MessageTemplateController } from "./messaging/message-templates/controllers/message-template.controller.js";
import { createMessageTemplateRouter } from "./messaging/message-templates/routes/message-template.routes.js";
import { PriceListItem } from "./commerce/price-list/entities/price-list-item.entity.js";
import { PriceListDao } from "./commerce/price-list/daos/price-list.dao.js";
import { PriceListService } from "./commerce/price-list/services/price-list.service.js";
import { PriceListController } from "./commerce/price-list/controllers/price-list.controller.js";
import { createPriceListRouter } from "./commerce/price-list/routes/price-list.routes.js";
import { Supplier } from "./commerce/suppliers/entities/supplier.entity.js";
import { SupplierDao } from "./commerce/suppliers/daos/supplier.dao.js";
import { SupplierService } from "./commerce/suppliers/services/supplier.service.js";
import { SupplierController } from "./commerce/suppliers/controllers/supplier.controller.js";
import { createSupplierRouter } from "./commerce/suppliers/routes/supplier.routes.js";
import { Notification } from "./messaging/notifications/entities/notification.entity.js";
import { NotificationDao } from "./messaging/notifications/daos/notification.dao.js";
import { NotificationService } from "./messaging/notifications/services/notification.service.js";
import { NotificationController } from "./messaging/notifications/controllers/notification.controller.js";
import { createNotificationRouter } from "./messaging/notifications/routes/notification.routes.js";
import { RepairNoteItem } from "./commerce/repair-notes/entities/repair-note-item.entity.js";
import { RepairNoteItemDao } from "./commerce/repair-notes/daos/repair-note-item.dao.js";
import { RepairNoteServiceType } from "./commerce/repair-notes/entities/repair-note-service-type.entity.js";
import { RepairNoteServiceTypeDao } from "./commerce/repair-notes/daos/repair-note-service-type.dao.js";
import { ServiceType } from "./commerce/service-types/entities/service-type.entity.js";
import { ServiceTypeDao } from "./commerce/service-types/daos/service-type.dao.js";
import { ServiceTypeService } from "./commerce/service-types/services/service-type.service.js";
import { ServiceTypeController } from "./commerce/service-types/controllers/service-type.controller.js";
import { createServiceTypeRouter } from "./commerce/service-types/routes/service-type.routes.js";
import { InventoryItem } from "./commerce/inventory/entities/inventory-item.entity.js";
import { InventoryMovement } from "./commerce/inventory/entities/inventory-movement.entity.js";
import { InventoryItemDao } from "./commerce/inventory/daos/inventory-item.dao.js";
import { InventoryMovementDao } from "./commerce/inventory/daos/inventory-movement.dao.js";
import { InventoryService } from "./commerce/inventory/services/inventory.service.js";
import { InventoryController } from "./commerce/inventory/controllers/inventory.controller.js";
import { createInventoryRouter } from "./commerce/inventory/routes/inventory.routes.js";
import { Sale } from "./commerce/inventory/entities/sale.entity.js";
import { SaleItem } from "./commerce/inventory/entities/sale-item.entity.js";
import { SaleDao } from "./commerce/inventory/daos/sale.dao.js";
import { SaleItemDao } from "./commerce/inventory/daos/sale-item.dao.js";
import { SaleService } from "./commerce/inventory/services/sale.service.js";
import { SaleController } from "./commerce/inventory/controllers/sale.controller.js";
import { createSaleRouter } from "./commerce/inventory/routes/sale.routes.js";
import { createN8nPublicRouter } from "./messaging/n8n/n8n-public.routes.js";
import { ImportStagingService } from "./app_platform/import-staging/services/import-staging.service.js";
import { ImportStagingController } from "./app_platform/import-staging/controllers/import-staging.controller.js";
import { createImportStagingRouter } from "./app_platform/import-staging/routes/import-staging.routes.js";
import { redisClient } from "./core/config/redis-client.js";
import { PdfRendererService } from "./reporting/pdf/pdf-renderer.service.js";
import { Quote } from "./commerce/quotes/entities/quote.entity.js";
import { QuoteItem } from "./commerce/quotes/entities/quote-item.entity.js";
import { QuoteDao } from "./commerce/quotes/daos/quote.dao.js";
import { QuoteItemDao } from "./commerce/quotes/daos/quote-item.dao.js";
import { QuoteService } from "./commerce/quotes/services/quote.service.js";
import { QuoteController } from "./commerce/quotes/controllers/quote.controller.js";
import { createQuoteRouter } from "./commerce/quotes/routes/quote.routes.js";
import { CashSession } from "./commerce/cash/entities/cash-session.entity.js";
import { CashMovement } from "./commerce/cash/entities/cash-movement.entity.js";
import { CashSessionDao } from "./commerce/cash/daos/cash-session.dao.js";
import { CashMovementDao } from "./commerce/cash/daos/cash-movement.dao.js";
import { CashService } from "./commerce/cash/services/cash.service.js";
import { CashController } from "./commerce/cash/controllers/cash.controller.js";
import { createCashRouter } from "./commerce/cash/routes/cash.routes.js";
import { RevenueAttributionSetting } from "./commerce/revenue-attribution/entities/revenue-attribution-setting.entity.js";
import { RevenueAttributionSettingDao } from "./commerce/revenue-attribution/daos/revenue-attribution-setting.dao.js";
import { RevenueAttributionService } from "./commerce/revenue-attribution/services/revenue-attribution.service.js";
import { RevenueAttributionController } from "./commerce/revenue-attribution/controllers/revenue-attribution.controller.js";
import { createRevenueAttributionRouter } from "./commerce/revenue-attribution/routes/revenue-attribution.routes.js";
import { ReportsService } from "./reporting/reports/services/reports.service.js";
import { ReportsController } from "./reporting/reports/controllers/reports.controller.js";
import { createReportsRouter } from "./reporting/reports/routes/reports.routes.js";
import { Branch } from "./identity/branches/entities/branch.entity.js";
import { BranchDao } from "./identity/branches/daos/branch.dao.js";
import { BranchService } from "./identity/branches/services/branch.service.js";
import { BranchController } from "./identity/branches/controllers/branch.controller.js";
import { createBranchRouter } from "./identity/branches/routes/branch.routes.js";
import { Customer } from "./commerce/customers/entities/customer.entity.js";
import { CustomerDao } from "./commerce/customers/daos/customer.dao.js";
import { CustomerService } from "./commerce/customers/services/customer.service.js";
import { CustomerController } from "./commerce/customers/controllers/customer.controller.js";
import { createCustomerRouter } from "./commerce/customers/routes/customer.routes.js";
import { seedAdminUser } from "./core/seed/admin-seed.js";
import { Tenant } from "./core/tenancy/entities/tenant.entity.js";
import { allowSystemScope, runWithTenant } from "./core/tenancy/tenant-context.js";

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
