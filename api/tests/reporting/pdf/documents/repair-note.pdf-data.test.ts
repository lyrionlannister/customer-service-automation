import { describe, expect, it } from "vitest";
import { toRepairNotePdfData } from "../../../../src/reporting/pdf/documents/repair-note.pdf-data.js";
import type { RepairNote } from "../../../../src/commerce/repair-notes/entities/repair-note.entity.js";
import type { Local } from "../../../../src/app_platform/local/entities/local.entity.js";

function makeNote(overrides: Partial<RepairNote> = {}): RepairNote {
  return {
    controlNumber: 42,
    customerName: "Juan Pérez",
    contactNumber: "5551234567",
    brand: "Samsung",
    model: "A15",
    reportedFailure: "Pantalla rota",
    totalValue: "500.00",
    requiresAdvance: true,
    advanceValue: "100.00",
    receivedAt: "2026-01-10",
    deliveryDate: "2026-01-15",
    technicianNotes: "Revisar touch",
    serviceRepair: true,
    serviceMaintenance: false,
    serviceDiagnostic: false,
    serviceRevision: false,
    serviceWaterDamage: false,
    deviceOff: false,
    hasWarranty: true,
    hasExtendedWarranty: false,
    extendedWarrantyDays: undefined,
    ...overrides,
  } as unknown as RepairNote;
}

describe("toRepairNotePdfData", () => {
  it("convierte valores decimales (string) de Postgres a number", () => {
    const data = toRepairNotePdfData(makeNote(), null);

    expect(data.totalValue).toBe(500);
    expect(data.advanceValue).toBe(100);
  });

  it("usa null en vez de undefined para campos opcionales ausentes", () => {
    const data = toRepairNotePdfData(
      makeNote({ contactNumber: undefined, technicianNotes: undefined }),
      null,
    );

    expect(data.contactNumber).toBeNull();
    expect(data.assignedEmployeeName).toBeNull();
    expect(data.technicianNotes).toBeNull();
    expect(data.additionalFindings).toBeNull();
  });

  it("pasa additionalFindings cuando la nota lo tiene", () => {
    const data = toRepairNotePdfData(makeNote({ additionalFindings: "Batería inflada" }), null);

    expect(data.additionalFindings).toBe("Batería inflada");
  });

  it("usa el nombre de empleado resuelto cuando se pasa como tercer argumento", () => {
    const data = toRepairNotePdfData(makeNote(), null, "Luis Guzmán");

    expect(data.assignedEmployeeName).toBe("Luis Guzmán");
  });

  it("mapea los datos del local cuando existe", () => {
    const local = { name: "Mi Taller", address: "Calle 1", phone: "555", logo: "data:image/png;base64,abc" } as Local;
    const data = toRepairNotePdfData(makeNote(), local);

    expect(data.local).toEqual({
      name: "Mi Taller",
      address: "Calle 1",
      phone: "555",
      logo: "data:image/png;base64,abc",
    });
  });

  it("deja el local en null cuando no hay configuración", () => {
    const data = toRepairNotePdfData(makeNote(), null);

    expect(data.local).toEqual({ name: null, address: null, phone: null, logo: null });
  });
});
