import { Request, Response } from "express";
import { CustomerService } from "../services/customer.service.js";

export class CustomerController {
  constructor(private service: CustomerService) {}

  getAll = async (_req: Request, res: Response): Promise<void> => {
    try {
      res.status(200).json(await this.service.getAll());
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const customer = await this.service.getById(req.params["id"] as string);
      if (!customer) {
        res.status(404).json({ error: "Cliente no encontrado" });
        return;
      }
      res.status(200).json(customer);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getDevices = async (req: Request, res: Response): Promise<void> => {
    try {
      res.status(200).json(await this.service.getDeviceHistory(req.params["id"] as string));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const customer = await this.service.create(req.body);
      res.status(201).json(customer);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params["id"] as string;
      const customer = await this.service.update(id, req.body);
      if (!customer) {
        res.status(404).json({ error: "Cliente no encontrado" });
        return;
      }
      res.status(200).json(customer);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params["id"] as string;
      const deleted = await this.service.delete(id);
      if (!deleted) {
        res.status(404).json({ error: "Cliente no encontrado" });
        return;
      }
      res.status(200).json({ message: "Cliente eliminado" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}
