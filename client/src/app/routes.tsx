import WhatsAppAdminPage from "../messaging/whatsapp/pages/whatsapp-admin-page";
import ChatsPage from "../messaging/chats/pages/chats-page";
import AuthPage from "../identity/auth/pages/auth-page";
import RegisterPage from "../identity/auth/pages/register-page";
import NotFound from "../core/common/pages/not-found";
import DashboardPage from "../messaging/chats/pages/dashboard-page";
import UsersPage from "../identity/users/pages/users-page";
import LocalPage from "../app_platform/local/pages/local-page";
import RepairNotesPage from "../commerce/repair-notes/pages/repair-notes-page";
import RepairNoteFormPage from "../commerce/repair-notes/pages/repair-note-form-page";
import RepairNotePrintPage from "../commerce/repair-notes/pages/repair-note-print-page";
import MessageTemplatesPage from "../messaging/message-templates/pages/message-templates-page";
import PriceListPage from "../commerce/price-list/pages/price-list-page";
import ImportPriceListPage from "../commerce/price-list/pages/import-price-list-page";
import InventoryPage from "../commerce/inventory/pages/inventory-page";
import QuickSalePage from "../commerce/inventory/pages/quick-sale-page";
import QuotesPage from "../commerce/quotes/pages/quotes-page";
import QuoteFormPage from "../commerce/quotes/pages/quote-form-page";
import QuotePrintPage from "../commerce/quotes/pages/quote-print-page";
import CashPage from "../commerce/cash/pages/cash-page";
import SuppliersPage from "../commerce/suppliers/pages/suppliers-page";
import BranchesPage from "../identity/branches/pages/branches-page";
import CustomersPage from "../commerce/customers/pages/customers-page";

export const publicRoutes = [
  {
    path: "/admin/sign-in",
    element: <AuthPage />,
  },
  {
    path: "/admin/sign-up",
    element: <RegisterPage />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export const protectedRoutes = [
  {
    path: "/admin/dashboard",
    element: <DashboardPage />,
  },
  {
    path: "/admin/whatsapp",
    element: <WhatsAppAdminPage />,
  },
  {
    path: "/admin/chats",
    element: <ChatsPage />,
  },
  {
    path: "/admin/users",
    element: <UsersPage />,
  },
  {
    path: "/admin/local",
    element: <LocalPage />,
  },
  {
    path: "/admin/repair-notes",
    element: <RepairNotesPage />,
  },
  {
    path: "/admin/repair-notes/new",
    element: <RepairNoteFormPage />,
  },
  {
    path: "/admin/repair-notes/:id/edit",
    element: <RepairNoteFormPage />,
  },
  {
    path: "/admin/repair-notes/:id/print",
    element: <RepairNotePrintPage />,
  },
  {
    path: "/admin/templates",
    element: <MessageTemplatesPage />,
  },
  {
    path: "/admin/suppliers",
    element: <SuppliersPage />,
  },
  {
    path: "/admin/branches",
    element: <BranchesPage />,
  },
  {
    path: "/admin/customers",
    element: <CustomersPage />,
  },
  {
    path: "/admin/price-list",
    element: <PriceListPage />,
  },
  {
    path: "/admin/price-list/import",
    element: <ImportPriceListPage />,
  },
  {
    path: "/admin/inventory",
    element: <InventoryPage />,
  },
  {
    path: "/admin/sales/new",
    element: <QuickSalePage />,
  },
  {
    path: "/admin/quotes",
    element: <QuotesPage />,
  },
  {
    path: "/admin/quotes/new",
    element: <QuoteFormPage />,
  },
  {
    path: "/admin/quotes/:id/edit",
    element: <QuoteFormPage />,
  },
  {
    path: "/admin/quotes/:id/print",
    element: <QuotePrintPage />,
  },
  {
    path: "/admin/cash",
    element: <CashPage />,
  },
];

export default publicRoutes;
