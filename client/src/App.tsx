import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import SignInLayout from "./modules/common/layouts/sign-in-layout";
import { publicRoutes, protectedRoutes } from "./router";

const isAuthenticated = (): boolean => {
  const token = sessionStorage.getItem("accessToken");
  const user = sessionStorage.getItem("user");
  return Boolean(token && user);
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  if (!isAuthenticated()) {
    return <Navigate to="/admin/sign-in" replace />;
  }

  return <>{children}</>;
};

const LoginOnlyWhenLoggedOut: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  if (isAuthenticated()) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

        {publicRoutes.map((route, index) => {
          const isAuthRoute =
            route.path === "/admin/sign-in" || route.path === "/admin/sign-up";

          return (
            <Route
              key={index}
              path={route.path}
              element={
                isAuthRoute ? (
                  <LoginOnlyWhenLoggedOut>
                    {route.element}
                  </LoginOnlyWhenLoggedOut>
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
          <Route index element={<Navigate to="whatsapp" replace />} />
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

export default App;
