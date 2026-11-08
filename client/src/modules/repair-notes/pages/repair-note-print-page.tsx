import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Download, ArrowLeft } from "lucide-react";
import { useRepairNotes } from "../hooks/use-repair-notes";
import { useLocal } from "../../local/hooks/use-local";
import { useApiClient } from "@common/hooks/use-api-client";
import type { RepairNoteRecord } from "../types/repair-note.types";
import type { LocalRecord } from "../../local/hooks/use-local";
import PageMeta from "@common/pages/page-meta";

// ─── Design tokens ────────────────────────────────────────────────────────────
const BLUE = "#1e40af";
const BLUE_LIGHT = "#eff6ff";
const BLUE_MID = "#bfdbfe";
const FOOTER_BLUE = "#2563eb";
const RED = "#dc2626";
const GRAY = "#6b7280";
const DARK = "#111827";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (dateStr?: string) => {
  if (!dateStr) return { dia: "--", mes: "--", anio: "--" };
  const [y, m, d] = dateStr.split("-");
  return { dia: d, mes: m, anio: y };
};

const fmtCurrency = (value?: number) =>
  value != null ? `$${Number(value).toFixed(2)}` : "—";

// ─── Sub-components ───────────────────────────────────────────────────────────
const Check: React.FC<{ checked: boolean; label: string }> = ({ checked, label }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 10.5 }}>
    <span
      style={{
        display: "inline-flex",
        width: 13,
        height: 13,
        border: `1.5px solid ${checked ? BLUE : "#9ca3af"}`,
        borderRadius: 3,
        alignItems: "center",
        justifyContent: "center",
        fontSize: 9,
        fontWeight: "bold",
        color: "#fff",
        background: checked ? BLUE : "transparent",
        flexShrink: 0,
        WebkitPrintColorAdjust: "exact",
        printColorAdjust: "exact",
      } as React.CSSProperties}
    >
      {checked ? "✓" : ""}
    </span>
    <span style={{ color: checked ? DARK : GRAY }}>{label}</span>
  </span>
);

const Field: React.FC<{ label: string; value?: string; flex?: boolean }> = ({
  label,
  value,
  flex,
}) => (
  <span
    style={{
      display: "inline-flex",
      flexDirection: "column",
      gap: 2,
      flex: flex ? 1 : undefined,
    }}
  >
    <span
      style={{
        fontSize: 8,
        fontWeight: "700",
        color: GRAY,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
      }}
    >
      {label}
    </span>
    <span
      style={{
        fontSize: 11.5,
        color: DARK,
        borderBottom: "1px solid #e5e7eb",
        paddingBottom: 2,
        minWidth: flex ? 100 : 70,
      }}
    >
      {value ?? ""}
    </span>
  </span>
);

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 7,
      padding: "5px 18px",
      background: BLUE_LIGHT,
      borderTop: `1px solid ${BLUE_MID}`,
      borderBottom: `1px solid ${BLUE_MID}`,
      WebkitPrintColorAdjust: "exact",
      printColorAdjust: "exact",
    } as React.CSSProperties}
  >
    <div
      style={{
        width: 3,
        height: 13,
        background: BLUE,
        borderRadius: 2,
        flexShrink: 0,
        WebkitPrintColorAdjust: "exact",
        printColorAdjust: "exact",
      } as React.CSSProperties}
    />
    <span
      style={{
        fontSize: 8.5,
        fontWeight: "800",
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        color: BLUE,
      }}
    >
      {children}
    </span>
  </div>
);

// ─── Receipt ──────────────────────────────────────────────────────────────────
const Receipt: React.FC<{ note: RepairNoteRecord; local: LocalRecord | null }> = ({
  note,
  local,
}) => {
  const received = fmtDate(note.receivedAt);
  const delivery = fmtDate(note.deliveryDate ?? undefined);

  return (
    <div
      className="receipt-root"
      style={{
        fontFamily: "Arial, 'Helvetica Neue', sans-serif",
        background: "#fff",
        color: DARK,
        boxShadow: "0 4px 28px rgba(0,0,0,0.13)",
        borderRadius: 3,
      }}
    >
      {/* Accent bar */}
      <div
        style={{
          height: 5,
          background: `linear-gradient(90deg, ${BLUE} 0%, #3b82f6 100%)`,
          WebkitPrintColorAdjust: "exact",
          printColorAdjust: "exact",
        } as React.CSSProperties}
      />

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "14px 18px 12px",
          gap: 16,
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        {/* Logo */}
        <div
          style={{
            width: 72,
            height: 72,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {local?.logo ? (
            <img
              src={local.logo}
              alt="Logo"
              style={{ width: 68, height: 68, objectFit: "contain", borderRadius: 6 }}
            />
          ) : (
            <div
              style={{
                width: 60,
                height: 60,
                border: "2px dashed #d1d5db",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#9ca3af",
                fontSize: 8.5,
                textAlign: "center",
                lineHeight: 1.4,
              }}
            >
              SIN
              <br />
              LOGO
            </div>
          )}
        </div>

        {/* Company info */}
        <div style={{ flex: 1 }}>
          <p
            style={{
              fontSize: 15,
              fontWeight: "900",
              textTransform: "uppercase",
              color: BLUE,
              letterSpacing: "0.02em",
              lineHeight: 1.15,
            }}
          >
            {local?.name ?? "Reparación de Celulares y Tablets"}
          </p>
          <p style={{ fontSize: 8.5, color: GRAY, marginTop: 3, lineHeight: 1.6 }}>
            Cambio de Cristales &nbsp;·&nbsp; Software y Cambios de Compañías &nbsp;·&nbsp; Cambio
            de Touch o Pantallas
          </p>
          {local?.phone && (
            <p style={{ fontSize: 10, fontWeight: "600", color: DARK, marginTop: 4 }}>
              Tel. {local.phone}
            </p>
          )}
          {local?.address && (
            <p style={{ fontSize: 8.5, color: GRAY, marginTop: 1 }}>{local.address}</p>
          )}
        </div>

        {/* Control number + date */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 8,
            flexShrink: 0,
            minWidth: 130,
          }}
        >
          <div style={{ textAlign: "right" }}>
            <p
              style={{
                fontSize: 7.5,
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: GRAY,
              }}
            >
              Número de Control
            </p>
            <p style={{ fontSize: 38, fontWeight: "900", color: RED, lineHeight: 1, marginTop: 1 }}>
              N°&nbsp;{note.controlNumber}
            </p>
          </div>
          <div style={{ display: "flex", gap: 2 }}>
            {[
              { label: "DÍA", value: received.dia },
              { label: "MES", value: received.mes },
              { label: "AÑO", value: received.anio.slice(-2) },
            ].map(({ label, value }) => (
              <div
                key={label}
                style={{
                  textAlign: "center",
                  background: BLUE_LIGHT,
                  border: `1px solid ${BLUE_MID}`,
                  borderRadius: 4,
                  padding: "2px 9px",
                  minWidth: 34,
                  WebkitPrintColorAdjust: "exact",
                  printColorAdjust: "exact",
                } as React.CSSProperties}
              >
                <div
                  style={{
                    fontSize: 7,
                    fontWeight: "700",
                    color: BLUE,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  {label}
                </div>
                <div style={{ fontSize: 15, fontWeight: "800", color: DARK }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Customer */}
      <div
        style={{
          display: "flex",
          gap: 24,
          padding: "10px 18px",
          borderBottom: "1px solid #f3f4f6",
        }}
      >
        <Field label="Nombre del Cliente" value={note.customerName} flex />
        <Field label="Celular / Contacto" value={note.contactNumber} />
      </div>

      {/* Equipment */}
      <SectionLabel>Datos del Equipo</SectionLabel>
      <div style={{ padding: "10px 18px", borderBottom: "1px solid #f3f4f6" }}>
        <div style={{ display: "flex", gap: 24, marginBottom: 9 }}>
          <Field label="Marca" value={note.brand} />
          <Field label="Modelo" value={note.model} flex />
        </div>
        <Field label="Falla Reportada" value={note.reportedFailure} flex />
      </div>

      {/* Service type */}
      <SectionLabel>Tipo de Servicio Requerido por el Cliente</SectionLabel>
      <div style={{ padding: "10px 18px", borderBottom: "1px solid #f3f4f6" }}>
        <div
          style={{ display: "flex", flexWrap: "wrap", gap: "7px 22px", marginBottom: 8 }}
        >
          <Check checked={note.serviceRepair} label="Reparación" />
          <Check checked={note.serviceMaintenance} label="Mantenimiento" />
          <Check checked={note.serviceDiagnostic} label="Diagnóstico" />
          <Check checked={note.serviceRevision} label="Revisión" />
          <Check checked={note.serviceWaterDamage} label="Mojado" />
          <Check checked={note.deviceOff} label="Equipo Apagado" />
        </div>
        <div
          style={{ display: "flex", gap: 22, alignItems: "center", flexWrap: "wrap" }}
        >
          <Check checked={note.hasWarranty} label="Con Garantía" />
          <Check checked={!note.hasWarranty} label="Sin Garantía" />
          {note.hasExtendedWarranty && (
            <span style={{ fontSize: 10, color: BLUE, fontWeight: "600" }}>
              Garantía extendida:{" "}
              <strong style={{ color: DARK }}>{note.extendedWarrantyDays} días</strong>
            </span>
          )}
        </div>
      </div>

      {/* Technician notes */}
      {(note.technicianName || note.technicianNotes) && (
        <>
          <SectionLabel>Observaciones del Técnico</SectionLabel>
          <div style={{ padding: "10px 18px", borderBottom: "1px solid #f3f4f6" }}>
            {note.technicianName && (
              <div style={{ marginBottom: 6 }}>
                <Field label="Técnico" value={note.technicianName} flex />
              </div>
            )}
            {note.technicianNotes && (
              <p style={{ fontSize: 10, color: "#374151", lineHeight: 1.5 }}>
                {note.technicianNotes}
              </p>
            )}
          </div>
        </>
      )}

      {/* Signatures */}
      <div
        style={{
          display: "flex",
          gap: 48,
          padding: "16px 36px 18px",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        {["Ejecutivo Responsable", "Firma de Autorización del Cliente"].map((label) => (
          <div key={label} style={{ flex: 1 }}>
            <div style={{ height: 44 }} />
            <div
              style={{
                borderTop: "1.5px solid #d1d5db",
                paddingTop: 4,
                textAlign: "center",
                fontSize: 8.5,
                color: GRAY,
                letterSpacing: "0.03em",
              }}
            >
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Legal note */}
      <div
        style={{
          padding: "6px 18px",
          fontSize: 7.5,
          lineHeight: 1.65,
          color: "#9ca3af",
          fontStyle: "italic",
          background: "#f9fafb",
          borderBottom: `3px solid ${BLUE}`,
          WebkitPrintColorAdjust: "exact",
          printColorAdjust: "exact",
        } as React.CSSProperties}
      >
        <strong style={{ color: GRAY, fontStyle: "normal" }}>Aviso:</strong> La empresa no se hace
        responsable por equipos con más de 10 días de haber ingresado al taller de servicio a
        partir de la fecha. Costo de almacenaje: $10.00/día. A los 20 días el equipo saldrá a
        remate. Garantía de 1 mes a partir de la fecha de entrega sobre la falla reparada;{" "}
        <u>la garantía no aplica en equipos mojados y golpeados.</u> En pantallas estrelladas o con
        rayas. <strong style={{ fontStyle: "normal" }}>NO APLICA GARANTÍA.</strong>
      </div>

      {/* Cost footer */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          background: FOOTER_BLUE,
          WebkitPrintColorAdjust: "exact",
          printColorAdjust: "exact",
        } as React.CSSProperties}
      >
        {[
          { label: "Costo de Reparación", value: fmtCurrency(Number(note.totalValue)) },
          {
            label: "Anticipo",
            value: note.requiresAdvance ? fmtCurrency(Number(note.advanceValue)) : "—",
          },
          {
            label: "Fecha de Entrega",
            value: note.deliveryDate
              ? `${delivery.dia}/${delivery.mes}/${delivery.anio}`
              : "—",
          },
          {
            label: "Total a Liquidar",
            value: note.requiresAdvance
              ? fmtCurrency(Number(note.totalValue) - Number(note.advanceValue ?? 0))
              : fmtCurrency(Number(note.totalValue)),
          },
        ].map(({ label, value }, i) => (
          <div
            key={label}
            style={{
              padding: "11px 18px",
              borderRight: i % 2 === 0 ? "1px solid rgba(255,255,255,0.12)" : "none",
              borderTop: i >= 2 ? "1px solid rgba(255,255,255,0.12)" : "none",
            }}
          >
            <div
              style={{
                fontSize: 7.5,
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "rgba(255,255,255,0.6)",
                marginBottom: 3,
              }}
            >
              {label}
            </div>
            <div style={{ fontSize: 16, fontWeight: "800", color: "#fff" }}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────
const RepairNotePrintPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { note, loading: loadingNote, fetchNote } = useRepairNotes();
  const { local, loading: loadingLocal, fetchLocal } = useLocal();
  const { apiClient } = useApiClient();
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  useEffect(() => {
    if (id) fetchNote(id);
    fetchLocal();
  }, [id, fetchNote, fetchLocal]);

  const handleDownload = async () => {
    if (!id || !note) return;
    setDownloading(true);
    setDownloadError(null);
    try {
      const res = await apiClient(`/repair-notes/${id}/pdf`);
      if (!res.ok) throw new Error("No se pudo generar el PDF");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `nota-${note.controlNumber}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setDownloadError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setDownloading(false);
    }
  };

  if (loadingNote || loadingLocal) {
    return (
      <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">Cargando...</div>
    );
  }

  if (!note) {
    return <div className="p-8 text-center text-sm text-red-500">Nota no encontrada.</div>;
  }

  return (
    <div className="flex h-full flex-col">
      <PageMeta title="Nota de Reparación" description="Vista previa e impresión" />

      {/* Controls */}
      <div className="mb-4 flex shrink-0 items-center gap-3">
        <button
          onClick={() => navigate("/admin/repair-notes")}
          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-white"
        >
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="flex-1 text-xl font-semibold text-brand-600 dark:text-brand-400">
          Nota #{note.controlNumber}
        </h1>
        {downloadError && <span className="text-sm text-red-500">{downloadError}</span>}
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60"
        >
          <Download className="size-4" />
          {downloading ? "Generando..." : "Descargar PDF"}
        </button>
      </div>

      {/* Preview */}
      <div className="flex min-h-0 flex-1 items-start justify-center overflow-auto rounded-2xl border border-gray-200 bg-gray-100 p-8 dark:border-gray-700 dark:bg-gray-900">
        <div style={{ width: 720, flexShrink: 0 }}>
          <Receipt note={note} local={local} />
        </div>
      </div>
    </div>
  );
};

export default RepairNotePrintPage;
