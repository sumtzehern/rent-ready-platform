import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useListing } from "@/contexts/ListingContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, User, AlertTriangle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

interface StoredUser {
  id: string;
  name: string;
  email: string;
  mode: string; // Changed from role to mode
  username: string;
  password: string;
}

const AdminDashboard = () => {
  const { user: currentUser } = useAuth();
  const { listings } = useListing();
  const navigate = useNavigate();
  const [users, setUsers] = useState<StoredUser[]>([]);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    mode: "host",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const isAdmin =
      currentUser?.mode === "admin" || currentUser?.username === "admin";
    if (!isAdmin) {
      toast({
        title: "Access denied",
        description: "You must be an admin to view this page.",
        variant: "destructive",
      });
      navigate("/dashboard");
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data, error } = await supabase.from("user").select("*");
    if (error) {
      toast({
        title: "Error fetching users",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setUsers(data || []);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleModeChange = (mode: string) => { // Changed from handleRoleChange
    setNewUser((prev) => ({ ...prev, mode }));
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newUser.password.length < 6) {
      return toast({
        title: "Invalid password",
        description: "Minimum 6 characters.",
        variant: "destructive",
      });
    }
    setIsLoading(true);
    try {
      const { data: existingUsers, error: checkError } = await supabase
        .from("user")
        .select("email")
        .eq("email", newUser.email);
      if (existingUsers?.length) throw new Error("Email already exists");

      const { error } = await supabase.from("user").insert([
        {
          ...newUser,
          id: `user-${Date.now()}`,
          username: newUser.email.split("@")[0],
        },
      ]);

      if (error) throw error;

      setNewUser({ name: "", email: "", password: "", mode: "host" }); // Changed from role to mode
      toast({
        title: "User created",
        description: `New ${newUser.mode} added.`, // Changed from role to mode
      });
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (userId === currentUser?.id)
      return toast({
        title: "Error",
        description: "Can't delete self.",
        variant: "destructive",
      });

    const { error } = await supabase.from("user").delete().eq("id", userId);
    if (error) {
      toast({
        title: "Error deleting user",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "User deleted" });
      fetchUsers();
    }
  };

  const toggleUserMode = async (userId: string, mode: string) => { // Changed from toggleUserRole
    // Special exception for admin username
    if (userId === currentUser?.id && currentUser.username !== "admin")
      return toast({
        title: "Cannot change own mode", // Changed from role to mode
        variant: "destructive",
      });
  
    const { error } = await supabase
      .from("user")
      .update({ mode }) // Changed from role to mode
      .eq("id", userId);
    if (error) {
      toast({
        title: "Error updating mode", // Changed from role to mode
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Mode updated" }); // Changed from role to mode
      fetchUsers();
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.mode?.toLowerCase().includes(searchTerm.toLowerCase()) // Changed from role to mode
  );

  const adminCount = users.filter(u => u.mode === 'admin' || u.username === 'admin').length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Listings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{listings.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Admin Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminCount}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="create">Create Admin</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="pt-4">
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="border rounded-md mt-4">
            {filteredUsers.map((user) => (
              <div key={user.id} className="grid grid-cols-4 p-4 border-t">
                <div>{user.username}</div>
                <div>{user.email}</div>
                <div>
                  {user.username === "admin" ? (
                    <span className="font-semibold">Admin</span>
                  ) : (
                    <Select
                      value={user.mode} // Changed from role to mode
                      onValueChange={(v) => toggleUserMode(user.id, v)} // Changed from toggleUserRole
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="host">Host</SelectItem>
                        <SelectItem value="guest">Guest</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <div className="text-right">
                  {user.username !== "admin" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      <AlertTriangle className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="create" className="pt-4">
          <form onSubmit={handleCreateAdmin} className="space-y-4">
            <Input
              placeholder="Name"
              name="name"
              value={newUser.name}
              onChange={handleChange}
              required
            />
            <Input
              placeholder="Email"
              name="email"
              value={newUser.email}
              onChange={handleChange}
              required
              type="email"
            />
            <Input
              placeholder="Password"
              name="password"
              value={newUser.password}
              onChange={handleChange}
              required
              type="password"
            />
            <Select value={newUser.mode} onValueChange={handleModeChange}> {/* Changed from role to mode and handleRoleChange to handleModeChange */}
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="host">Host</SelectItem>
                <SelectItem value="guest">Guest</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="animate-spin h-4 w-4" />
              ) : (
                "Create User"
              )}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;