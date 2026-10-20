import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./config/db.js";
import candidateRoutes from "./routes/candidates.js";
import jobRoutes from "./routes/jobs.js";
import dashboardRoutes from "./routes/dashboard.js";
import { STAGES } from "./constants/stages.js";
import { seedDatabase } from "./seedData.js";


dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN?.split(",") || "*",
  })
);
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "EarlyJobs Mini ATS" });
});

app.get("/api/stages", (_req, res) => {
  res.json(STAGES);
});

app.use("/api/candidates", candidateRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/dashboard", dashboardRoutes);

const clientDist = path.join(__dirname, "../../client/dist");
app.use(express.static(clientDist));
app.get(/^(?!\/api).*/, (req, res, next) => {
  res.sendFile(path.join(clientDist, "index.html"), (err) => {
    if (err) next();
  });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

async function start() {
  const uri = process.env.MONGODB_URI || "memory";
  await connectDB(uri);

  // memory: always reload sample data
  // Atlas/local Mongo: seed only when the database is empty (unless AUTO_SEED=false)
  if (uri === "memory") {
    const result = await seedDatabase({ clear: true });
    console.log(`Sample data ready: ${result.jobs} jobs, ${result.candidates} candidates`);
  } else if (process.env.AUTO_SEED !== "false") {
    const result = await seedDatabase({ clear: false });
    console.log(`Database ready: ${result.jobs} jobs, ${result.candidates} candidates`);
  }

  app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`);
  });
}

start().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
