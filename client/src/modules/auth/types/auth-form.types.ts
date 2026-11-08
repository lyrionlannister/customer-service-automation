import type { ReactNode } from "react";

export interface AuthLayoutProps {
  children: ReactNode;
}

export interface AuthFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}
