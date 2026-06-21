import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import apiRouter from "./routes/api";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 4100);

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use("/api", apiRouter);

app.get("/health", (_req, res) => res.json({ ok: true, service: "Yacht AI Broker Engine" }));

app.listen(port, () => {
  console.log(`Yacht AI Broker Engine API running on http://localhost:${port}`);
});
