import { inngest } from "@/inngest/client";
import logger from "@/utils/logger.utils";
import Ticket from "@/models/ticket.model";
import { Token } from "@/types";
import { Response } from "express";
import { onTicketCreatedResponse, authenticatedRequest } from "@/types";
import { Types } from "mongoose";

/**
 * Creates a new ticket with the provided title and description.
 *
 * Validates that the title and description are provided in the request body.
 * If validation fails, responds with a 400 status and an error message.
 *
 * If the ticket is created successfully, sends an event notification
 * and responds with the created ticket details and a 201 status.
 *
 * Logs errors and responds with a 500 status if any errors occur during ticket creation.
 *
 * @param {authenticatedRequest} req - The request object containing ticket details.
 * @param {Response} res - The response object used to send the results or errors.
 *
 * @returns {Promise<void>} Responds with the created ticket or an appropriate error message.
 */

/**
 * Creates a new ticket with the provided title and description.
 *
 * Validates that the title and description are provided in the request body.
 * If validation fails, responds with a 400 status and an error message.
 *
 * If the ticket is created successfully, sends an event notification
 * and responds with the created ticket details and a 201 status.
 *
 * Logs errors and responds with a 500 status if any errors occur during ticket creation.
 *
 * @param {authenticatedRequest} req - The request object containing ticket details.
 * @param {Response} res - The response object used to send the results or errors.
 *
 * @returns {Promise<void>} Responds with the created ticket or an appropriate error message.
 */
const createTicket = async (req: authenticatedRequest, res: Response) => {
  const { title, description } = req.body;
  if (!title || !description) {
    logger.error("Title and description are required to create a ticket");
    return res
      .status(400)
      .json({ message: "Title and description are required" });
  }
  try {
    const newTicket = await Ticket.create({
      title,
      description,
      createdBy: req.auth.id,
    });

    const inngestResponse = await inngest.send({
      name: "ticket/created",
      data: {
        ticketId: newTicket._id,
      },
    });
    console.log("Inngest response:", inngestResponse);
    const finalTicket = await Ticket.findOne({
      _id: newTicket._id,
    });
    logger.info("Ticket created successfully with ID: " + newTicket._id);
    return res.status(201).json({
      message: "Ticket created successfully",
      ticket: finalTicket,
    });
  } catch (error) {
    if (error instanceof Error) {
      logger.error("Error creating ticket:", error);
    }
    res.status(500).json({ message: "Error creating ticket" });
  }
};

/**
 * Retrieves tickets based on the authenticated user's role.
 *
 * - If the user is a regular user, fetches tickets created by the user.
 * - If the user is an admin or other roles, fetches all tickets.
 *
 * Populates the `assignedTo` and `createdBy` fields with user details.
 *
 * @param {authenticatedRequest} req - The request object containing authentication information.
 * @param {Response} res - The response object used to send the results or errors.
 *
 * @returns {Promise<void>} Responds with the list of tickets or an appropriate error message.
 */
const getTickets = async (req: authenticatedRequest, res: Response) => {
  try {
    const auth = req.auth;
    if (auth.role === "user") {
      const tickets = await Ticket.find({ createdBy: auth.id })
        .populate("assignedTo", ["name", "email"])
        .select("title description status createdAt")
        .sort({ createdAt: -1 })
        .exec();
      if (!tickets || tickets.length === 0) {
        logger.info("No tickets found for user");
        return res.status(404).json({ message: "No tickets found" });
      }
      logger.info("Tickets fetched successfully for user");
      return res
        .status(200)
        .json({ tickets, message: "Tickets fetched successfully" });
    }

    const tickets = await Ticket.find({})
      .populate("assignedTo", ["_id", "name", "email", "role"])
      .populate("createdBy", ["_id", "name", "email", "role"])
      .sort({ createdAt: -1 });

    if (!tickets || tickets.length === 0) {
      logger.info("No tickets found");
      return res.status(404).json({ message: "No tickets found" });
    }
    logger.info("Tickets fetched successfully");
    res.status(200).json({ tickets, message: "Tickets fetched successfully" });
  } catch (error) {
    if (error instanceof Error) {
      logger.error("Error fetching tickets:", error.message);
    }
    res.status(500).json({ message: "Error fetching tickets" });
  }
};

/**
 * Retrieves a single ticket based on the ticket ID in the request params.
 *
 * If the request is made by a regular user, the ticket must be created by the user.
 * If the request is made by an admin or other roles, the ticket can be created by anyone.
 *
 * @param {authenticatedRequest} req - The request object containing authentication information.
 * @param {Response} res - The response object used to send the results or errors.
 *
 * @returns {Promise<void>} Responds with the ticket or an appropriate error message.
 */
const getTicket = async (req: authenticatedRequest, res: Response) => {
  try {
    const ticketId = req.params.id;
    const auth = req.auth as Token;

    if (!ticketId) {
      logger.error("Ticket ID is required to fetch a ticket");
      return res.status(400).json({ message: "Ticket ID is required" });
    }
    //? User Can access only his/her own tickets
    if (auth.role === "user") {
      const ticket = await Ticket.findOne({
        _id: new Types.ObjectId(ticketId),
        createdBy: new Types.ObjectId(auth.id),
      })
        .populate("assignedTo")
        .populate("createdBy", ["_id", "skills", "createdAt", "updatedAt"])
        .select("-__v -_id");
      if (!ticket) {
        logger.error(`Ticket not found for user: ${auth.id}`);
        return res.status(404).json({ message: "Ticket not found" });
      }
      logger.info("Ticket fetched successfully for user");
      return res
        .status(200)
        .json({ ticket, message: "Ticket fetched successfully" });
    }
    //? Admin or other roles can access all tickets
    const ticket = await Ticket.findOne({
      _id: new Types.ObjectId(ticketId),
    }).populate("assignedTo", ["_id", "email"]);
    if (!ticket) {
      logger.error(`Ticket not found with ID: ${ticketId}`);
      return res.status(404).json({ message: "Ticket not found" });
    }
    logger.info("Ticket fetched successfully");
    res.status(200).json({ ticket, message: "Ticket fetched successfully" });
  } catch (error) {
    if (error instanceof Error) {
      logger.error("Error fetching ticket:", error);
    }
    res.status(500).json({ message: "Error fetching ticket" });
  }
};

export { createTicket, getTickets, getTicket };
