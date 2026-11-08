import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import type { QuotePdfData } from "./quote.pdf-data.js";

const BLUE = "#1e40af";
const BLUE_LIGHT = "#eff6ff";
const GRAY = "#6b7280";
const DARK = "#111827";
const FOOTER_BLUE = "#2563eb";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  accepted: "Aceptada",
  rejected: "Rechazada",
};

const fmtCurrency = (value: number) => `$${Number(value).toFixed(2)}`;
const fmtDate = (value: string | null) => {
  if (!value) return "—";
  const [y, m, d] = value.split("-");
  return `${d}/${m}/${y}`;
};

const styles = StyleSheet.create({
  page: { padding: 24, fontFamily: "Helvetica", fontSize: 10, color: DARK },
  accentBar: { height: 4, backgroundColor: BLUE, marginBottom: 10 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, paddingBottom: 10, borderBottom: 1, borderBottomColor: "#e5e7eb" },
  logo: { width: 50, height: 50, objectFit: "contain" },
  logoPlaceholder: { width: 46, height: 46, borderWidth: 1.5, borderColor: "#d1d5db", borderStyle: "dashed", alignItems: "center", justifyContent: "center" },
  logoPlaceholderText: { fontSize: 6.5, color: "#9ca3af", textAlign: "center" },
  companyInfo: { flex: 1 },
  companyName: { fontSize: 13, fontWeight: 700, textTransform: "uppercase", color: BLUE },
  companyPhone: { fontSize: 8.5, color: GRAY, marginTop: 2 },
  title: { alignItems: "flex-end" },
  titleText: { fontSize: 18, fontWeight: 700, color: BLUE },
  titleDate: { fontSize: 8, color: GRAY, marginTop: 2 },
  row: { flexDirection: "row", gap: 24, paddingVertical: 10, borderBottom: 1, borderBottomColor: "#f3f4f6" },
  field: { flexDirection: "column", gap: 2, flex: 1 },
  fieldLabel: { fontSize: 7, fontWeight: 700, color: GRAY, textTransform: "uppercase" },
  fieldValue: { fontSize: 10, color: DARK },
  table: { marginTop: 10 },
  tableHeader: { flexDirection: "row", backgroundColor: BLUE_LIGHT, paddingVertical: 5, paddingHorizontal: 8 },
  tableRow: { flexDirection: "row", paddingVertical: 5, paddingHorizontal: 8, borderBottom: 1, borderBottomColor: "#f3f4f6" },
  colDescription: { flex: 1, fontSize: 9 },
  colQuantity: { width: 50, fontSize: 9, textAlign: "right" },
  colPrice: { width: 70, fontSize: 9, textAlign: "right" },
  colSubtotal: { width: 70, fontSize: 9, textAlign: "right" },
  headerCell: { fontSize: 7.5, fontWeight: 700, color: BLUE, textTransform: "uppercase" },
  totalRow: { flexDirection: "row", justifyContent: "flex-end", backgroundColor: FOOTER_BLUE, marginTop: 10, paddingVertical: 10, paddingHorizontal: 16 },
  totalLabel: { fontSize: 9, color: "#dbeafe", marginRight: 10 },
  totalValue: { fontSize: 16, fontWeight: 700, color: "#ffffff" },
  statusBadge: { marginTop: 10, alignSelf: "flex-end", fontSize: 8, fontWeight: 700, color: BLUE, textTransform: "uppercase" },
});

export const QuoteDocument: React.FC<{ data: QuotePdfData }> = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.accentBar} />

      <View style={styles.header}>
        {data.local.logo ? (
          <Image style={styles.logo} src={data.local.logo} />
        ) : (
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoPlaceholderText}>SIN LOGO</Text>
          </View>
        )}
        <View style={styles.companyInfo}>
          <Text style={styles.companyName}>{data.local.name ?? "Reparación de Celulares y Tablets"}</Text>
          {data.local.phone && <Text style={styles.companyPhone}>Tel. {data.local.phone}</Text>}
        </View>
        <View style={styles.title}>
          <Text style={styles.titleText}>Cotización</Text>
          <Text style={styles.titleDate}>Fecha: {fmtDate(data.createdAt)}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Cliente</Text>
          <Text style={styles.fieldValue}>{data.customerName}</Text>
        </View>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Contacto</Text>
          <Text style={styles.fieldValue}>{data.contactNumber ?? "—"}</Text>
        </View>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Válida hasta</Text>
          <Text style={styles.fieldValue}>{fmtDate(data.validUntil)}</Text>
        </View>
      </View>

      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.colDescription, styles.headerCell]}>Descripción</Text>
          <Text style={[styles.colQuantity, styles.headerCell]}>Cant.</Text>
          <Text style={[styles.colPrice, styles.headerCell]}>Precio</Text>
          <Text style={[styles.colSubtotal, styles.headerCell]}>Subtotal</Text>
        </View>
        {data.items.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.colDescription}>{item.description}</Text>
            <Text style={styles.colQuantity}>{item.quantity}</Text>
            <Text style={styles.colPrice}>{fmtCurrency(item.unitPrice)}</Text>
            <Text style={styles.colSubtotal}>{fmtCurrency(item.quantity * item.unitPrice)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>TOTAL</Text>
        <Text style={styles.totalValue}>{fmtCurrency(data.totalValue)}</Text>
      </View>

      <Text style={styles.statusBadge}>{STATUS_LABELS[data.status] ?? data.status}</Text>
    </Page>
  </Document>
);
