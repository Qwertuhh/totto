import mongoose, { Schema } from "mongoose";
import { ITicket } from "@shared/types";

const ticketSchema = new Schema<ITicket>(
  {
    title: {
      type: String,
      required: [true, "Please select a product"],
    },
    description: {
      type: String,
      required: [true, "Please enter a description of the issue"],
    },
    status: {
      type: String,
      required: true,
      enum: ["initialize", "generating", "in-progress", "closed"],
      default: "initialize",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Please select a product"],
      ref: "User",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    priority: {
      type: String,
      required: true,
      enum: ["low", "medium", "high"],
      default: "low",
    },
    deadline: {
      type: Date,
      default: null,
    },
    helpfulNotes: {
      type: String,
      default: "",
    },
    relatedSkills: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ITicket>("Ticket", ticketSchema);
export { ITicket };
