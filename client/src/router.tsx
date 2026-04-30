import AuthPage from "./modules/auth/pages/AuthPage";
import NotFound from "./modules/common/pages/NotFound";

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
