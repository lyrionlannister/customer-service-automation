import AuthPage from "./modules/auth/pages/auth-page";
import RegisterPage from "./modules/auth/pages/register-page";
import NotFound from "./modules/common/pages/not-found";

const noAuthRouter = [
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

export default noAuthRouter;
