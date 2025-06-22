import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {Tickets} from "lucide-react";

function App() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <Button onClick={() => navigate("/tickets")} className="cursor-pointer"> <Tickets className="mr-2"/>To Generate Tickets</Button>
    </div>

  );
}

export default App;

