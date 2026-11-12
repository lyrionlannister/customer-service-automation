import { Request, Response } from "express";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { RevenueAttributionService } from "../services/revenue-attribution.service.js";
import { SetAttributionBasisDto } from "../dtos/set-attribution-basis.dto.js";

export class RevenueAttributionController {
  constructor(private service: RevenueAttributionService) {}

  getSetting = async (_req: Request, res: Response): Promise<void> => {
    try {
      res.status(200).json(await this.service.getSetting());
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  updateSetting = async (req: Request, res: Response): Promise<void> => {
    try {
      const dto = plainToInstance(SetAttributionBasisDto, req.body);
      const errors = await validate(dto);
      if (errors.length > 0) {
        res.status(400).json({ error: errors.map((e) => Object.values(e.constraints ?? {})).flat() });
        return;
      }
      res.status(200).json(await this.service.setBasis(dto.attributionBasis));
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };
}
