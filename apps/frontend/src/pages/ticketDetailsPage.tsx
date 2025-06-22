import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { type ITicket } from "@shared/types";
import { toast } from "react-toastify";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, FileText, User, Tag } from "lucide-react";


function TicketDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [ticket, setTicket] = useState<ITicket | null>(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchTicket = async () => {
      if (!id || !token) {
        toast.error("Invalid ticket ID or not authenticated");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `${import.meta.env.VITE_SERVER_URL}/tickets/${id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();
        if (res.ok) {
          setTicket(data.ticket);
        } else {
          toast.error(data.message || "Failed to fetch ticket");
        }
      } catch (err) {
        console.error("Error fetching ticket:", err);
        toast.error("Something went wrong while fetching the ticket");
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [id, token]);

  if (loading) {
    return (
      <div className="text-center mt-10 text-gray-500">
        Loading ticket details...
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center mt-10 text-red-500">Ticket not found</div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Ticket Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold">
              {ticket.title}
            </h3>
            <p className="text-secondary-foreground mt-2">{ticket.description}</p>
          </div>

          {ticket.status && (
            <>
              <Separator className="my-4" />
              <div className="space-y-4">
                <h4 className="text-lg font-medium flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Metadata
                </h4>
                <div className="grid gap-3">
                  <p className="flex items-center gap-2">
                    <span className="text-gray-600 font-medium">Status:</span>
                    <Badge
                      variant={
                        ticket.status === "open"
                          ? "default"
                          : ticket.status === "closed"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {ticket.status}
                    </Badge>
                  </p>
                  {ticket.priority && (
                    <p className="flex items-center gap-2">
                      <span className="text-gray-600 font-medium">
                        Priority:
                      </span>
                      <Badge
                        variant={
                          ticket.priority === "high"
                            ? "destructive"
                            : ticket.priority === "medium"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {ticket.priority}
                      </Badge>
                    </p>
                  )}
                  {ticket.relatedSkills?.length > 0 && (
                    <p className="flex items-center gap-2">
                      <span className="text-gray-600 font-medium">
                        Related Skills
                      </span>
                      <span>{ticket.relatedSkills.join(", ")}</span>
                    </p>
                  )}
                  {ticket.helpfulNotes && (
                    <div>
                      <p className="text-gray-600 font-medium mb-2">
                        Helpful Notes
                      </p>
                      <div className="prose max-w-none bg-gray-50 p-4 rounded-md dark:bg-zinc-800">
                        <ReactMarkdown>{ticket.helpfulNotes}</ReactMarkdown>
                      </div>
                    </div>
                  )}
                  {ticket.assignedTo && (
                    <p className="flex items-center gap-2">
                      <span className="text-gray-600 font-medium">
                        Assigned To:
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {(ticket.assignedTo as unknown as { email: string })?.email || "N/A"}
                      </span>
                    </p>
                  )}
                  {ticket.createdAt && (
                    <p className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      Created At: {new Date(ticket.createdAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default TicketDetailsPage;
