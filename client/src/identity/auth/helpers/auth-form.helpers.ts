import type { AuthFormData, RegisterFormData } from "../types/auth-form.types";

export function updateAuthFormField(
  prev: AuthFormData,
  name: string,
  value: string,
): AuthFormData {
  return {
    ...prev,
    [name]: value,
  };
}

export function updateRegisterFormField(
  prev: RegisterFormData,
  name: string,
  value: string,
): RegisterFormData {
  return {
    ...prev,
    [name]: value,
  };
}
