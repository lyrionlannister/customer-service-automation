import { Navigate } from "react-router";
import type { ReactNode } from "react";

export const isAuthenticated = (): boolean => {
  const token = sessionStorage.getItem("accessToken");
  const user = sessionStorage.getItem("user");

  return Boolean(token && user);
};

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/admin/sign-in" replace />;
  }

  return <>{children}</>;
};

export const LoginOnlyWhenLoggedOut = ({
  children,
}: {
  children: ReactNode;
}) => {
  if (isAuthenticated()) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
};
