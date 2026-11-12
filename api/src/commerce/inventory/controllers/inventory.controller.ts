import { Request, Response } from "express";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { InventoryService } from "../services/inventory.service.js";
import { CreateInventoryItemDto } from "../dtos/create-inventory-item.dto.js";
import { RegisterMovementDto } from "../dtos/register-movement.dto.js";
import { parseInventoryImportFile } from "../utils/inventory-import-parser.js";

export class InventoryController {
  constructor(private service: InventoryService) {}

  getAll = async (_req: Request, res: Response): Promise<void> => {
    try {
      res.status(200).json(await this.service.getAll());
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const item = await this.service.getById(req.params["id"] as string);
      if (!item) {
        res.status(404).json({ error: "Item no encontrado" });
        return;
      }
      res.status(200).json(item);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const dto = plainToInstance(CreateInventoryItemDto, req.body);
      const errors = await validate(dto);
      if (errors.length > 0) {
        res.status(400).json({ error: errors.map((e) => Object.values(e.constraints ?? {})).flat() });
        return;
      }
      res.status(201).json(await this.service.create(dto as any));
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const item = await this.service.update(req.params["id"] as string, req.body);
      if (!item) {
        res.status(404).json({ error: "Item no encontrado" });
        return;
      }
      res.status(200).json(item);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const deleted = await this.service.delete(req.params["id"] as string);
      if (!deleted) {
        res.status(404).json({ error: "Item no encontrado" });
        return;
      }
      res.status(200).json({ message: "Item eliminado" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getMovements = async (req: Request, res: Response): Promise<void> => {
    try {
      res.status(200).json(await this.service.getMovements(req.params["id"] as string));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  bulkImport = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
        res.status(400).json({ error: "No se recibió ningún archivo" });
        return;
      }
      const { localId } = req.query;
      if (!localId || typeof localId !== "string") {
        res.status(400).json({ error: "Se requiere el parámetro localId" });
        return;
      }

      const { rows, errors } = parseInventoryImportFile(req.body);
      if (errors.length > 0) {
        res.status(400).json({ error: "El archivo tiene errores", details: errors });
        return;
      }
      if (rows.length === 0) {
        res.status(400).json({ error: "El archivo no tiene filas para importar" });
        return;
      }

      res.status(200).json(await this.service.bulkImport(localId, rows));
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  registerMovement = async (req: Request, res: Response): Promise<void> => {
    try {
      const dto = plainToInstance(RegisterMovementDto, req.body);
      const errors = await validate(dto);
      if (errors.length > 0) {
        res.status(400).json({ error: errors.map((e) => Object.values(e.constraints ?? {})).flat() });
        return;
      }
      const movement = await this.service.registerMovement({
        inventoryItemId: req.params["id"] as string,
        type: dto.type,
        quantity: dto.quantity,
        reason: dto.reason,
        createdByEmployeeId: dto.createdByEmployeeId,
      });
      res.status(201).json(movement);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };
}
