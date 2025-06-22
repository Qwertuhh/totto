import { useEffect, useState, useCallback } from "react";
import { type IUser } from "@shared/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, Save, X } from "lucide-react";

interface FormData {
  name: string;
  email: string;
  role: string;
  password: string;
  skills: string;
}

function AdminPanel() {
  const [users, setUsers] = useState<IUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<IUser[]>([]);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    role: "",
    password: "",
    skills: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.group("AdminPanel state");
    console.log("users:", users);
    console.log("filteredUsers:", filteredUsers);
    console.log("editingUser:", editingUser);
    console.log("formData:", formData);
    console.log("searchQuery:", searchQuery);
    console.log("loading:", loading);
    console.log("error:", error);
    console.groupEnd();
  }, [
    users,
    filteredUsers,
    editingUser,
    formData,
    searchQuery,
    loading,
    error,
  ]);

  const token = localStorage.getItem("token");

  const fetchUsers = useCallback(async () => {
    if (!token) {
      setError("No authentication token found. Please log in.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      console.log("API Response:", data);

      if (res.ok) {
        const userData = Array.isArray(data.users) ? data.users : [];
        setUsers(userData);
        setFilteredUsers(userData);
      } else {
        setError(data.error || "Failed to fetch users");
      }
    } catch (err) {
      setError("Error fetching users. Please try again.");
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleEditClick = (user: IUser) => {
    setEditingUser(user.email);
    setFormData({
      name: user.name || "",
      email: user.email || "",
      role: user.role || "user",
      password: "", // Password is not pre-filled for security
      skills: user.skills?.join(", ") || "",
    });
    setError(null);
  };

  const handleUpdate = async () => {
    if (!editingUser || !token) {
      setError("No user selected or not authenticated.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/user`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: editingUser, // Original email to identify the user
          name: formData.name,
          role: formData.role,
          password: formData.password || undefined, // Only send password if provided
          skills: formData.skills
            .split(",")
            .map((skill) => skill.trim())
            .filter(Boolean),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update user");
        return;
      }

      setEditingUser(null);
      setFormData({ name: "", email: "", role: "", password: "", skills: "" });
      fetchUsers();
    } catch (err) {
      setError("Update failed. Please try again.");
      console.error("Update failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    setFilteredUsers(
      users.filter(
        (user) => user?.email?.toLowerCase().includes(query) || false
      )
    );
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <User className="h-6 w-6" />
            Admin Panel - Manage Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            type="text"
            placeholder="Search by email"
            value={searchQuery}
            onChange={handleSearch}
            className="mb-6"
            disabled={loading}
          />
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {loading && (
            <div className="text-center text-gray-500">Loading users...</div>
          )}
          {!loading && (!filteredUsers || filteredUsers.length === 0) && (
            <div className="text-center text-gray-500">No users found.</div>
          )}
          {!loading && filteredUsers && (
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <Card
                  key={user._id}
                  className="border-none shadow-sm hover:shadow-md transition-shadow"
                >
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <p className="font-semibold">
                        <span className="text-gray-600">Name:</span>{" "}
                        {user.name || "N/A"}
                      </p>
                      <p className="font-semibold">
                        <span className="text-gray-600">Email:</span>{" "}
                        {user.email || "N/A"}
                      </p>
                      <p>
                        <span className="text-gray-600">Role:</span>{" "}
                        {user.role || "N/A"}
                      </p>
                      <p>
                        <span className="text-gray-600">Skills:</span>{" "}
                        {user.skills && user.skills.length > 0
                          ? user.skills.join(", ")
                          : "N/A"}
                      </p>
                      {editingUser === user.email ? (
                        <div className="mt-4 space-y-4">
                          <Input
                            type="text"
                            placeholder="Name"
                            value={formData.name}
                            onChange={(e) =>
                              setFormData({ ...formData, name: e.target.value })
                            }
                          />
                          {/* <Input
                            type="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                email: e.target.value,
                              })
                            }
                          /> */}
                          <Select
                            value={formData.role}
                            onValueChange={(value) =>
                              setFormData({ ...formData, role: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="moderator">
                                Moderator
                              </SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            type="password"
                            placeholder="New password (optional)"
                            value={formData.password}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                password: e.target.value,
                              })
                            }
                          />
                          <Input
                            type="text"
                            placeholder="Comma-separated skills (e.g., JavaScript, Python)"
                            value={formData.skills}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                skills: e.target.value,
                              })
                            }
                          />
                          <div className="flex gap-2">
                            <Button
                              onClick={handleUpdate}
                              disabled={loading}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <Save className="h-4 w-4" />
                              Save
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setEditingUser(null)}
                              disabled={loading}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <X className="h-4 w-4" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          onClick={() => handleEditClick(user)}
                          variant="outline"
                          size="sm"
                          className="mt-2 cursor-pointer"
                          disabled={loading}
                        >
                          Edit
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default AdminPanel;
