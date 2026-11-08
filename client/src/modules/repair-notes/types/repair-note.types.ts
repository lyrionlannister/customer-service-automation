export type RepairNoteStatus = "received" | "in_repair" | "done" | "delivered";

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
  technicianName?: string;
  serviceRepair: boolean;
  serviceMaintenance: boolean;
  serviceDiagnostic: boolean;
  serviceRevision: boolean;
  serviceWaterDamage: boolean;
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
  technicianName: string;
  serviceRepair: boolean;
  serviceMaintenance: boolean;
  serviceDiagnostic: boolean;
  serviceRevision: boolean;
  serviceWaterDamage: boolean;
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
  technicianName: "",
  serviceRepair: false,
  serviceMaintenance: false,
  serviceDiagnostic: false,
  serviceRevision: false,
  serviceWaterDamage: false,
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
};
