import sharp from "sharp";

const DATA_URI_RE = /^data:([^;]+);base64,(.+)$/;

/**
 * @react-pdf/renderer no soporta SVG embebido de forma confiable (mismo
 * gotcha que dompdf) -- si el logo subido es SVG, se rasteriza a PNG aqui,
 * una sola vez al guardarlo, para que el render del PDF siempre reciba un
 * raster que si puede embeber.
 */
export async function rasterizeLogoIfSvg(dataUri: string): Promise<string> {
  const match = DATA_URI_RE.exec(dataUri);
  if (!match) return dataUri;

  const [, mime, base64] = match;
  if (mime !== "image/svg+xml") return dataUri;

  const svgBuffer = Buffer.from(base64, "base64");
  const pngBuffer = await sharp(svgBuffer).png().toBuffer();
  return `data:image/png;base64,${pngBuffer.toString("base64")}`;
}
