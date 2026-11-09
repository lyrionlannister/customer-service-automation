import { Request, Response } from "express";
import { BranchService } from "../services/branch.service.js";

export class BranchController {
  constructor(private service: BranchService) {}

  getAll = async (_req: Request, res: Response): Promise<void> => {
    try {
      res.status(200).json(await this.service.getAll());
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const branch = await this.service.getById(req.params["id"] as string);
      if (!branch) {
        res.status(404).json({ error: "Sucursal no encontrada" });
        return;
      }
      res.status(200).json(branch);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const branch = await this.service.create(req.body);
      res.status(201).json(branch);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params["id"] as string;
      const branch = await this.service.update(id, req.body);
      if (!branch) {
        res.status(404).json({ error: "Sucursal no encontrada" });
        return;
      }
      res.status(200).json(branch);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  setActive = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params["id"] as string;
      const branch = await this.service.setActive(id, Boolean(req.body.isActive));
      if (!branch) {
        res.status(404).json({ error: "Sucursal no encontrada" });
        return;
      }
      res.status(200).json(branch);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };
}
