import WhatsAppAdminPage from "../modules/whatsapp/pages/whatsapp-admin-page";
import ChatsPage from "../modules/chats/pages/chats-page";
import AuthPage from "../modules/auth/pages/auth-page";
import RegisterPage from "../modules/auth/pages/register-page";
import NotFound from "../modules/common/pages/not-found";
import DashboardPage from "../modules/chats/pages/dashboard-page";
import UsersPage from "../modules/users/pages/users-page";
import LocalPage from "../modules/local/pages/local-page";
import RepairNotesPage from "../modules/repair-notes/pages/repair-notes-page";
import RepairNoteFormPage from "../modules/repair-notes/pages/repair-note-form-page";
import RepairNotePrintPage from "../modules/repair-notes/pages/repair-note-print-page";
import MessageTemplatesPage from "../modules/message-templates/pages/message-templates-page";
import PriceListPage from "../modules/price-list/pages/price-list-page";
import ImportPriceListPage from "../modules/price-list/pages/import-price-list-page";
import InventoryPage from "../modules/inventory/pages/inventory-page";
import QuickSalePage from "../modules/inventory/pages/quick-sale-page";
import QuotesPage from "../modules/quotes/pages/quotes-page";
import QuoteFormPage from "../modules/quotes/pages/quote-form-page";
import QuotePrintPage from "../modules/quotes/pages/quote-print-page";
import CashPage from "../modules/cash/pages/cash-page";
import SuppliersPage from "../modules/suppliers/pages/suppliers-page";
import BranchesPage from "../modules/branches/pages/branches-page";
import CustomersPage from "../modules/customers/pages/customers-page";

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
