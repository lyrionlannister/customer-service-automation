import { describe, expect, it } from "vitest";
import sharp from "sharp";
import { rasterizeLogoIfSvg } from "../../../../src/core/common/utils/rasterize-logo.js";

const SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10" fill="red"/></svg>`;

describe("rasterizeLogoIfSvg", () => {
  it("convierte un data URI de SVG a PNG", async () => {
    const svgDataUri = `data:image/svg+xml;base64,${Buffer.from(SVG).toString("base64")}`;

    const result = await rasterizeLogoIfSvg(svgDataUri);

    expect(result.startsWith("data:image/png;base64,")).toBe(true);
    const pngBuffer = Buffer.from(result.split(",")[1], "base64");
    const metadata = await sharp(pngBuffer).metadata();
    expect(metadata.format).toBe("png");
  });

  it("deja intacto un data URI que ya es PNG", async () => {
    const pngDataUri = "data:image/png;base64,iVBORw0KGgo=";

    const result = await rasterizeLogoIfSvg(pngDataUri);

    expect(result).toBe(pngDataUri);
  });

  it("deja intacto un string que no es un data URI", async () => {
    const result = await rasterizeLogoIfSvg("https://example.com/logo.png");

    expect(result).toBe("https://example.com/logo.png");
  });
});
