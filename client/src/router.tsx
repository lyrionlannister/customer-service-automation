import WhatsAppAdminPage from "./modules/whatsapp/pages/whatsapp-admin-page";
import ChatsPage from "./modules/chats/pages/chats-page";
import AuthPage from "./modules/auth/pages/auth-page";
import RegisterPage from "./modules/auth/pages/register-page";
import NotFound from "./modules/common/pages/not-found";
import DashboardPage from "./modules/chats/pages/dashboard-page";
import UsersPage from "./modules/users/pages/users-page";
import LocalPage from "./modules/local/pages/local-page";
import RepairNotesPage from "./modules/repair-notes/pages/repair-notes-page";
import RepairNoteFormPage from "./modules/repair-notes/pages/repair-note-form-page";
import RepairNotePrintPage from "./modules/repair-notes/pages/repair-note-print-page";
import MessageTemplatesPage from "./modules/message-templates/pages/message-templates-page";
import PriceListPage from "./modules/price-list/pages/price-list-page";
import ImportPriceListPage from "./modules/price-list/pages/import-price-list-page";

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
    path: "/admin/price-list",
    element: <PriceListPage />,
  },
  {
    path: "/admin/price-list/import",
    element: <ImportPriceListPage />,
  },
];

export default publicRoutes;
