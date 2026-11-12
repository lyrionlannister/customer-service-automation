import Button from "@ui/button/button";
import Input from "@ui/inputs/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@ui/table/table";
import type { ExcludedPhone } from "../types/whatsapp.types";

type Props = {
  exclusions: ExcludedPhone[];
  newPhone: string;
  onNewPhoneChange: (phone: string) => void;
  onCreateExclusion: () => void;
  onDeleteExclusion: (phone: string) => void;
};

const WhatsappExcludedPhones: React.FC<Props> = ({
  exclusions,
  newPhone,
  onNewPhoneChange,
  onCreateExclusion,
  onDeleteExclusion,
}) => (
  <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-soft dark:border-gray-700 dark:bg-gray-950">
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-lg font-semibold text-brand-600 dark:text-brand-400">
          Teléfonos excluidos
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          Estos números no recibirán respuestas automáticas.
        </p>
      </div>
      <div className="flex w-full gap-3 sm:w-auto">
        <Input
          placeholder="Ej: +54 11 1234 5678"
          value={newPhone}
          onChange={(event) => onNewPhoneChange(event.target.value)}
          className="max-w-[320px]"
        />
        <Button onClick={onCreateExclusion} disabled={!newPhone.trim()}>
          Agregar
        </Button>
      </div>
    </div>

    <div className="overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-700">
      <Table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <TableHeader className="bg-gray-50 dark:bg-gray-900">
          <TableRow>
            <TableCell
              isHeader
              className="px-5 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400"
            >
              Teléfono
            </TableCell>
            <TableCell
              isHeader
              className="px-5 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400"
            >
              Agregado el
            </TableCell>
            <TableCell
              isHeader
              className="px-5 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400"
            >
              Acciones
            </TableCell>
          </TableRow>
        </TableHeader>
        <TableBody className="bg-white dark:bg-gray-950">
          {exclusions.length === 0 ? (
            <TableRow>
              <TableCell
                className="px-5 py-6 text-sm text-gray-500 dark:text-gray-400"
                colSpan={3}
              >
                No hay números excluidos aún.
              </TableCell>
            </TableRow>
          ) : (
            exclusions.map((exclusion) => (
              <TableRow
                key={exclusion.phone}
                className="border-t border-gray-200 dark:border-gray-800"
              >
                <TableCell className="px-5 py-4 text-sm text-gray-900 dark:text-white">
                  {exclusion.phone}
                </TableCell>
                <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {new Date(exclusion.createdAt).toLocaleString()}
                </TableCell>
                <TableCell className="px-5 py-4 text-sm">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => onDeleteExclusion(exclusion.phone)}
                  >
                    Eliminar
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  </section>
);

export default WhatsappExcludedPhones;
