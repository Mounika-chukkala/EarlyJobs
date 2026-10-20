import { Router } from "express";
import multer from "multer";
import { store } from "../store/index.js";
import {
  buildExportWorkbook,
  buildTemplateWorkbook,
  parseCandidatesFromExcel,
} from "../utils/excel.js";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    const ok =
      /\.(xlsx|xls|csv)$/i.test(file.originalname) ||
      [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
        "text/csv",
      ].includes(file.mimetype);
    cb(ok ? null : new Error("Only .xlsx, .xls, or .csv files are allowed"), ok);
  },
});

router.get("/", async (req, res) => {
  try {
    const candidates = await store().listCandidates(req.query);
    res.json(candidates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/export/excel", async (_req, res) => {
  try {
    const candidates = await store().listCandidates();
    const buffer = buildExportWorkbook(candidates);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="earlyjobs-candidates.xlsx"'
    );
    res.send(Buffer.from(buffer));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/import/template", (_req, res) => {
  try {
    const buffer = buildTemplateWorkbook();
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="earlyjobs-candidates-template.xlsx"'
    );
    res.send(Buffer.from(buffer));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/import/excel", upload.single("file"), async (req, res) => {
  try {
    if (!req.file?.buffer) {
      return res.status(400).json({ message: "Please upload an Excel file" });
    }

    const { candidates, errors } = parseCandidatesFromExcel(req.file.buffer);
    if (!candidates.length && errors.length) {
      return res.status(400).json({
        message: "No valid rows found",
        errors,
        imported: 0,
        skipped: 0,
      });
    }

    const { created, skipped } = await store().bulkCreateCandidates(candidates);

    res.status(201).json({
      message: `Imported ${created.length} candidate(s)`,
      imported: created.length,
      skipped: skipped.length,
      skippedDetails: skipped,
      rowErrors: errors,
      candidates: created,
    });
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const candidate = await store().getCandidate(req.params.id);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }
    res.json(candidate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const candidate = await store().createCandidate(req.body);
    res.status(201).json(candidate);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const candidate = await store().updateCandidate(req.params.id, req.body);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }
    res.json(candidate);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
});

router.patch("/:id/stage", async (req, res) => {
  try {
    const candidate = await store().updateStage(req.params.id, req.body.stage);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }
    res.json(candidate);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
});

router.post("/:id/notes", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) {
      return res.status(400).json({ message: "Note text is required" });
    }
    const candidate = await store().addNote(req.params.id, text);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }
    res.status(201).json(candidate);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deleted = await store().deleteCandidate(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Candidate not found" });
    }
    res.json({ message: "Candidate deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
