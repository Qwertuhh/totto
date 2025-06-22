import { createAgent, gemini } from "@inngest/agent-kit";
import { ITicket } from "@/models/ticket.model";
import logger from "@/utils/logger.utils";
import { AIResponseForTicket } from "@/types";

const systemPrompt = `You are an expert AI assistant that processes technical support tickets. 

Your job is to:
1. Summarize the issue.
2. Estimate its priority.
3. Provide helpful notes and resource links for human moderators.
4. List relevant technical skills required.

IMPORTANT:
- Respond with *only* valid raw JSON.
- Do NOT include markdown, code fences, comments, or any extra formatting.
- The format must be a raw JSON object.

Repeat: Do not wrap your output in markdown or code fences.`;

const analyzeTicketPrompt = (title: string, description: string) => {
  return `You are a ticket triage agent. Only return a strict JSON object with no extra text, headers, or markdown.
        
    Analyze the following support ticket and provide a JSON object with:
    
    - summary: A short 1-2 sentence summary of the issue.
    - priority: One of "low", "medium", or "high".
    - helpfulNotes: A detailed technical explanation that a moderator can use to solve this issue. Include useful external links or resources if possible.
    - relatedSkills: An array of relevant skills required to solve the issue (e.g., ["React", "MongoDB"]).
    
    Respond ONLY in this JSON format and do not include any other text or markdown in the answer:
    
    {
    "summary": "Short summary of the ticket",
    "priority": "high",
    "helpfulNotes": "Here are useful tips...",
    "relatedSkills": ["React", "Node.js"]
    }
    
    ---
    Ticket information:

    - Title: ${title}
    - Description: ${description}
    `;
};
const analyzeTicket = async (ticket: ITicket): Promise<AIResponseForTicket> => {
  const supportAgent = createAgent({
    model: gemini({
      model: "gemini-1.5-flash-8b",
      apiKey: process.env.GEMINI_API_KEY!,
    }),
    name: "AI Ticket Triage Assistant",
    system: systemPrompt,
  });

  const response = await supportAgent.run(
    analyzeTicketPrompt(ticket.title, ticket.description)
  );
  const raw: string = (response.output[0] as any).content;
  if (!raw) {
    logger.error("AI agent returned no response");
    throw new Error("No response from AI agent");
  }

  try {
    const matched = raw.match(/```json\s*([\s\S]*?)\s*```/gim);
    const jsonString = matched
      ? raw.replace("```json", "").replace("```", "")
      : raw.trim();
    if (!jsonString) {
      logger.error("AI agent returned empty response");
      throw new Error("Empty response from AI agent");
    }
    return JSON.parse(jsonString);
  } catch (error) {
    logger.error("AI agent returned invalid response");
    throw new Error("Invalid response from AI agent" + error);
  }
};

export default analyzeTicket;
