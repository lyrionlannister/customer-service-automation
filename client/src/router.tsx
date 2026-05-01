import WhatsAppAdminPage from "./modules/whatsapp/pages/whatsapp-admin-page";
import ChatsPage from "./modules/chats/pages/chats-page";
import AuthPage from "./modules/auth/pages/auth-page";
import RegisterPage from "./modules/auth/pages/register-page";
import NotFound from "./modules/common/pages/not-found";

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
    path: "/admin/whatsapp",
    element: <WhatsAppAdminPage />,
  },
  {
    path: "/admin/chats",
    element: <ChatsPage />,
  },
];

export default publicRoutes;
