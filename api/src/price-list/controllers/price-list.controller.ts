import { Request, Response } from "express";
import { PriceListService } from "../services/price-list.service.js";
import { SupplierService } from "../../suppliers/services/supplier.service.js";

export class PriceListController {
  constructor(
    private service: PriceListService,
    private supplierService: SupplierService,
  ) {}

  getAll = async (req: Request, res: Response): Promise<void> => {
    console.log("[controller] getAll llamado, query:", req.query);
    try {
      const { q } = req.query;
      const items = q
        ? await this.service.search(String(q))
        : await this.service.getAll();
      res.status(200).json(items);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const item = await this.service.create(req.body);
      res.status(201).json(item);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params["id"] as string;
      const item = await this.service.update(id, req.body);
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
      const id = req.params["id"] as string;
      const deleted = await this.service.delete(id);
      if (!deleted) {
        res.status(404).json({ error: "Item no encontrado" });
        return;
      }
      res.status(200).json({ message: "Item eliminado" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  uploadPdf = async (req: Request, res: Response): Promise<void> => {
    console.log("[controller] uploadPdf llamado");
    try {
      if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
        res.status(400).json({ error: "No se recibió ningún archivo PDF" });
        return;
      }

      const { supplierId } = req.query;
      if (!supplierId || typeof supplierId !== "string") {
        res.status(400).json({ error: "Se requiere el parámetro supplierId" });
        return;
      }

      const supplier = await this.supplierService.getById(supplierId);
      if (!supplier) {
        res.status(404).json({ error: "Proveedor no encontrado" });
        return;
      }

      if (supplier.name !== "MN Refacciones") {
        res.status(200).json({ message: "en desarrollo" });
        return;
      }

      console.log("[controller] Llamando service.importFromPdf con buffer de", req.body.length, "bytes");
      const result = await this.service.importFromPdf(req.body, supplierId);
      console.log("[controller] importFromPdf OK, resultado:", result);
      res.status(200).json(result);
    } catch (error: any) {
      console.error("[controller] ERROR en uploadPdf:", error);
      res.status(400).json({ error: error.message });
    }
  };
}
