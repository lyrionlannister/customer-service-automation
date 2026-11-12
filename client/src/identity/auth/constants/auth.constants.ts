import type { AuthFormData, RegisterFormData } from "../types/auth-form.types";

export const AUTH_REDIRECT_DELAY_MS = 1000;
export const REGISTER_REDIRECT_DELAY_MS = 2000;

export const INITIAL_AUTH_FORM_DATA: AuthFormData = {
  email: "",
  password: "",
};

export const INITIAL_REGISTER_FORM_DATA: RegisterFormData = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
};
