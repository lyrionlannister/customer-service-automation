import { Request, Response } from "express";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { ImportStagingService } from "../services/import-staging.service.js";
import { triggerImportStagingWorkflow } from "../trigger-workflow.js";
import { UpdateStagingRowsDto } from "../dtos/update-staging-rows.dto.js";
import { ImportStagingCallbackDto } from "../dtos/import-staging-callback.dto.js";

export class ImportStagingController {
  constructor(private service: ImportStagingService) {}

  upload = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
        res.status(400).json({ error: "No se recibió ningún archivo" });
        return;
      }
      const { supplierId } = req.query;
      if (!supplierId || typeof supplierId !== "string") {
        res.status(400).json({ error: "Se requiere el parámetro supplierId" });
        return;
      }

      const { importId, tenantId } = await this.service.startUpload(supplierId);
      const fileName = typeof req.query.fileName === "string" ? req.query.fileName : "lista.pdf";

      try {
        await triggerImportStagingWorkflow({ tenantId, importId, fileName, fileBuffer: req.body });
      } catch (error) {
        console.error("[import-staging] Error disparando workflow n8n:", error);
      }

      res.status(202).json({ importId, status: "processing" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const record = await this.service.getById(req.params["importId"] as string);
      if (!record) {
        res.status(404).json({ error: "Staging no encontrado o expirado" });
        return;
      }
      res.status(200).json(record);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  updateRows = async (req: Request, res: Response): Promise<void> => {
    try {
      const dto = plainToInstance(UpdateStagingRowsDto, req.body);
      const errors = await validate(dto);
      if (errors.length > 0) {
        res.status(400).json({ error: errors.map((e) => Object.values(e.constraints ?? {})).flat() });
        return;
      }
      const record = await this.service.updateRows(req.params["importId"] as string, dto.rows);
      if (!record) {
        res.status(404).json({ error: "Staging no encontrado o expirado" });
        return;
      }
      res.status(200).json(record);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  commit = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.service.commit(req.params["importId"] as string);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  discard = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.service.discard(req.params["importId"] as string);
      res.status(200).json({ message: "Staging descartado" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  callback = async (req: Request, res: Response): Promise<void> => {
    try {
      const dto = plainToInstance(ImportStagingCallbackDto, req.body);
      const errors = await validate(dto);
      if (errors.length > 0) {
        res.status(400).json({ error: errors.map((e) => Object.values(e.constraints ?? {})).flat() });
        return;
      }
      if (!dto.rows && !dto.error) {
        res.status(400).json({ error: "Se requiere rows o error" });
        return;
      }
      await this.service.applyCallback(
        dto.tenantId,
        dto.importId,
        dto.error ? { error: dto.error } : { rows: dto.rows! },
      );
      res.status(200).json({ ok: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };
}
