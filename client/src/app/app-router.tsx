import { BrowserRouter, Navigate, Route, Routes } from "react-router";

import SignInLayout from "../modules/common/layouts/sign-in-layout";
import { LoginOnlyWhenLoggedOut, ProtectedRoute } from "./auth-guards";
import { protectedRoutes, publicRoutes } from "./routes";

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

        {publicRoutes.map((route, index) => {
          const isAuthRoute =
            route.path === "/admin/sign-in" || route.path === "/admin/sign-up";

          return (
            <Route
              key={`public-${index}`}
              path={route.path}
              element={
                isAuthRoute ? (
                  <LoginOnlyWhenLoggedOut>{route.element}</LoginOnlyWhenLoggedOut>
                ) : route.path === "*" ? (
                  route.element
                ) : (
                  <ProtectedRoute>{route.element}</ProtectedRoute>
                )
              }
            />
          );
        })}

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <SignInLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          {protectedRoutes.map((route, index) => (
            <Route
              key={`protected-${index}`}
              path={route.path.replace("/admin/", "")}
              element={route.element}
            />
          ))}
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
