import { Request, Response } from "express";
import { MessageTemplateService } from "../services/message-template.service.js";

export class MessageTemplateController {
  constructor(private service: MessageTemplateService) {}

  getAll = async (_req: Request, res: Response): Promise<void> => {
    try {
      const templates = await this.service.getAll();
      res.status(200).json(templates);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getByKey = async (req: Request, res: Response): Promise<void> => {
    try {
      const key = req.params["key"] as string;
      const template = await this.service.getByKey(key);
      if (!template) {
        res.status(404).json({ error: "Template no encontrado" });
        return;
      }
      res.status(200).json(template);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const template = await this.service.create(req.body);
      res.status(201).json(template);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params["id"] as string;
      const template = await this.service.update(id, req.body);
      if (!template) {
        res.status(404).json({ error: "Template no encontrado" });
        return;
      }
      res.status(200).json(template);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params["id"] as string;
      const deleted = await this.service.delete(id);
      if (!deleted) {
        res.status(404).json({ error: "Template no encontrado" });
        return;
      }
      res.status(200).json({ message: "Template eliminado" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}
