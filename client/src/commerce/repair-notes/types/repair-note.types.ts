export type RepairNoteStatus = "received" | "in_repair" | "done" | "delivered" | "cancelled";

export interface RepairNoteRecord {
  id: string;
  controlNumber: number;
  customerName: string;
  contactNumber?: string;
  brand: string;
  model: string;
  reportedFailure: string;
  totalValue: number;
  status: RepairNoteStatus;
  requiresAdvance: boolean;
  advanceValue?: number;
  receivedAt: string;
  deliveryDate?: string;
  technicianNotes?: string;
  additionalFindings?: string;
  assignedEmployeeId?: string | null;
  localId?: string | null;
  customerId?: string | null;
  deviceOff: boolean;
  hasWarranty: boolean;
  hasExtendedWarranty: boolean;
  extendedWarrantyDays?: number;
  createdAt: string;
  updatedAt: string;
}

export interface RepairNoteFormData {
  customerName: string;
  contactNumber: string;
  brand: string;
  model: string;
  reportedFailure: string;
  totalValue: string;
  status: RepairNoteStatus;
  requiresAdvance: boolean;
  advanceValue: string;
  receivedAt: string;
  deliveryDate: string;
  technicianNotes: string;
  additionalFindings: string;
  assignedEmployeeId: string;
  localId: string;
  customerId: string;
  serviceTypeIds: string[];
  deviceOff: boolean;
  hasWarranty: boolean;
  hasExtendedWarranty: boolean;
  extendedWarrantyDays: string;
}

export const INITIAL_FORM: RepairNoteFormData = {
  customerName: "",
  contactNumber: "",
  brand: "",
  model: "",
  reportedFailure: "",
  totalValue: "0",
  status: "received",
  requiresAdvance: false,
  advanceValue: "",
  receivedAt: new Date().toISOString().split("T")[0],
  deliveryDate: "",
  technicianNotes: "",
  additionalFindings: "",
  assignedEmployeeId: "",
  localId: "",
  customerId: "",
  serviceTypeIds: [],
  deviceOff: false,
  hasWarranty: false,
  hasExtendedWarranty: false,
  extendedWarrantyDays: "",
};

export const STATUS_CONFIG: Record<RepairNoteStatus, { label: string; className: string }> = {
  received: {
    label: "Recibido",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  in_repair: {
    label: "En Reparación",
    className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  done: {
    label: "Listo",
    className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
  delivered: {
    label: "Entregado",
    className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  },
  cancelled: {
    label: "Cancelado",
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
};
