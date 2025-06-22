import { Request } from 'express';

interface Token {
  id: string;
  role: string;
}
interface AIResponseForTicket {
  summary: string;
  priority: string;
  helpfulNotes: string;
  relatedSkills: string[];
}
interface onTicketCreatedResponse {
  ticketId: string;
  moderatorId: string;
  success: boolean;
}
interface authenticatedRequest extends Request {
  auth: Token;
}

export { Token, AIResponseForTicket, onTicketCreatedResponse, authenticatedRequest };
