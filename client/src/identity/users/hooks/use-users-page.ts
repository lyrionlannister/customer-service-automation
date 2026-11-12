import { useCallback, useState } from "react";

import type { PayCycle, UserRole } from "./use-users";

export interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  salaryAmount: string;
  payCycle: PayCycle | "";
}

export const INITIAL_USER_FORM: UserFormData = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  role: "employee",
  salaryAmount: "",
  payCycle: "",
};

export const useUsersPage = ({
  createUser,
  fetchUsers,
  clearCreateError,
  clearCreateSuccess,
}: {
  createUser: (payload: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: UserRole;
    salaryAmount?: number;
    payCycle?: PayCycle;
  }) => Promise<unknown>;
  fetchUsers: () => Promise<void>;
  clearCreateError: () => void;
  clearCreateSuccess: () => void;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<UserFormData>(INITIAL_USER_FORM);
  const [showPassword, setShowPassword] = useState(false);

  const updateField = useCallback(
    (field: keyof UserFormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const resetForm = useCallback(() => {
    setFormData(INITIAL_USER_FORM);
    setShowPassword(false);
  }, []);

  const submit = useCallback(async () => {
    clearCreateError();
    clearCreateSuccess();

    const result = await createUser({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      salaryAmount: formData.salaryAmount ? Number(formData.salaryAmount) : undefined,
      payCycle: formData.payCycle || undefined,
    });

    if (result) {
      setFormData(INITIAL_USER_FORM);
      await fetchUsers();
      setTimeout(() => {
        setIsModalOpen(false);
        clearCreateSuccess();
      }, 1500);
    }
  }, [clearCreateError, clearCreateSuccess, createUser, fetchUsers, formData]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    resetForm();
    clearCreateError();
    clearCreateSuccess();
  }, [clearCreateError, clearCreateSuccess, resetForm]);

  return {
    isModalOpen,
    formData,
    showPassword,
    setIsModalOpen,
    setShowPassword,
    updateField,
    resetForm,
    submit,
    closeModal,
  };
};
