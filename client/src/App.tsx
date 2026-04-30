import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import SignInLayout from "./modules/common/layouts/sign-in-layout";
import noAuthRouter from "./router";

const isAuthenticated = (): boolean => {
  const token = sessionStorage.getItem("accessToken");
  const user = sessionStorage.getItem("user");
  return Boolean(token && user);
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/admin/sign-in" replace />;
  }

  return <>{children}</>;
};

const LoginOnlyWhenLoggedOut: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (isAuthenticated()) {
    return <Navigate to="/admin/whatsapp" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <SignInLayout />
            </ProtectedRoute>
          }
        >
          <Route
            path="/"
            element={
              <div className="flex items-center justify-center">
                <img src="images/logo.png" />
              </div>
            }
          />
        </Route>

        {noAuthRouter.map((route, index) => {
          const isSignInRoute = route.path === "/admin/sign-in";

          return (
            <Route
              key={index}
              path={route.path}
              element={
                isSignInRoute ? (
                  <LoginOnlyWhenLoggedOut>{route.element}</LoginOnlyWhenLoggedOut>
                ) : (
                  <ProtectedRoute>{route.element}</ProtectedRoute>
                )
              }
            />
          );
        })}
      </Routes>
    </BrowserRouter>
  );
};

export default App;
