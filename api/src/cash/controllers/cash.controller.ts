import { Request, Response } from "express";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { CashService } from "../services/cash.service.js";
import { OpenCashSessionDto } from "../dtos/open-cash-session.dto.js";
import { CloseCashSessionDto } from "../dtos/close-cash-session.dto.js";
import { RegisterCashMovementDto } from "../dtos/register-cash-movement.dto.js";

const validationErrors = (errors: { constraints?: Record<string, string> }[]): string[] =>
  errors.map((e) => Object.values(e.constraints ?? {})).flat();

export class CashController {
  constructor(private service: CashService) {}

  getAllSessions = async (_req: Request, res: Response): Promise<void> => {
    try {
      res.status(200).json(await this.service.getAllSessions());
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getOpenSession = async (req: Request, res: Response): Promise<void> => {
    try {
      const localId = req.query["localId"];
      if (!localId || typeof localId !== "string") {
        res.status(400).json({ error: "Se requiere el parámetro localId" });
        return;
      }
      res.status(200).json(await this.service.getOpenSession(localId));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getSessionById = async (req: Request, res: Response): Promise<void> => {
    try {
      const session = await this.service.getSessionById(req.params["id"] as string);
      if (!session) {
        res.status(404).json({ error: "Sesión de caja no encontrada" });
        return;
      }
      res.status(200).json(session);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  openSession = async (req: Request, res: Response): Promise<void> => {
    try {
      const dto = plainToInstance(OpenCashSessionDto, req.body);
      const errors = await validate(dto);
      if (errors.length > 0) {
        res.status(400).json({ error: validationErrors(errors) });
        return;
      }
      const session = await this.service.openSession(dto.localId, dto.openingBalance, dto.openedByEmployeeId);
      res.status(201).json(session);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  closeSession = async (req: Request, res: Response): Promise<void> => {
    try {
      const dto = plainToInstance(CloseCashSessionDto, req.body);
      const errors = await validate(dto);
      if (errors.length > 0) {
        res.status(400).json({ error: validationErrors(errors) });
        return;
      }
      const session = await this.service.closeSession(req.params["id"] as string, dto.closingBalance);
      res.status(200).json(session);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  getMovements = async (req: Request, res: Response): Promise<void> => {
    try {
      res.status(200).json(await this.service.getMovements(req.params["id"] as string));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  registerMovement = async (req: Request, res: Response): Promise<void> => {
    try {
      const dto = plainToInstance(RegisterCashMovementDto, req.body);
      const errors = await validate(dto);
      if (errors.length > 0) {
        res.status(400).json({ error: validationErrors(errors) });
        return;
      }
      const movement = await this.service.registerMovement({
        cashSessionId: req.params["id"] as string,
        type: dto.type,
        method: dto.method,
        amount: dto.amount,
        note: dto.note,
        createdByEmployeeId: dto.createdByEmployeeId,
      });
      res.status(201).json(movement);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  getSummary = async (req: Request, res: Response): Promise<void> => {
    try {
      res.status(200).json(await this.service.getSummary(req.params["id"] as string));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}
