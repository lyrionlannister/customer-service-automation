import { useEffect, type FC } from "react";
import { useCustomers, type Customer } from "@modules/customers/hooks/use-customers";
import Select from "./ui/select/select";

interface CustomerSelectProps {
  value: string;
  onChange: (customerId: string, customer: Customer | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

// Selector de cliente existente -- al elegir uno, el caller decide si
// autollena nombre/telefono (ver repair-note-form-page / quote-form-page).
// Nunca obliga a tener cliente guardado: el caller conserva los campos de
// texto libre para clientes de paso.
const CustomerSelect: FC<CustomerSelectProps> = ({
  value,
  onChange,
  placeholder = "Cliente existente (opcional)",
  disabled,
  className,
}) => {
  const { customers, loading, fetchAll } = useCustomers();

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return (
    <Select
      value={value}
      onChange={(id) => onChange(id, customers.find((c) => c.id === id) ?? null)}
      disabled={disabled || loading}
      placeholder={placeholder}
      className={className}
      options={customers.map((c) => ({ value: c.id, label: `${c.name} · ${c.phone}` }))}
    />
  );
};

export default CustomerSelect;
