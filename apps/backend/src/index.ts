import express from "express";
import cors from "cors";
import logger from "@/utils/logger.utils";
import userRoutes from "@/routes/user.route";
import ticketRoutes from "@/routes/ticket.route";
import {serve} from "inngest/express";
import {  inngest } from "@/inngest/client";
import   onSignup  from "@/inngest/functions/onSignUp";
import onTicketCreated  from "@/inngest/functions/onTicketCreate";
import * as dotenv from 'dotenv';
import { join } from 'path';
import connectToDatabase from "@/utils/db.utils";

// * Environment Variables
dotenv.config({ path: join(__dirname, '../../../env/.env')});
dotenv.config({ path: join(__dirname, '../.env')});

const app = express();
const PORT = process.env.PORT;

// * Middleware
app.use(cors());
app.use(express.json());

//* Routes
app.get("/", (req, res) => {
  res.send("Server is running");
})
app.post("/", (req, res) => {
  res.send(`Hello, ${req.body!.name}!`);
})
app.use("/api/user", userRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/inngest", serve({ client: inngest, functions: [onSignup, onTicketCreated] }));
logger.info("Routes initialized");

// * Database Connection
connectToDatabase(process.env.DATABASE_URI as string);

app.listen(PORT, () => {
  logger.info(`Server started on port http://localhost:${PORT}`);
});
