import { Request, Response } from "express";
import { LocalService } from "../services/local.service.js";

export class LocalController {
  constructor(private localService: LocalService) {}

  get = async (_req: Request, res: Response): Promise<void> => {
    try {
      const config = await this.localService.getConfig();
      res.status(200).json(config);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const config = await this.localService.updateConfig(req.body);
      res.status(200).json(config);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}
