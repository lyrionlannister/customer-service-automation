import { createElement, type ComponentType } from "react";
import { renderToBuffer } from "@react-pdf/renderer";

export class PdfRendererService {
  async render<P extends object>(DocumentComponent: ComponentType<P>, data: P): Promise<Buffer> {
    return renderToBuffer(createElement(DocumentComponent, data));
  }
}
