import { Request, Response } from "express";
import { RepairNoteService } from "../services/repair-note.service.js";
import { LocalService } from "../../local/services/local.service.js";
import { AuthService } from "../../auth/services/auth.service.js";
import { PdfRendererService } from "../../pdf/pdf-renderer.service.js";
import { RepairNoteDocument } from "../../pdf/documents/repair-note.document.js";
import { toRepairNotePdfData } from "../../pdf/documents/repair-note.pdf-data.js";

export class RepairNoteController {
  constructor(
    private repairNoteService: RepairNoteService,
    private localService: LocalService,
    private pdfRendererService: PdfRendererService,
    private authService: AuthService,
  ) {}

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
      const { items, serviceTypeIds, ...data } = req.body;
      const note = await this.repairNoteService.create(data, items, serviceTypeIds);
      res.status(201).json(note);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params["id"] as string;
      const { items, serviceTypeIds, ...data } = req.body;
      const note = await this.repairNoteService.update(id, data, items, serviceTypeIds);
      if (!note) {
        res.status(404).json({ error: "Nota no encontrada" });
        return;
      }
      res.status(200).json(note);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  cancel = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params["id"] as string;
      const note = await this.repairNoteService.cancel(id);
      res.status(200).json(note);
    } catch (error: any) {
      res.status(error.message === "Nota no encontrada" ? 404 : 400).json({ error: error.message });
    }
  };

  getItems = async (req: Request, res: Response): Promise<void> => {
    try {
      res.status(200).json(await this.repairNoteService.getItems(req.params["id"] as string));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getServiceTypes = async (req: Request, res: Response): Promise<void> => {
    try {
      res.status(200).json(await this.repairNoteService.getServiceTypeIds(req.params["id"] as string));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getPdf = async (req: Request, res: Response): Promise<void> => {
    try {
      const note = await this.repairNoteService.getById(req.params["id"] as string);
      if (!note) {
        res.status(404).json({ error: "Nota no encontrada" });
        return;
      }
      const local = await this.localService.getConfig();
      const assignedEmployeeName = note.assignedEmployeeId
        ? await this.authService.getEmployeeName(note.assignedEmployeeId)
        : null;
      const serviceTypeNames = await this.repairNoteService.getServiceTypeNames(note.id);
      const data = toRepairNotePdfData(note, local, assignedEmployeeName, serviceTypeNames);
      const buffer = await this.pdfRendererService.render(RepairNoteDocument, { data });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="nota-${note.controlNumber}.pdf"`);
      res.status(200).send(buffer);
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
