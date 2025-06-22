import inngest from "../client";
import sendMail from "../../utils/mailer.utils";
import { NonRetriableError } from "inngest";
import logger from "@/utils/logger.utils";
import Ticket, { ITicket } from "@/models/ticket.model";
import analyzeTicket from "@/utils/ai.utils";
import User, { IUser } from "@/models/user.model";
import { AIResponseForTicket, onTicketCreatedResponse } from "@/types";

// Define the event data type for better type safety
interface TicketCreatedEvent {
  data: {
    ticketId: string;
  };
}

const onTicketCreated = inngest.createFunction(
  { id: "on-ticket-created", retries: 2 },
  { event: "ticket/created" },
  async ({
    event,
    step,
  }: {
    event: TicketCreatedEvent;
    step: any;
  }): Promise<onTicketCreatedResponse> => {
    const { ticketId } = event.data;

    try {
      //* Step 1: Fetch ticket
      const ticket = await step.run(
        "find-ticket",
        async (): Promise<ITicket> => {
          const ticket = await Ticket.findById(ticketId);
          if (!ticket) {
            logger.error(`Ticket not found with ID: ${ticketId}`);
            throw new NonRetriableError("Ticket not found");
          }
          return ticket as ITicket;
        }
      );

      //* Step 2: Update ticket status to "generating"
      await step.run("update-ticket-status", async (): Promise<void> => {
        await Ticket.findByIdAndUpdate(ticketId, { status: "generating" });
      });

      //* Step 3: Analyze ticket with AI
      // const aiResponse = {
      //   summary: "Summary of the ticket",
      //   priority: "medium",
      //   helpfulNotes: "Helpful notes for the ticket",
      //   relatedSkills: ["React", "Node.js"],
      // };
      const aiResponse = await analyzeTicket(ticket);

      if (!aiResponse) {
        logger.error(`AI analysis failed for ticket ID: ${ticketId}`);
        throw new NonRetriableError("AI analysis failed");
      }

      // Step 4: Update ticket with AI response and extract skills
      const relatedSkills = await step.run(
        "ticket-generation",
        async (): Promise<string[]> => {
          const validPriority = ["low", "medium", "high"].includes(
            aiResponse.priority
          )
            ? aiResponse.priority
            : "medium";
          await Ticket.findByIdAndUpdate(
            ticketId,
            {
              $set: {
                priority: validPriority,
                status: "generating",
                helpfulNotes: aiResponse.helpfulNotes,
                relatedSkills: aiResponse.relatedSkills,
              },
            },
            { new: true }
          );
          return aiResponse.relatedSkills;
        }
      );

      // Step 5: Find a moderator or admin
      const moderator = await step.run(
        "get-moderator",
        async (): Promise<IUser> => {
          let user = await User.findOne({
            role: "moderator",
            skills: {
              $elemMatch: {
                $regex: relatedSkills.join("|"),
                $options: "i",
              },
            },
          });

          if (!user) {
            logger.info(
              `No moderator found with skills: ${relatedSkills.join(
                ", "
              )}. Assigning to admin.`
            );
            user = await User.findOne({ role: "admin" });
          }

          if (!user) {
            logger.error("No moderator or admin found to assign the ticket");
            throw new NonRetriableError("No moderator or admin found");
          }

          // Update ticket with assigned user
          await Ticket.findByIdAndUpdate(ticketId, { assignedTo: user._id });
          return user as IUser;
        }
      );

      // Step 6: Send notification email
      await step.run("send-ticket-notification", async (): Promise<void> => {
        const finalTicket = await Ticket.findById(ticketId);
        if (!finalTicket) {
          logger.error(`Final ticket not found for ID: ${ticketId}`);
          throw new NonRetriableError("Final ticket not found");
        }

        const subject = `Ticket Assignment: "${finalTicket.title}"`;
        let text = `Hi ${moderator.name},\n\nA new ticket named "${finalTicket.title}" has been assigned to you.\n\nPlease review and take appropriate action.\n\nBest,\ntotto Team`;

        if (moderator.role === "admin") {
          text = `Hi ${moderator.name},\n\nA new ticket named "${finalTicket.title}" has been assigned to you as an admin.\n\nPlease review and take appropriate action.\n\nYou can reassign this ticket to a moderator if needed.\n\nBest,\ntotto Team`;
          logger.info(
            `Ticket ID: ${ticketId} assigned to admin ${moderator.name}`
          );
        }

        await sendMail(moderator.email, subject, text);
      });

      logger.info(
        `Ticket ID: ${ticketId} assigned to ${moderator.role} named ${moderator.name}`
      );
      await step.run("update-ticket-status", async (): Promise<void> => {
        await Ticket.findByIdAndUpdate(ticketId, { status: "open" });
      });
      return {
        ticketId,
        moderatorId: moderator._id,
        success: true,
      };
    } catch (error) {
      if (error instanceof NonRetriableError) {
        logger.error(`Non-retriable error occurred: ${error.message}`);
        throw error;
      }

      logger.error(
        `Error processing ticket creation: ${(error as Error).message}`
      );
      throw new NonRetriableError("Failed to process ticket creation");
    }
  }
);

export default onTicketCreated;
