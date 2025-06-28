import express from "express";
import cors from "cors";
import logger from "@/utils/logger.utils";
import userRoutes from "@/routes/user.route";
import ticketRoutes from "@/routes/ticket.route";
import { serve } from "inngest/express";
import { inngest } from "@/inngest/client";
import onSignup from "@/inngest/functions/onSignUp";
import onTicketCreated from "@/inngest/functions/onTicketCreate";
import * as dotenv from "dotenv";
import { join } from "path";
import connectToDatabase from "@/utils/db.utils";
import metrics from "prom-client";
import responseTime from "response-time";
import { Request, Response } from "express";

const collectDefaultMetrics = metrics.collectDefaultMetrics;
const APIRequestTimeHistogram = new metrics.Histogram({
  name: "api_request_duration_ms",
  help: "Duration of API requests in milliseconds",
  labelNames: ["route", "method", "status_code"],
  buckets: [1, 20, 50, 80, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000],
});

const APIRequestCount = new metrics.Counter({
  name: "api_request_count",
  help: "Number of API requests",
});

const ServerRequestGauge = new metrics.Gauge({
  name: "server_request_count",
  help: "Number of server requests",
});
collectDefaultMetrics({
  register: metrics.register,
});

// * Environment Variables
dotenv.config();
dotenv.config({ path: join(__dirname, "../../../env/.env") });
dotenv.config({ path: join(__dirname, "../.env") });
dotenv.config({ path: join(__dirname, "../../../.env") });

const app = express();
const PORT = process.env.PORT;

// * Middleware
app.use(cors());
app.use(express.json());
app.use(
  responseTime((req: Request, res: Response, time) => {
    ServerRequestGauge.inc();
    const originalUrl = req.originalUrl!;
    if (originalUrl !== "/metrics") APIRequestCount.inc();
    APIRequestTimeHistogram.labels({
      method: req.method,
      route: originalUrl || req.url,
      status_code: res.statusCode,
    }).observe(time);
  })
);

// * Metrics Route
app.get("/metrics", async (req, res) => {
  res.setHeader("Content-Type", metrics.register.contentType);
  const metricsData = await metrics.register.metrics();
  res.send(metricsData);
});

// * API Routes
app.get("/", (req, res) => {
  res.send("Server is running");
});
app.post("/", (req, res) => {
  res.send(`Hello, ${req.body!.name}!`);
});

app.use("/api/user", userRoutes);
app.use("/api/tickets", ticketRoutes);

// * Inngest
app.use(
  "/api/inngest",
  serve({ client: inngest, functions: [onSignup, onTicketCreated] })
);
logger.info("Routes initialized");

// * Database Connection
connectToDatabase(process.env.DATABASE_URI as string);

app.listen(PORT, () => {
  logger.info(`Server started on port http://localhost:${PORT}`);
});
