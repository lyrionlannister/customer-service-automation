import { useEffect } from "react";
import { UserPlus } from "lucide-react";
import { useUsers, type PayCycle, type UserRole } from "../hooks/use-users";
import { useUsersPage } from "../hooks/use-users-page";
import Toggle from "@ui/toggle/toggle";
import Modal from "@ui/modal/modal";
import Input from "@ui/inputs/input";
import Label from "@ui/inputs/label";
import Button from "@ui/button/button";
import Alert from "@ui/alert/alert";
import Select from "@ui/select/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@ui/table/table";
import { EyeIcon, EyeCloseIcon } from "@common/icons";
import PageShell from "@common/components/page-shell/page-shell";


const ROLE_LABELS: Record<UserRole, string> = {
  owner: "Dueño",
  admin: "Administrador",
  employee: "Empleado",
};

const PAY_CYCLE_LABELS: Record<PayCycle, string> = {
  weekly: "Semanal",
  biweekly: "Quincenal",
  monthly: "Mensual",
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

  const {
    isModalOpen,
    formData,
    showPassword,
    setIsModalOpen,
    setShowPassword,
    updateField,
    submit,
    closeModal,
  } = useUsersPage({
    createUser,
    fetchUsers,
    clearCreateError,
    clearCreateSuccess,
  });

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submit();
  };

  return (
    <PageShell
      title="Usuarios"
      description="Gestiona los usuarios del sistema."
      action={
        <Button
          variant="primary"
          startIcon={<UserPlus className="size-4" />}
          onClick={() => setIsModalOpen(true)}
        >
          Nuevo usuario
        </Button>
      }
    >
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-4 p-10 text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Cargando usuarios...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-4 p-10 text-center">
            <p className="text-sm text-red-500">{error}</p>
            <Button variant="secondary" onClick={fetchUsers}>Reintentar</Button>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 p-10 text-center">
            <p className="text-base font-semibold text-gray-700 dark:text-gray-200">No hay usuarios registrados.</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Crea el primer usuario para comenzar.</p>
            <Button variant="primary" startIcon={<UserPlus className="size-4" />} onClick={() => setIsModalOpen(true)}>
              Nuevo usuario
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-200 dark:border-gray-800">
                  <TableCell
                    isHeader
                    className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400"
                  >
                    Nombre
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400"
                  >
                    Email
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400"
                  >
                    Rol
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400"
                  >
                    Creado
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400"
                  >
                    Estado
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow
                    key={user.id}
                    className="border-b border-gray-100 transition-colors last:border-0 hover:bg-gray-50 dark:border-gray-800/50 dark:hover:bg-white/2"
                  >
                    <TableCell className="px-6 py-4 text-sm font-medium text-gray-800 dark:text-white/90">
                      {user.firstName} {user.lastName}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {user.email}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {ROLE_LABELS[user.role]}
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
        onClose={closeModal}
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
                onChange={(event) => updateField("firstName", event.target.value)}
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
                onChange={(event) => updateField("lastName", event.target.value)}
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
                onChange={(event) => updateField("email", event.target.value)}
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
                  onChange={(event) => updateField("password", event.target.value)}
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
            <div>
              <Label className="text-gray-500">Rol</Label>
              <Select
                value={formData.role}
                onChange={(value) => updateField("role", value as UserRole)}
                disabled={creating}
                options={Object.entries(ROLE_LABELS).map(([value, label]) => ({ value, label }))}
              />
            </div>
            <div>
              <Label className="text-gray-500">Salario</Label>
              <Input
                type="number"
                placeholder="Ej. 4500"
                name="salaryAmount"
                value={formData.salaryAmount}
                onChange={(event) => updateField("salaryAmount", event.target.value)}
                disabled={creating}
              />
            </div>
            <div>
              <Label className="text-gray-500">Ciclo de pago</Label>
              <Select
                value={formData.payCycle}
                onChange={(value) =>
                  updateField("payCycle", value as PayCycle | "")
                }
                disabled={creating}
                placeholder="Sin ciclo de pago"
                options={Object.entries(PAY_CYCLE_LABELS).map(([value, label]) => ({ value, label }))}
              />
            </div>
            <Button type="submit" variant="primary" className="w-full" disabled={creating}>
              {creating ? "Creando..." : "Crear usuario"}
            </Button>
          </div>
        </form>
      </Modal>
    </PageShell>
  );
};

export default UsersPage;
