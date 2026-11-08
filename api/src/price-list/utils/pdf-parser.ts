import { createRequire } from "node:module";
import type * as dfd from "danfojs-node";

export interface ParsedPriceItem {
  brand: string;
  model: string;
  price: number;
  sourcePage?: number;
  rawText?: string;
}

export interface RawPdfRow {
  page: number;
  side?: "left" | "right";
  brand?: string;
  text: string;
  rawText?: string;
  visualLine?: number;
}

type PdfParse = (
  buffer: Buffer,
  options?: {
    pagerender?: (pageData: PdfPageData) => Promise<string>;
    max?: number;
    version?: string;
  },
) => Promise<{ numpages: number; numrender: number; text: string }>;

type PdfTextItem = {
  str: string;
  transform: number[];
  width?: number;
  height?: number;
};

type PdfPageData = {
  pageIndex?: number;
  getViewport: (scale: number) => { width: number; height: number };
  getTextContent: (options: {
    normalizeWhitespace: boolean;
    disableCombineTextItems: boolean;
  }) => Promise<{ items: PdfTextItem[] }>;
};

type PositionedTextItem = {
  str: string;
  x: number;
  y: number;
  endX: number;
};

type DataFrameCtor = new (data?: unknown, options?: unknown) => dfd.DataFrame;
type DanfoModule = {
  DataFrame: DataFrameCtor;
  concat?: (options: { dfList: dfd.DataFrame[]; axis?: number }) => dfd.DataFrame;
};

const require = createRequire(import.meta.url);

const BRAND_ALIASES: Array<{ keyword: string; normalized: string }> = [
  { keyword: "ONE PLUS", normalized: "OnePlus" },
  { keyword: "SAMSUNG", normalized: "Samsung" },
  { keyword: "HUAWEI", normalized: "Huawei" },
  { keyword: "MOTOROLA", normalized: "Motorola" },
  { keyword: "IPHONE", normalized: "iPhone" },
  { keyword: "HONOR", normalized: "Honor" },
  { keyword: "XIAOMI", normalized: "Xiaomi" },
  { keyword: "REALME", normalized: "Realme" },
  { keyword: "HISENSE", normalized: "Hisense" },
  { keyword: "BATERIAS", normalized: "Baterías" },
  { keyword: "NOKIA", normalized: "Nokia" },
  { keyword: "VIVO", normalized: "Vivo" },
  { keyword: "OPPO", normalized: "OPPO" },
  { keyword: "ZTE", normalized: "ZTE" },
  { keyword: "TCL", normalized: "TCL" },
  { keyword: "LG", normalized: "LG" },
];

const PRICE_TRIPLE_RE =
  /\$\s*(\d{1,3}(?:,\d{3})?|\d+)\s*\$\s*(\d{1,3}(?:,\d{3})?|\d+)\s*\$\s*(\d{1,3}(?:,\d{3})?|\d+)/g;

const HEADER_RE =
  /^(MODELO|PRECIO\s*1|PRECIO\s*2|PRECIO\s*3|MODELOPRECIO|LISTA\s+DE\s+PRECIOS|DESCRIPCI[OÓ]N|ART[ÍI]CULO)$/i;

let danfoCache: DanfoModule | null = null;

function loadPdfParse(): PdfParse {
  // pdf-parse ships CommonJS internals; createRequire keeps this file ESM-compatible.
  const mod = require("pdf-parse/lib/pdf-parse.js");
  return (typeof mod === "function" ? mod : (mod.default ?? mod)) as PdfParse;
}

function loadDanfo(): DanfoModule {
  if (danfoCache) return danfoCache;

  try {
    const mod = require("danfojs-node") as DanfoModule;
    danfoCache = typeof mod.DataFrame === "function" ? mod : createFallbackDanfo();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(
      `[pdf-parser] Warning: danfojs-node no pudo cargar (${message}). ` +
        "Usando fallback local de DataFrame para no bloquear el import.",
    );
    danfoCache = createFallbackDanfo();
  }

  return danfoCache;
}

function createFallbackDanfo(): DanfoModule {
  class FallbackDataFrame {
    private rows: Record<string, unknown>[];

    constructor(data?: unknown) {
      this.rows = Array.isArray(data)
        ? data.map((row) => ({ ...(row as Record<string, unknown>) }))
        : [];
    }

    toJSON(options?: { format?: string }): object {
      if (options?.format === "row") {
        return this.rows.map((row) => ({ ...row }));
      }

      return this.rows.reduce<Record<string, unknown[]>>((acc, row) => {
        for (const [key, value] of Object.entries(row)) {
          acc[key] ??= [];
          acc[key].push(value);
        }
        return acc;
      }, {});
    }
  }

  return {
    DataFrame: FallbackDataFrame as unknown as DataFrameCtor,
    concat: ({ dfList }) =>
      new (FallbackDataFrame as unknown as DataFrameCtor)(
        dfList.flatMap((df) => dataframeToRows(df)),
      ),
  };
}

function normalizeSpaces(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeForMatch(value: string): string {
  return normalizeSpaces(
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase(),
  );
}

function parsePrice(value: unknown): number {
  if (typeof value === "number") return value;
  return Number.parseInt(String(value).replace(/[$,\s]/g, ""), 10);
}

function isHeaderOrNoise(value: string): boolean {
  const text = normalizeSpaces(value);
  if (!text) return true;

  const compact = text.replace(/\s+/g, "").toUpperCase();
  if (compact === "MODELOPRECIO1PRECIO2PRECIO3") return true;
  if (compact === "MODELOPRECIO1PRECIO2PRECIO3MODELOPRECIO1PRECIO2PRECIO3") {
    return true;
  }

  return HEADER_RE.test(text);
}

function findBrands(text: string): string[] {
  if (/\$/.test(text)) return [];

  const normalized = normalizeForMatch(text);
  const matches = BRAND_ALIASES.flatMap((brand) => {
    const escaped = brand.keyword.replace(/\s+/g, "\\s+");
    const match = new RegExp(`(?:^|[^A-Z0-9])${escaped}(?:[^A-Z0-9]|$)`).exec(normalized);
    return match ? [{ index: match.index, brand: brand.normalized }] : [];
  });

  return matches
    .sort((a, b) => a.index - b.index)
    .map((match) => match.brand)
    .filter((brand, index, all) => all.indexOf(brand) === index);
}

export function detectBrand(text: string): string | null {
  return findBrands(text)[0] ?? null;
}

function buildTextFromItems(items: PositionedTextItem[]): string {
  const sorted = [...items].sort((a, b) => a.x - b.x);
  let text = "";
  let previousEndX = Number.NEGATIVE_INFINITY;

  for (const item of sorted) {
    const value = item.str.trim();
    if (!value) continue;

    if (text && item.x - previousEndX > 2) {
      text += " ";
    }

    text += value;
    previousEndX = Math.max(previousEndX, item.endX);
  }

  return normalizeSpaces(text);
}

function groupItemsByY(items: PositionedTextItem[]): PositionedTextItem[][] {
  const tolerance = 3;
  const rows: PositionedTextItem[][] = [];

  for (const item of [...items].sort((a, b) => b.y - a.y || a.x - b.x)) {
    const row = rows.find((candidate) => Math.abs(candidate[0].y - item.y) <= tolerance);
    if (row) {
      row.push(item);
      continue;
    }

    rows.push([item]);
  }

  return rows;
}

function rowHasPrices(row: RawPdfRow): boolean {
  PRICE_TRIPLE_RE.lastIndex = 0;
  return PRICE_TRIPLE_RE.test(row.text);
}

function isPriceOnlyLine(text: string): boolean {
  const value = normalizeSpaces(text);
  PRICE_TRIPLE_RE.lastIndex = 0;
  const match = PRICE_TRIPLE_RE.exec(value);
  return Boolean(match && match.index === 0 && match[0].length === value.length);
}

export async function parsePdfToRawRows(buffer: Buffer): Promise<RawPdfRow[]> {
  const rows: RawPdfRow[] = [];
  let renderPage = 0;
  const pdfParse = loadPdfParse();

  const result = await pdfParse(buffer, {
    pagerender: async (pageData) => {
      renderPage += 1;
      const page = pageData.pageIndex != null ? pageData.pageIndex + 1 : renderPage;
      const viewport = pageData.getViewport(1.0);
      const midpoint = viewport.width / 2;
      const content = await pageData.getTextContent({
        normalizeWhitespace: false,
        disableCombineTextItems: true,
      });

      const positioned = content.items
        .map((item) => {
          const x = item.transform[4] ?? 0;
          const y = item.transform[5] ?? 0;
          return {
            str: item.str,
            x,
            y,
            endX: x + (item.width ?? Math.max(item.str.length * 4, 1)),
          };
        })
        .filter((item) => item.str.trim().length > 0);

      const visualRows = groupItemsByY(positioned);

      visualRows.forEach((visualRow, visualLine) => {
        const leftItems = visualRow.filter((item) => item.x < midpoint);
        const rightItems = visualRow.filter((item) => item.x >= midpoint);
        const wholeText = buildTextFromItems(visualRow);

        const candidates: RawPdfRow[] = [];
        const leftText = buildTextFromItems(leftItems);
        const rightText = buildTextFromItems(rightItems);

        if (leftText) {
          candidates.push({
            page,
            side: "left",
            text: leftText,
            rawText: leftText,
            brand: detectBrand(leftText) ?? undefined,
            visualLine,
          });
        }

        if (rightText) {
          candidates.push({
            page,
            side: "right",
            text: rightText,
            rawText: rightText,
            brand: detectBrand(rightText) ?? undefined,
            visualLine,
          });
        }

        if (candidates.length === 0 && wholeText) {
          candidates.push({
            page,
            text: wholeText,
            rawText: wholeText,
            brand: detectBrand(wholeText) ?? undefined,
            visualLine,
          });
        }

        for (const candidate of candidates) {
          if (!candidate.text || isHeaderOrNoise(candidate.text)) continue;
          rows.push(candidate);
        }
      });

      return "";
    },
  });

  console.log(`[pdf-parser] Total páginas: ${result.numpages}`);
  return rows.sort(
    (a, b) =>
      a.page - b.page ||
      (a.visualLine ?? 0) - (b.visualLine ?? 0) ||
      (a.side === b.side ? 0 : a.side === "left" ? -1 : 1),
  );
}

function cleanModel(value: string): string {
  return normalizeSpaces(
    value
      .replace(/\bMODELO\b/gi, " ")
      .replace(/\bPRECIO\s*[123]\b/gi, " ")
      .replace(/[|]+/g, " "),
  );
}

function cleanBatterySection(value: string): string {
  return cleanModel(value)
    .replace(/\bBATER[IÍ]AS\b/gi, " ")
    .replace(/\bALTA\s+COPIA\b/gi, "Alta Copia")
    .replace(/\bDIAGNOSTICO\b/gi, "Diagnóstico")
    .replace(/\bALTA\s+CAPACIDAD\b/gi, "Alta Capacidad")
    .split(" ")
    .map((part) => {
      const brand = detectBrand(part);
      return brand ?? part;
    })
    .join(" ")
    .replace(/\biPhone\b\s+Diagnóstico/gi, "iPhone Diagnóstico")
    .replace(/\biPhone\b\s+Alta Copia/gi, "iPhone Alta Copia")
    .trim();
}

function cleanBatteryModel(value: string): string {
  return cleanModel(value)
    .replace(/\bUItra\b/g, "Ultra")
    .replace(/([A-Za-z])(\d{4}\s*mAh\b)/g, "$1 $2")
    .replace(/\b(\d{1,2})(\d{4}\s*mAh\b)/g, "$1 $2")
    .replace(/\bmAh\b/g, "mAh");
}

function prefixBatteryModel(model: string, section: string): string {
  const cleanSection = cleanBatterySection(section);
  const cleanValue = cleanBatteryModel(model);
  if (!cleanSection) return cleanValue;
  if (normalizeForMatch(cleanValue).startsWith(normalizeForMatch(cleanSection))) return cleanValue;
  return normalizeSpaces(`${cleanSection} ${cleanValue}`);
}

function splitLineAfterFirstRecord(line: string): { firstLine: string; trailing: string } | null {
  PRICE_TRIPLE_RE.lastIndex = 0;
  const match = PRICE_TRIPLE_RE.exec(line);
  if (!match) return null;

  return {
    firstLine: line.slice(0, match.index + match[0].length).trim(),
    trailing: line.slice(match.index + match[0].length).trim(),
  };
}

export function extractRecordsFromLine(
  line: string,
  brand: string,
  page: number,
): ParsedPriceItem[] {
  if (isHeaderOrNoise(line)) return [];

  const results: ParsedPriceItem[] = [];
  let cursor = 0;
  let match: RegExpExecArray | null;

  PRICE_TRIPLE_RE.lastIndex = 0;
  while ((match = PRICE_TRIPLE_RE.exec(line)) !== null) {
    const rawText = line.slice(cursor, match.index + match[0].length).trim();
    const model = cleanModel(line.slice(cursor, match.index));
    cursor = match.index + match[0].length;

    if (!model || isHeaderOrNoise(model)) continue;

    results.push({
      brand,
      model,
      price: parsePrice(match[3]),
      sourcePage: page,
      rawText,
    });
  }

  return results;
}

export function buildDataFramesByBrand(items: ParsedPriceItem[]): Map<string, dfd.DataFrame> {
  const { DataFrame } = loadDanfo();
  const grouped = new Map<string, ParsedPriceItem[]>();

  for (const item of items) {
    const brand = (detectBrand(item.brand) ?? normalizeSpaces(item.brand)) || "Sin marca";
    const current = grouped.get(brand) ?? [];
    current.push({ ...item, brand });
    grouped.set(brand, current);
  }

  return new Map(
    [...grouped.entries()].map(([brand, brandItems]) => [brand, new DataFrame(brandItems)]),
  );
}

function dataframeToRows(df: dfd.DataFrame): Record<string, unknown>[] {
  const json = df.toJSON({ format: "row" }) as unknown;
  return Array.isArray(json) ? (json as Record<string, unknown>[]) : [];
}

function normalizeBrandName(value: unknown): string {
  const text = normalizeSpaces(String(value ?? ""));
  return (detectBrand(text) ?? text) || "Sin marca";
}

export function cleanBrandDataFrame(df: dfd.DataFrame): dfd.DataFrame {
  const { DataFrame } = loadDanfo();
  const seen = new Set<string>();
  const cleaned: ParsedPriceItem[] = [];

  for (const row of dataframeToRows(df)) {
    const brand = normalizeBrandName(row.brand);
    const model = cleanModel(String(row.model ?? ""));
    const price = parsePrice(row.price);

    if (!model || isHeaderOrNoise(model)) continue;
    if (!Number.isFinite(price) || price <= 0) continue;

    const dedupeKey = `${brand}|${model}|${price}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    cleaned.push({
      brand,
      model,
      price,
      sourcePage: parsePrice(row.sourcePage) || undefined,
      rawText: row.rawText == null ? undefined : String(row.rawText),
    });
  }

  return new DataFrame(cleaned);
}

export function dataFramesToRecords(frames: Map<string, dfd.DataFrame>): ParsedPriceItem[] {
  const { DataFrame, concat } = loadDanfo();
  const frameList = [...frames.values()];

  if (frameList.length === 0) return [];

  const finalDf =
    frameList.length === 1
      ? frameList[0]
      : concat
        ? concat({ dfList: frameList, axis: 0 })
        : new DataFrame(frameList.flatMap((frame) => dataframeToRows(frame)));

  return dataframeToRows(finalDf).map((row) => ({
    brand: normalizeBrandName(row.brand),
    model: cleanModel(String(row.model ?? "")),
    price: parsePrice(row.price),
    sourcePage: parsePrice(row.sourcePage) || undefined,
    rawText: row.rawText == null ? undefined : String(row.rawText),
  }));
}

function applyLateBrand(
  pending: ParsedPriceItem[],
  brand: string,
  side: "left" | "right",
): void {
  const unbranded = pending.filter((item) => item.brand === "Sin marca");
  if (unbranded.length === 0) return;

  for (const item of unbranded) {
    item.brand = brand;
  }

  console.warn(
    `[pdf-parser] Marca "${brand}" detectada después del bloque ${side}; ` +
      `${unbranded.length} registro(s) pendientes reasignados.`,
  );
}

function extractBatteryLineRecords(
  line: string,
  section: string,
  page: number,
): ParsedPriceItem[] {
  return extractRecordsFromLine(line, "Baterías", page).map((record) => ({
    ...record,
    model: prefixBatteryModel(record.model, section),
  }));
}

function extractBatteryPageRecords(rawRows: RawPdfRow[], batteryPages: Set<number>): ParsedPriceItem[] {
  const records: ParsedPriceItem[] = [];
  const sectionsByPage = new Map<number, Record<"left" | "right", string>>();
  const rowsByLine = new Map<string, RawPdfRow[]>();

  for (const row of rawRows) {
    if (!batteryPages.has(row.page)) continue;
    const key = `${row.page}:${row.visualLine ?? 0}`;
    const rows = rowsByLine.get(key) ?? [];
    rows.push(row);
    rowsByLine.set(key, rows);
  }

  for (const lineRows of [...rowsByLine.values()].sort(
    (a, b) =>
      a[0].page - b[0].page ||
      (a[0].visualLine ?? 0) - (b[0].visualLine ?? 0),
  )) {
    const page = lineRows[0].page;
    const sections = sectionsByPage.get(page) ?? { left: "", right: "" };
    sectionsByPage.set(page, sections);

    const left = lineRows.find((row) => row.side === "left");
    const right = lineRows.find((row) => row.side === "right");

    for (const row of lineRows) {
      if (detectBrand(row.text) === "Baterías" || isHeaderOrNoise(row.text)) continue;
      if (!rowHasPrices(row)) {
        const side = row.side ?? "left";
        sections[side] = cleanBatterySection(row.text);
      }
    }

    if (!left && !right) continue;

    if (left && right && isPriceOnlyLine(right.text)) {
      const split = splitLineAfterFirstRecord(left.text);
      if (split?.trailing) {
        records.push(...extractBatteryLineRecords(split.firstLine, sections.left, page));
        records.push(
          ...extractBatteryLineRecords(`${split.trailing} ${right.text}`, sections.right, page),
        );
        continue;
      }
    }

    if (left && rowHasPrices(left)) {
      records.push(...extractBatteryLineRecords(left.text, sections.left, page));
    }

    if (right && rowHasPrices(right) && !isPriceOnlyLine(right.text)) {
      records.push(...extractBatteryLineRecords(right.text, sections.right, page));
    }
  }

  if (records.length > 0) {
    console.log(`[pdf-parser] Registros Baterías: ${records.length}`);
  }

  return records;
}

function runParserSelfTest(): void {
  const cases = [
    {
      desc: "dos registros pegados",
      input: "A01M/A01F$250$200$140A23 4G/M33 ORI$250$200$170",
      expectedCount: 2,
    },
    {
      desc: "precio con miles",
      input: "A80 ORIGINAL MARCO$1,900$1,800$1,710",
      expectedCount: 1,
      expectedPrice: 1710,
    },
    {
      desc: "encabezado",
      input: "MODELOPRECIO 1PRECIO 2PRECIO 3MODELOPRECIO 1PRECIO 2PRECIO 3",
      expectedCount: 0,
    },
    {
      desc: "modelo con espacios dobles",
      input: "A23 4G/M33  ORI$250$200$170",
      expectedCount: 1,
      expectedModel: "A23 4G/M33 ORI",
    },
  ];

  let passed = 0;
  for (const item of cases) {
    const result = extractRecordsFromLine(item.input, "Samsung", 1);
    const ok =
      result.length === item.expectedCount &&
      (item.expectedModel == null || result[0]?.model === item.expectedModel) &&
      (item.expectedPrice == null || result[0]?.price === item.expectedPrice);

    if (!ok) {
      console.warn(`[pdf-parser][test] FAIL ${item.desc}:`, result);
      continue;
    }

    passed += 1;
  }

  console.log(`[pdf-parser][test] ${passed}/${cases.length} casos OK`);
}

export async function parsePriceListPdf(buffer: Buffer): Promise<ParsedPriceItem[]> {
  console.log("[pdf-parser] Iniciando parse");
  if (process.env.NODE_ENV !== "production") {
    runParserSelfTest();
  }

  const rawRows = await parsePdfToRawRows(buffer);
  console.log(`[pdf-parser] Raw rows: ${rawRows.length}`);

  const batteryPages = new Set(
    rawRows
      .filter((row) => detectBrand(row.text) === "Baterías" && !rowHasPrices(row))
      .map((row) => row.page),
  );
  const batteryRecords = extractBatteryPageRecords(rawRows, batteryPages);
  const parserRows = rawRows.filter((row) => !batteryPages.has(row.page));

  const records: ParsedPriceItem[] = [];
  const pendingBySide: Record<"left" | "right", ParsedPriceItem[]> = {
    left: [],
    right: [],
  };
  let leftBrand = "Sin marca";
  let rightBrand = "Sin marca";

  for (let index = 0; index < parserRows.length; index += 1) {
    const row = parserRows[index];
    const side = row.side ?? "left";
    const sameVisualRow = parserRows.filter(
      (candidate) =>
        candidate.page === row.page &&
        candidate.visualLine === row.visualLine &&
        Boolean(candidate.brand),
    );
    const rowBrands =
      sameVisualRow.length > 1
        ? sameVisualRow.map((candidate) => candidate.brand).filter(Boolean)
        : findBrands(row.text);

    if (!rowHasPrices(row) && rowBrands.length > 0) {
      if (rowBrands.length >= 2) {
        leftBrand = rowBrands[0] ?? leftBrand;
        rightBrand = rowBrands[1] ?? rightBrand;
        applyLateBrand(pendingBySide.left, leftBrand, "left");
        applyLateBrand(pendingBySide.right, rightBrand, "right");
      } else if (side === "right") {
        rightBrand = rowBrands[0] ?? rightBrand;
        applyLateBrand(pendingBySide.right, rightBrand, "right");
      } else {
        leftBrand = rowBrands[0] ?? leftBrand;
        applyLateBrand(pendingBySide.left, leftBrand, "left");
      }
      continue;
    }

    const brand = side === "right" ? rightBrand : leftBrand;
    if (rowHasPrices(row) && brand === "Sin marca") {
      console.warn(
        `[pdf-parser] Warning: fila con precios sin marca en página ${row.page}, ` +
          `columna ${side}: "${row.text}"`,
      );
    }

    const extracted = extractRecordsFromLine(row.text, brand, row.page);
    records.push(...extracted);
    if (brand === "Sin marca") {
      pendingBySide[side].push(...extracted);
    } else {
      pendingBySide[side] = [];
    }
  }

  records.push(...batteryRecords);
  console.log(`[pdf-parser] Registros crudos: ${records.length}`);

  const frames = buildDataFramesByBrand(records);
  console.log(`[pdf-parser] DataFrames por marca: ${frames.size}`);

  const cleanedFrames = new Map<string, dfd.DataFrame>();
  for (const [brand, frame] of frames) {
    cleanedFrames.set(brand, cleanBrandDataFrame(frame));
  }

  const finalRecords = dataFramesToRecords(cleanedFrames);
  console.log(`[pdf-parser] Registros finales: ${finalRecords.length}`);
  return finalRecords;
}

export const parsePdfPriceList = parsePriceListPdf;
