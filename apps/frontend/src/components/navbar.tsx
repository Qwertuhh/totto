import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User } from "lucide-react";

interface User {
  name: string;
  role: string;
}

function Navbar() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user")!) as User;
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav className="flex items-center justify-between p-4 m-1.5 max-w-7xl backdrop-blur bg-zinc-900/50 dark:bg-zinc-900 top-2 left-2 right-2 rounded-2xl ">
      <Link to="/" className="text-2xl font-semibold ">
        totto
      </Link>
      <div className="flex items-center gap-4 cursor-pointer">
        {!token ? (
          <>
            <Link to="/signup">
              <Button variant="outline" size="sm">
                Signup
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="default" size="sm">
                Login
              </Button>
            </Link>
          </>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" className="flex items-center gap-2 cursor-pointer">
                <User className="h-5 w-5" />
                <span>{user?.name}</span>
              </Button >
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {user?.role === "admin" && (
                <DropdownMenuItem asChild>
                  <Link to="/admin">Admin Dashboard</Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={logout} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
