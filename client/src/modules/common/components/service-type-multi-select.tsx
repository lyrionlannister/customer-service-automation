import { useEffect, useState, type FC } from "react";
import { Plus } from "lucide-react";
import { useServiceTypes } from "@common/hooks/use-service-types";
import Input from "./ui/inputs/input";
import Button from "./ui/button/button";

interface ServiceTypeMultiSelectProps {
  value: string[];
  onChange: (serviceTypeIds: string[]) => void;
  disabled?: boolean;
}

// Checkboxes de tipo de servicio: la lista viene del tenant (defaults
// sembrados + los que el tenant haya creado), nunca hardcodeada en el
// cliente -- regla transversal #1 (se referencia por id).
const ServiceTypeMultiSelect: FC<ServiceTypeMultiSelectProps> = ({ value, onChange, disabled }) => {
  const { serviceTypes, loading, fetchAll, create } = useServiceTypes();
  const [newTypeName, setNewTypeName] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const toggle = (id: string) => {
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
  };

  const handleAdd = async () => {
    const name = newTypeName.trim();
    if (!name) return;
    setAdding(true);
    const created = await create(name);
    setAdding(false);
    if (created) {
      setNewTypeName("");
      onChange([...value, created.id]);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-x-6 gap-y-3">
        {loading && serviceTypes.length === 0 ? (
          <p className="text-xs text-gray-400">Cargando tipos de servicio...</p>
        ) : (
          serviceTypes.map((type) => (
            <label key={type.id} className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={value.includes(type.id)}
                onChange={() => toggle(type.id)}
                disabled={disabled}
                className="size-4 rounded border-gray-300 accent-brand-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{type.name}</span>
            </label>
          ))
        )}
      </div>
      <div className="flex items-center gap-2">
        <Input
          placeholder="Nuevo tipo de servicio (ej. Software)"
          value={newTypeName}
          onChange={(e) => setNewTypeName(e.target.value)}
          disabled={disabled || adding}
        />
        <Button type="button" variant="outline" onClick={handleAdd} disabled={disabled || adding || !newTypeName.trim()}>
          <Plus className="size-4" />
        </Button>
      </div>
    </div>
  );
};

export default ServiceTypeMultiSelect;
