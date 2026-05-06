import { Router } from "express";
import { MessageTemplateDao } from "../message-templates/daos/message-template.dao.js";
import { PriceListDao } from "../price-list/daos/price-list.dao.js";
import { RepairNoteDao } from "../repair-notes/daos/repair-note.dao.js";

/**
 * Endpoints sin autenticación para consumo interno desde n8n.
 * Solo accesibles dentro de la red Docker.
 */
export const createN8nPublicRouter = (
  messageTemplateDao: MessageTemplateDao,
  priceListDao: PriceListDao,
  repairNoteDao: RepairNoteDao,
): Router => {
  const router = Router();

  // GET /api/v1/n8n/message-templates/:key
  router.get("/message-templates/:key", async (req, res) => {
    try {
      const template = await messageTemplateDao.findByKey(req.params.key);
      if (!template) {
        res.status(404).json({ error: "Template no encontrado", key: req.params.key });
        return;
      }
      res.status(200).json({ key: template.key, text: template.text });
    } catch (error) {
      console.error("Error obteniendo template para n8n:", error);
      res.status(500).json({ error: "Error interno" });
    }
  });

  // GET /api/v1/n8n/products/search?model=Samsung+A15&supplier=tecnomax
  router.get("/products/search", async (req, res) => {
    try {
      const model = (req.query.model as string | undefined)?.trim();
      const supplier = (req.query.supplier as string | undefined)?.toLowerCase().trim();

      if (!model) {
        res.status(400).json({ error: "El parámetro 'model' es requerido" });
        return;
      }

      let items = await priceListDao.searchByModel(model);

      if (supplier) {
        items = items.filter((item) =>
          item.supplier.name.toLowerCase().includes(supplier),
        );
      }

      res.status(200).json(
        items.map((i) => ({
          brand: i.brand,
          model: i.model,
          price: Number(i.price),
          supplier: i.supplier.name,
        })),
      );
    } catch (error) {
      console.error("Error buscando productos para n8n:", error);
      res.status(500).json({ error: "Error interno" });
    }
  });

  // GET /api/v1/n8n/repair-notes/:controlNumber
  router.get("/repair-notes/:controlNumber", async (req, res) => {
    try {
      const controlNumber = parseInt(req.params.controlNumber, 10);
      if (isNaN(controlNumber)) {
        res.status(400).json({ error: "Número de nota inválido", exists: false });
        return;
      }

      const note = await repairNoteDao.findByControlNumber(controlNumber);

      if (!note) {
        res.status(200).json({ exists: false });
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let isInWarrantyRange = false;
      if (note.hasWarranty && note.deliveryDate) {
        const delivery = new Date(note.deliveryDate);
        if (note.hasExtendedWarranty && note.extendedWarrantyDays) {
          const expiresAt = new Date(delivery);
          expiresAt.setDate(expiresAt.getDate() + note.extendedWarrantyDays);
          isInWarrantyRange = today <= expiresAt;
        } else {
          const thirtyDaysAfter = new Date(delivery);
          thirtyDaysAfter.setDate(thirtyDaysAfter.getDate() + 30);
          isInWarrantyRange = today <= thirtyDaysAfter;
        }
      }

      res.status(200).json({
        exists: true,
        hasWarranty: note.hasWarranty,
        hasExtendedWarranty: note.hasExtendedWarranty,
        extendedWarrantyDays: note.extendedWarrantyDays ?? null,
        deliveryDate: note.deliveryDate ?? null,
        isInWarrantyRange,
        customerName: note.customerName,
        brand: note.brand,
        model: note.model,
      });
    } catch (error) {
      console.error("Error consultando nota para n8n:", error);
      res.status(500).json({ error: "Error interno" });
    }
  });

  return router;
};
