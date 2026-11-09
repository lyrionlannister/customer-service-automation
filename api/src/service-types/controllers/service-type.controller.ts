import { Request, Response } from "express";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { ServiceTypeService } from "../services/service-type.service.js";
import { CreateServiceTypeDto } from "../dtos/create-service-type.dto.js";

export class ServiceTypeController {
  constructor(private service: ServiceTypeService) {}

  getAll = async (_req: Request, res: Response): Promise<void> => {
    try {
      res.status(200).json(await this.service.getAll());
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const dto = plainToInstance(CreateServiceTypeDto, req.body);
      const errors = await validate(dto);
      if (errors.length > 0) {
        res.status(400).json({ error: errors.map((e) => Object.values(e.constraints ?? {})).flat() });
        return;
      }
      res.status(201).json(await this.service.create(dto.name));
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };
}
