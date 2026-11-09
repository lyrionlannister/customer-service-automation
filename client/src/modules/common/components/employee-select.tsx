import { useEffect, type FC } from "react";
import { useEmployees } from "@modules/users/hooks/use-employees";
import Select from "./ui/select/select";

interface EmployeeSelectProps {
  value: string;
  onChange: (employeeId: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

// Reusable en cualquier modulo que necesite asignar un empleado por id
// (inventory, quotes, caja, dashboards) -- regla transversal: el valor
// siempre es el id del empleado elegido, nunca su nombre en texto libre.
const EmployeeSelect: FC<EmployeeSelectProps> = ({
  value,
  onChange,
  placeholder = "Selecciona un empleado",
  disabled = false,
  className,
}) => {
  const { employees, loading, fetchAll } = useEmployees();

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return (
    <Select
      value={value}
      onChange={onChange}
      disabled={disabled || loading}
      placeholder={placeholder}
      className={className}
      options={employees.map((e) => ({
        value: e.id,
        label: `${e.firstName} ${e.lastName}`,
      }))}
    />
  );
};

export default EmployeeSelect;
