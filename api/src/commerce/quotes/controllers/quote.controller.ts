import { Request, Response } from "express";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { QuoteService } from "../services/quote.service.js";
import { LocalService } from "../../../app_platform/local/services/local.service.js";
import { PdfRendererService } from "../../../reporting/pdf/pdf-renderer.service.js";
import { QuoteDocument } from "../../../reporting/pdf/documents/quote.document.js";
import { toQuotePdfData } from "../../../reporting/pdf/documents/quote.pdf-data.js";
import { CreateQuoteDto } from "../dtos/create-quote.dto.js";
import { UpdateQuoteDto } from "../dtos/update-quote.dto.js";
import { SetQuoteStatusDto } from "../dtos/set-quote-status.dto.js";

const validationErrors = (errors: { constraints?: Record<string, string> }[]): string[] =>
  errors.map((e) => Object.values(e.constraints ?? {})).flat();

export class QuoteController {
  constructor(
    private service: QuoteService,
    private localService: LocalService,
    private pdfRendererService: PdfRendererService,
  ) {}

  getAll = async (_req: Request, res: Response): Promise<void> => {
    try {
      res.status(200).json(await this.service.getAll());
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const quote = await this.service.getById(req.params["id"] as string);
      if (!quote) {
        res.status(404).json({ error: "Cotización no encontrada" });
        return;
      }
      res.status(200).json(quote);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getItems = async (req: Request, res: Response): Promise<void> => {
    try {
      res.status(200).json(await this.service.getItems(req.params["id"] as string));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const dto = plainToInstance(CreateQuoteDto, req.body);
      const errors = await validate(dto);
      if (errors.length > 0) {
        res.status(400).json({ error: validationErrors(errors) });
        return;
      }
      const { items, ...data } = dto;
      const quote = await this.service.create(data as any, items);
      res.status(201).json(quote);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const dto = plainToInstance(UpdateQuoteDto, req.body);
      const errors = await validate(dto);
      if (errors.length > 0) {
        res.status(400).json({ error: validationErrors(errors) });
        return;
      }
      const { items, ...data } = dto;
      const quote = await this.service.update(req.params["id"] as string, data, items);
      if (!quote) {
        res.status(404).json({ error: "Cotización no encontrada" });
        return;
      }
      res.status(200).json(quote);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  setStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const dto = plainToInstance(SetQuoteStatusDto, req.body);
      const errors = await validate(dto);
      if (errors.length > 0) {
        res.status(400).json({ error: validationErrors(errors) });
        return;
      }
      const quote = await this.service.setStatus(req.params["id"] as string, dto.status);
      if (!quote) {
        res.status(404).json({ error: "Cotización no encontrada" });
        return;
      }
      res.status(200).json(quote);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const deleted = await this.service.delete(req.params["id"] as string);
      if (!deleted) {
        res.status(404).json({ error: "Cotización no encontrada" });
        return;
      }
      res.status(200).json({ message: "Cotización eliminada" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getPdf = async (req: Request, res: Response): Promise<void> => {
    try {
      const quote = await this.service.getById(req.params["id"] as string);
      if (!quote) {
        res.status(404).json({ error: "Cotización no encontrada" });
        return;
      }
      const items = await this.service.getItems(quote.id);
      const local = await this.localService.getConfig();
      const data = toQuotePdfData(quote, items, local);
      const buffer = await this.pdfRendererService.render(QuoteDocument, { data });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="cotizacion-${quote.id}.pdf"`);
      res.status(200).send(buffer);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}
