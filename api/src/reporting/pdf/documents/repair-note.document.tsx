import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import type { RepairNotePdfData } from "./repair-note.pdf-data.js";

const BLUE = "#1e40af";
const BLUE_LIGHT = "#eff6ff";
const BLUE_MID = "#bfdbfe";
const FOOTER_BLUE = "#2563eb";
const RED = "#dc2626";
const GRAY = "#6b7280";
const DARK = "#111827";

const fmtDateParts = (dateStr: string | null) => {
  if (!dateStr) return { dia: "--", mes: "--", anio: "--" };
  const [y, m, d] = dateStr.split("-");
  return { dia: d, mes: m, anio: y };
};

const fmtCurrency = (value: number | null) => (value != null ? `$${Number(value).toFixed(2)}` : "—");

const styles = StyleSheet.create({
  page: { padding: 24, fontFamily: "Helvetica", fontSize: 10, color: DARK },
  accentBar: { height: 4, backgroundColor: BLUE, marginBottom: 10 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, paddingBottom: 10, borderBottom: 1, borderBottomColor: "#e5e7eb" },
  logoBox: { width: 60, height: 60, alignItems: "center", justifyContent: "center" },
  logo: { width: 56, height: 56, objectFit: "contain" },
  logoPlaceholder: { width: 50, height: 50, borderWidth: 1.5, borderColor: "#d1d5db", borderStyle: "dashed", alignItems: "center", justifyContent: "center" },
  logoPlaceholderText: { fontSize: 7, color: "#9ca3af", textAlign: "center" },
  companyInfo: { flex: 1 },
  companyName: { fontSize: 14, fontWeight: 700, textTransform: "uppercase", color: BLUE },
  companySubtitle: { fontSize: 7.5, color: GRAY, marginTop: 3 },
  companyPhone: { fontSize: 9, fontWeight: 700, color: DARK, marginTop: 3 },
  companyAddress: { fontSize: 7.5, color: GRAY, marginTop: 1 },
  controlBox: { alignItems: "flex-end", gap: 6, minWidth: 120 },
  controlLabel: { fontSize: 7, fontWeight: 700, textTransform: "uppercase", color: GRAY, textAlign: "right" },
  controlNumber: { fontSize: 30, fontWeight: 700, color: RED, textAlign: "right" },
  dateRow: { flexDirection: "row", gap: 2 },
  dateBox: { textAlign: "center", backgroundColor: BLUE_LIGHT, borderWidth: 1, borderColor: BLUE_MID, borderRadius: 3, paddingVertical: 2, paddingHorizontal: 7, minWidth: 30 },
  dateBoxLabel: { fontSize: 6, fontWeight: 700, color: BLUE, textTransform: "uppercase" },
  dateBoxValue: { fontSize: 12, fontWeight: 700, color: DARK },
  row: { flexDirection: "row", gap: 20, paddingVertical: 8, borderBottom: 1, borderBottomColor: "#f3f4f6" },
  field: { flexDirection: "column", gap: 2 },
  fieldFlex: { flexDirection: "column", gap: 2, flex: 1 },
  fieldLabel: { fontSize: 7, fontWeight: 700, color: GRAY, textTransform: "uppercase" },
  fieldValue: { fontSize: 10, color: DARK, borderBottom: 1, borderBottomColor: "#e5e7eb", paddingBottom: 2 },
  sectionLabel: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 4, paddingHorizontal: 12, backgroundColor: BLUE_LIGHT, borderTop: 1, borderTopColor: BLUE_MID, borderBottom: 1, borderBottomColor: BLUE_MID },
  sectionLabelBar: { width: 2.5, height: 10, backgroundColor: BLUE },
  sectionLabelText: { fontSize: 8, fontWeight: 700, textTransform: "uppercase", color: BLUE },
  sectionBody: { paddingVertical: 8, paddingHorizontal: 12, borderBottom: 1, borderBottomColor: "#f3f4f6" },
  checksRow: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 6 },
  checkItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  checkBoxOn: { width: 9, height: 9, borderRadius: 2, backgroundColor: BLUE, borderWidth: 1, borderColor: BLUE },
  checkBoxOff: { width: 9, height: 9, borderRadius: 2, borderWidth: 1, borderColor: "#9ca3af" },
  checkLabelOn: { fontSize: 8.5, color: DARK },
  checkLabelOff: { fontSize: 8.5, color: GRAY },
  warrantyNote: { fontSize: 8.5, color: BLUE, fontWeight: 700 },
  technicianText: { fontSize: 9, color: "#374151", lineHeight: 1.4 },
  signatures: { flexDirection: "row", gap: 36, paddingVertical: 14, paddingHorizontal: 24, borderBottom: 1, borderBottomColor: "#e5e7eb" },
  signatureBox: { flex: 1 },
  signatureLine: { borderTop: 1.5, borderTopColor: "#d1d5db", marginTop: 32, paddingTop: 3, textAlign: "center", fontSize: 7.5, color: GRAY },
  legalNote: { paddingVertical: 6, paddingHorizontal: 12, fontSize: 6.5, lineHeight: 1.5, color: "#9ca3af", backgroundColor: "#f9fafb", borderBottom: 2, borderBottomColor: BLUE },
  footerGrid: { flexDirection: "row", flexWrap: "wrap", backgroundColor: FOOTER_BLUE },
  footerCell: { width: "50%", paddingVertical: 8, paddingHorizontal: 12 },
  footerCellLabel: { fontSize: 6.5, fontWeight: 700, textTransform: "uppercase", color: "#dbeafe", marginBottom: 2 },
  footerCellValue: { fontSize: 13, fontWeight: 700, color: "#ffffff" },
});

const Field: React.FC<{ label: string; value: string; flex?: boolean }> = ({ label, value, flex }) => (
  <View style={flex ? styles.fieldFlex : styles.field}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <Text style={styles.fieldValue}>{value}</Text>
  </View>
);

const SectionLabel: React.FC<{ children: string }> = ({ children }) => (
  <View style={styles.sectionLabel}>
    <View style={styles.sectionLabelBar} />
    <Text style={styles.sectionLabelText}>{children}</Text>
  </View>
);

const Check: React.FC<{ checked: boolean; label: string }> = ({ checked, label }) => (
  <View style={styles.checkItem}>
    <View style={checked ? styles.checkBoxOn : styles.checkBoxOff} />
    <Text style={checked ? styles.checkLabelOn : styles.checkLabelOff}>{label}</Text>
  </View>
);

export const RepairNoteDocument: React.FC<{ data: RepairNotePdfData }> = ({ data }) => {
  const received = fmtDateParts(data.receivedAt);
  const delivery = fmtDateParts(data.deliveryDate);
  const hasTechnicianInfo = Boolean(data.assignedEmployeeName || data.technicianNotes);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.accentBar} />

        <View style={styles.header}>
          <View style={styles.logoBox}>
            {data.local.logo ? (
              <Image style={styles.logo} src={data.local.logo} />
            ) : (
              <View style={styles.logoPlaceholder}>
                <Text style={styles.logoPlaceholderText}>SIN LOGO</Text>
              </View>
            )}
          </View>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>{data.local.name ?? "Reparación de Celulares y Tablets"}</Text>
            <Text style={styles.companySubtitle}>
              Cambio de Cristales · Software y Cambios de Compañías · Cambio de Touch o Pantallas
            </Text>
            {data.local.phone && <Text style={styles.companyPhone}>Tel. {data.local.phone}</Text>}
            {data.local.address && <Text style={styles.companyAddress}>{data.local.address}</Text>}
          </View>
          <View style={styles.controlBox}>
            <Text style={styles.controlLabel}>Número de Control</Text>
            <Text style={styles.controlNumber}>N° {data.controlNumber}</Text>
            <View style={styles.dateRow}>
              {[
                { label: "DÍA", value: received.dia },
                { label: "MES", value: received.mes },
                { label: "AÑO", value: received.anio.slice(-2) },
              ].map(({ label, value }) => (
                <View key={label} style={styles.dateBox}>
                  <Text style={styles.dateBoxLabel}>{label}</Text>
                  <Text style={styles.dateBoxValue}>{value}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.row}>
          <Field label="Nombre del Cliente" value={data.customerName} flex />
          <Field label="Celular / Contacto" value={data.contactNumber ?? ""} />
        </View>

        <SectionLabel>Datos del Equipo</SectionLabel>
        <View style={styles.sectionBody}>
          <View style={[styles.row, { borderBottom: 0, paddingTop: 0 }]}>
            <Field label="Marca" value={data.brand} />
            <Field label="Modelo" value={data.model} flex />
          </View>
          <Field label="Falla Reportada" value={data.reportedFailure} flex />
          {data.additionalFindings && (
            <Field label="Hallazgos Adicionales" value={data.additionalFindings} flex />
          )}
        </View>

        <SectionLabel>Tipo de Servicio Requerido por el Cliente</SectionLabel>
        <View style={styles.sectionBody}>
          <View style={styles.checksRow}>
            {data.serviceTypeNames.map((name) => (
              <Check key={name} checked label={name} />
            ))}
            <Check checked={data.deviceOff} label="Equipo Apagado" />
          </View>
          <View style={styles.checksRow}>
            <Check checked={data.hasWarranty} label="Con Garantía" />
            <Check checked={!data.hasWarranty} label="Sin Garantía" />
            {data.hasExtendedWarranty && (
              <Text style={styles.warrantyNote}>Garantía extendida: {data.extendedWarrantyDays} días</Text>
            )}
          </View>
        </View>

        {hasTechnicianInfo && (
          <>
            <SectionLabel>Observaciones del Técnico</SectionLabel>
            <View style={styles.sectionBody}>
              {data.assignedEmployeeName && <Field label="Técnico" value={data.assignedEmployeeName} flex />}
              {data.technicianNotes && (
                <Text style={[styles.technicianText, { marginTop: 6 }]}>{data.technicianNotes}</Text>
              )}
            </View>
          </>
        )}

        <View style={styles.signatures}>
          {["Ejecutivo Responsable", "Firma de Autorización del Cliente"].map((label) => (
            <View key={label} style={styles.signatureBox}>
              <Text style={styles.signatureLine}>{label}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.legalNote}>
          Aviso: La empresa no se hace responsable por equipos con más de 10 días de haber ingresado al
          taller de servicio a partir de la fecha. Costo de almacenaje: $10.00/día. A los 20 días el equipo
          saldrá a remate. Garantía de 1 mes a partir de la fecha de entrega sobre la falla reparada; la
          garantía no aplica en equipos mojados y golpeados. En pantallas estrelladas o con rayas, NO APLICA
          GARANTÍA.
        </Text>

        <View style={styles.footerGrid}>
          {[
            { label: "Costo de Reparación", value: fmtCurrency(data.totalValue) },
            { label: "Anticipo", value: data.requiresAdvance ? fmtCurrency(data.advanceValue) : "—" },
            {
              label: "Fecha de Entrega",
              value: data.deliveryDate ? `${delivery.dia}/${delivery.mes}/${delivery.anio}` : "—",
            },
            {
              label: "Total a Liquidar",
              value: data.requiresAdvance
                ? fmtCurrency(data.totalValue - (data.advanceValue ?? 0))
                : fmtCurrency(data.totalValue),
            },
          ].map(({ label, value }) => (
            <View key={label} style={styles.footerCell}>
              <Text style={styles.footerCellLabel}>{label}</Text>
              <Text style={styles.footerCellValue}>{value}</Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
};
