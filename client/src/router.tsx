import AuthPage from "./modules/auth/pages/auth-page";
import NotFound from "./modules/common/pages/not-found";

const noAuthRouter = [
  {
    path: "/admin/sign-in",
    element: <AuthPage />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export default noAuthRouter;
