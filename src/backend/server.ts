import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import apiRouter from "./routes/api";
import knowledgeEngineRouter from "./routes/knowledgeEngine";
import leadHunterSearchRouter from "./routes/leadHunterSearch";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 4100);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDist = path.resolve(__dirname, "../../dist/frontend");

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use("/api", apiRouter);
app.use("/api/knowledge-engine", knowledgeEngineRouter);
app.use("/api/lead-hunter/search", leadHunterSearchRouter);

app.get("/health", (_req, res) => res.json({ ok: true, service: "Luxury Mobility AI OS" }));

if (existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get(/^\/(?!api|health).*/, (_req, res) => {
    res.sendFile(path.join(frontendDist, "index.html"));
  });
}

app.listen(port, () => {
  console.log(`Luxury Mobility AI OS running on http://localhost:${port}`);
});
