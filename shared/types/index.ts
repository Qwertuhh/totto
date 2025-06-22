import mongoose, { Document } from "mongoose";
interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: "user" | "admin" | "moderator";
  skills: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

interface ITicket extends Document {
  _id: string;
  title: string;
  description: string;
  status: "initialize" | "generating" | "open" | "closed";
  createdBy: mongoose.Types.ObjectId;
  assignedTo: mongoose.Types.ObjectId | null;
  priority: "low" | "medium" | "high";
  deadline: Date | null;
  helpfulNotes: string;
  relatedSkills: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export type { IUser, ITicket };
