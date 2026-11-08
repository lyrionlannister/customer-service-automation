import { Request, Response } from "express";
import { SupplierService } from "../services/supplier.service.js";

export class SupplierController {
  constructor(private service: SupplierService) {}

  getAll = async (_req: Request, res: Response): Promise<void> => {
    try {
      const suppliers = await this.service.getAll();
      res.status(200).json(suppliers);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}
