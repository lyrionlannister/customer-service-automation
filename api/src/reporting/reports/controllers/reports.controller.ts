import { Request, Response } from "express";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { ReportsService } from "../services/reports.service.js";
import { EmployeePerformanceQueryDto } from "../dtos/employee-performance-query.dto.js";
import { AccessorySalesQueryDto } from "../dtos/accessory-sales-query.dto.js";
import { RepairNotesByTypeQueryDto } from "../dtos/repair-notes-by-type-query.dto.js";

export class ReportsController {
  constructor(private service: ReportsService) {}

  getEmployeePerformance = async (req: Request, res: Response): Promise<void> => {
    try {
      const dto = plainToInstance(EmployeePerformanceQueryDto, req.query);
      const errors = await validate(dto);
      if (errors.length > 0) {
        res.status(400).json({ error: errors.map((e) => Object.values(e.constraints ?? {})).flat() });
        return;
      }
      res.status(200).json(await this.service.getEmployeePerformance(dto));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getAccessorySales = async (req: Request, res: Response): Promise<void> => {
    try {
      const dto = plainToInstance(AccessorySalesQueryDto, req.query);
      const errors = await validate(dto);
      if (errors.length > 0) {
        res.status(400).json({ error: errors.map((e) => Object.values(e.constraints ?? {})).flat() });
        return;
      }
      res.status(200).json(await this.service.getAccessorySales(dto));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getRepairNotesByType = async (req: Request, res: Response): Promise<void> => {
    try {
      const dto = plainToInstance(RepairNotesByTypeQueryDto, req.query);
      const errors = await validate(dto);
      if (errors.length > 0) {
        res.status(400).json({ error: errors.map((e) => Object.values(e.constraints ?? {})).flat() });
        return;
      }
      res.status(200).json(await this.service.getRepairNotesByType(dto));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}
