import express from "express";
import {
  createTicket,
  getTickets,
  getTicket,
} from "@/controllers/ticket.controller";
import auth from "@/middlewares/auth";

const router = express.Router();
router.post(
  "/",
  auth as unknown as express.RequestHandler,
  createTicket as unknown as express.RequestHandler
);

router.get(
  "/",
  auth as unknown as express.RequestHandler,
  getTickets as unknown as express.RequestHandler
);
router.get(
  "/:id",
  auth as unknown as express.RequestHandler,
  getTicket as unknown as express.RequestHandler
);

export default router;
