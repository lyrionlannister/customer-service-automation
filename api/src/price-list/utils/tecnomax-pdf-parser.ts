import { createRequire } from "node:module";
import type { ParsedPriceItem } from "./pdf-parser.js";

export type { ParsedPriceItem };

const require = createRequire(import.meta.url);

type PdfParse = (buffer: Buffer) => Promise<{ text: string; numpages: number }>;

// ─── Noise filter ────────────────────────────────────────────────────────────

const NOISE_PATTERNS: RegExp[] = [
  /^WHATSAPP$/i,
  /^BOULEVARD$/i,
  /^ALTAMIRA$/i,
  /^TECNOMAXX?$/i,
  /^Producto$/i,
  /^Precio$/i,
  /^Bater[ií]as\s+y\s+Refacciones/i,
  /^PLAZA\s+DE\s+LA\s+TECNOLOG/i,
  /^\d{3}-\d{3}-\d{4}$/,       // phone: 833-310-9990
  /^\d{10}$/,                   // phone: 8332437060
  /^833/,                       // catch remaining phone variants
];

function isNoiseLine(line: string): boolean {
  const t = line.trim();
  return t.length === 0 || NOISE_PATTERNS.some((p) => p.test(t));
}

// ─── Brand detection ─────────────────────────────────────────────────────────

const BRAND_PREFIX_MAP: Array<[RegExp, string]> = [
  [/^L\+T\s+HUA\s+/i, "Huawei"],
  [/^L\+T\s+SAM\s+/i, "Samsung"],
  [/^L\+T\s+IP\s+/i, "iPhone"],
  [/^L\+T\s+MOT\s+/i, "Motorola"],
  [/^L\+T\s+XIA\s+/i, "Xiaomi"],
  [/^L\+T\s+ZTE\s+/i, "ZTE"],
  [/^L\+T\s+OPPO\s+/i, "OPPO"],
  [/^L\+T\s+LG\s+/i, "LG"],
  [/^L\+T\s+VIVO\s+/i, "Vivo"],
  [/^L\+T\s+TCL\s+/i, "TCL"],
  [/^L\+T\s+HIS\s+/i, "Hisense"],
  [/^L\+T\s+REALME\s+/i, "Realme"],
  [/^L\+T\s+ONE\s+PLUS\s+/i, "OnePlus"],
  [/^L\+T\s+1\+\s+NORD\s+/i, "OnePlus"],
  [/^L\+T\s+GOO\s+/i, "Google"],
  [/^L\+T\s+CUBOT\s+/i, "Cubot"],
  [/^L\+T\s+ALC\s+/i, "Alcatel"],
  [/^L\+T\s+INFINIX\s+/i, "Infinix"],
  [/^LCD\s+TOUCH\s+APP\s+WATCH\s*/i, "Apple Watch"],
];

function detectBrandAndModel(text: string): { brand: string; model: string } {
  const t = text.trim();
  for (const [regex, brand] of BRAND_PREFIX_MAP) {
    if (regex.test(t)) {
      const model = t.replace(regex, "").trim();
      return { brand, model: model.length >= 2 ? model : t };
    }
  }
  if (/^L\+T\s+/i.test(t)) {
    return { brand: "Sin marca", model: t.replace(/^L\+T\s+/i, "").trim() };
  }
  return { brand: "Sin marca", model: t };
}

// ─── Price extraction ─────────────────────────────────────────────────────────

// Matches a price at the END of an entry string, e.g. "$145", "$1,450", "$2,950"
const PRICE_AT_END = /\$(\d{1,3}(?:,\d{3})*)\s*$/;

function parseEntry(entry: string): ParsedPriceItem | null {
  const priceMatch = entry.match(PRICE_AT_END);
  if (!priceMatch) return null;

  const price = parseFloat(priceMatch[1].replace(",", ""));
  if (isNaN(price) || price <= 0) return null;

  const productText = entry.slice(0, priceMatch.index!).trim();
  if (productText.length < 2) return null;

  const { brand, model } = detectBrandAndModel(productText);
  if (!model || model.length < 2) return null;

  return { brand, model, price, rawText: entry };
}

// ─── Main parsing logic ───────────────────────────────────────────────────────

function extractEntries(rawText: string): ParsedPriceItem[] {
  // 1. Remove noise lines
  const cleanLines = rawText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => !isNoiseLine(l));

  // 2. Join into a single string; normalize multiple spaces
  const joined = cleanLines.join(" ").replace(/\s{2,}/g, " ").trim();

  // 3. Split at every product-entry boundary (lookahead keeps the delimiter)
  //    Two-column products on the same raw line are handled naturally because
  //    each "L+T" or "LCD TOUCH" token starts a new slice.
  const parts = joined
    .split(/(?=L\+T\s|LCD\s+TOUCH\s)/i)
    .map((s) => s.trim())
    .filter((s) => s.length > 2);

  // 4. Parse each slice into a structured item
  const items: ParsedPriceItem[] = [];
  for (const part of parts) {
    const item = parseEntry(part);
    if (item) items.push(item);
  }

  return items;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function parseTecnomaxPdf(buffer: Buffer): Promise<ParsedPriceItem[]> {
  const pdfParse: PdfParse = require("pdf-parse/lib/pdf-parse.js");
  const pdf = await pdfParse(buffer);

  const items = extractEntries(pdf.text);

  // Deduplicate by brand + model + price
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = `${item.brand}|${item.model}|${item.price}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
