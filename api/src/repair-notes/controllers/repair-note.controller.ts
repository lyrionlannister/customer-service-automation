import { Request, Response } from "express";
import { RepairNoteService } from "../services/repair-note.service.js";

export class RepairNoteController {
  constructor(private repairNoteService: RepairNoteService) {}

  getAll = async (_req: Request, res: Response): Promise<void> => {
    try {
      const notes = await this.repairNoteService.getAll();
      res.status(200).json(notes);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params["id"] as string;
      const note = await this.repairNoteService.getById(id);
      if (!note) {
        res.status(404).json({ error: "Nota no encontrada" });
        return;
      }
      res.status(200).json(note);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const note = await this.repairNoteService.create(req.body);
      res.status(201).json(note);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params["id"] as string;
      const note = await this.repairNoteService.update(id, req.body);
      if (!note) {
        res.status(404).json({ error: "Nota no encontrada" });
        return;
      }
      res.status(200).json(note);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params["id"] as string;
      const deleted = await this.repairNoteService.delete(id);
      if (!deleted) {
        res.status(404).json({ error: "Nota no encontrada" });
        return;
      }
      res.status(200).json({ message: "Nota eliminada" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}
