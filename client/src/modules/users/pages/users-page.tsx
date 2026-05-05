import { useState, useEffect } from "react";
import { UserPlus } from "lucide-react";
import { useUsers } from "../hooks/use-users";
import Toggle from "@ui/toggle/toggle";
import Modal from "@ui/modal/Modal";
import Input from "@ui/inputs/input";
import Label from "@ui/inputs/label";
import Button from "@ui/button/button";
import Alert from "@ui/alert/alert";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@ui/table/table";
import { EyeIcon, EyeCloseIcon } from "@common/icons";
import PageMeta from "@common/pages/page-meta";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

const INITIAL_FORM: FormData = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
};

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

const UsersPage: React.FC = () => {
  const {
    users,
    loading,
    error,
    fetchUsers,
    createUser,
    creating,
    createError,
    createSuccess,
    clearCreateError,
    clearCreateSuccess,
    toggleUserStatus,
    togglingId,
  } = useUsers();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearCreateError();
    clearCreateSuccess();
    const result = await createUser(formData);
    if (result) {
      setFormData(INITIAL_FORM);
      fetchUsers();
      setTimeout(() => {
        setIsModalOpen(false);
        clearCreateSuccess();
      }, 1500);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData(INITIAL_FORM);
    setShowPassword(false);
    clearCreateError();
    clearCreateSuccess();
  };

  return (
    <div className="space-y-6">
      <PageMeta title="Usuarios" description="Gestión de usuarios" />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-brand-600 dark:text-brand-400">
            Usuarios
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Gestiona los usuarios del sistema.
          </p>
        </div>
        <Button
          variant="primary"
          startIcon={<UserPlus className="size-4" />}
          onClick={() => setIsModalOpen(true)}
        >
          Nuevo usuario
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
            Cargando usuarios...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-sm text-red-500">{error}</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
            No hay usuarios registrados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-200 dark:border-gray-800">
                  <TableCell
                    isHeader
                    className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                  >
                    Nombre
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                  >
                    Email
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                  >
                    Creado
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                  >
                    Estado
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow
                    key={user.id}
                    className="border-b border-gray-100 transition-colors last:border-0 hover:bg-gray-50 dark:border-gray-800/50 dark:hover:bg-white/[0.02]"
                  >
                    <TableCell className="px-6 py-4 text-sm font-medium text-gray-800 dark:text-white/90">
                      {user.firstName} {user.lastName}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {user.email}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(user.createdAt)}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Toggle
                        checked={user.isActive}
                        onChange={() => toggleUserStatus(user.id)}
                        disabled={togglingId === user.id}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        className="max-w-md p-6 sm:p-8"
      >
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            Nuevo usuario
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Completa los datos para crear un usuario.
          </p>
        </div>

        {createError && (
          <div className="mb-4">
            <Alert variant="error" title="Error" message={createError} />
          </div>
        )}

        {createSuccess && (
          <div className="mb-4">
            <Alert
              variant="success"
              title="¡Listo!"
              message="Usuario creado correctamente."
            />
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-5">
            <div>
              <Label className="text-gray-500">
                Nombre <span className="text-error-500">*</span>
              </Label>
              <Input
                placeholder="Nombre"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                disabled={creating}
              />
            </div>
            <div>
              <Label className="text-gray-500">
                Apellido <span className="text-error-500">*</span>
              </Label>
              <Input
                placeholder="Apellido"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                disabled={creating}
              />
            </div>
            <div>
              <Label className="text-gray-500">
                Email <span className="text-error-500">*</span>
              </Label>
              <Input
                type="email"
                placeholder="correo@ejemplo.com"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={creating}
              />
            </div>
            <div>
              <Label className="text-gray-500">
                Contraseña <span className="text-error-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 8 caracteres"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={creating}
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                >
                  {showPassword ? (
                    <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                  ) : (
                    <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                  )}
                </span>
              </div>
            </div>
            <Button variant="primary" className="w-full" disabled={creating}>
              {creating ? "Creando..." : "Crear usuario"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UsersPage;
