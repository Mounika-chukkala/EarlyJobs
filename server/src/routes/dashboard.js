import { Router } from "express";
import { store } from "../store/index.js";

const router = Router();

router.get("/metrics", async (_req, res) => {
  try {
    res.json(await store().metrics());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
