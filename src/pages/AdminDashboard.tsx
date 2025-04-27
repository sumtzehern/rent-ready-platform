
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useListing } from "@/contexts/ListingContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, User, Home, AlertTriangle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface StoredUser {
  id: string;
  name: string;
  email: string;
  role: string;
  password: string;
}

const AdminDashboard = () => {
  const { user: currentUser, checkIsAdmin } = useAuth();
  const { listings } = useListing();
  const navigate = useNavigate();
  
  const [users, setUsers] = useState<StoredUser[]>([]);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "host"
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Redirect if not admin
  useEffect(() => {
    if (!checkIsAdmin()) {
      toast({
        title: "Access denied",
        description: "You must be an admin to view this page.",
        variant: "destructive"
      });
      navigate("/dashboard");
    }
  }, [checkIsAdmin, navigate]);
  
  // Load users from storage
  useEffect(() => {
    const storedUsers = localStorage.getItem('rental_users');
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    }
  }, []);
  
  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle role selection
  const handleRoleChange = (value: string) => {
    setNewUser(prev => ({ ...prev, role: value }));
  };
  
  // Create new admin user
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newUser.password.length < 6) {
      toast({
        title: "Invalid password",
        description: "Password must be at least 6 characters long.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Check if user already exists
      if (users.some(user => user.email === newUser.email)) {
        throw new Error("A user with this email already exists");
      }
      
      // Create new user
      const newUserData = {
        id: `user-${Date.now()}`,
        ...newUser
      };
      
      const updatedUsers = [...users, newUserData];
      localStorage.setItem('rental_users', JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
      
      // Reset form
      setNewUser({
        name: "",
        email: "",
        password: "",
        role: "host"
      });
      
      toast({
        title: "User created",
        description: `New ${newUser.role} user has been created successfully.`
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Delete user
  const handleDeleteUser = (userId: string) => {
    // Prevent deleting self
    if (userId === currentUser?.id) {
      toast({
        title: "Cannot delete account",
        description: "You cannot delete your own account.",
        variant: "destructive"
      });
      return;
    }
    
    const updatedUsers = users.filter(user => user.id !== userId);
    localStorage.setItem('rental_users', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
    
    toast({
      title: "User deleted",
      description: "User has been removed successfully."
    });
  };
  
  // Toggle user role
  const toggleUserRole = (userId: string, newRole: string) => {
    // Prevent changing own role
    if (userId === currentUser?.id) {
      toast({
        title: "Cannot change role",
        description: "You cannot change your own role.",
        variant: "destructive"
      });
      return;
    }
    
    const updatedUsers = users.map(user => {
      if (user.id === userId) {
        return { ...user, role: newRole };
      }
      return user;
    });
    
    localStorage.setItem('rental_users', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
    
    toast({
      title: "Role updated",
      description: `User role has been updated to ${newRole}.`
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium flex items-center">
          <Shield className="h-3 w-3 mr-1" />
          Admin Access
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Listings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{listings.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Admin Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.role === 'admin').length}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="users">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="create">Create Admin</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="space-y-4 pt-4">
          <div className="flex items-center space-x-2">
            <Input 
              placeholder="Search users..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="max-w-sm"
            />
          </div>
          
          <div className="rounded-md border">
            <div className="grid grid-cols-12 p-4 bg-muted/50 font-medium">
              <div className="col-span-3 lg:col-span-3">Name</div>
              <div className="col-span-4 lg:col-span-4">Email</div>
              <div className="col-span-3 lg:col-span-3">Role</div>
              <div className="col-span-2 lg:col-span-2 text-right">Actions</div>
            </div>
            {filteredUsers.length > 0 ? (
              filteredUsers.map(user => (
                <div 
                  key={user.id}
                  className="grid grid-cols-12 p-4 border-t items-center"
                >
                  <div className="col-span-3 lg:col-span-3 flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-rental-100 flex items-center justify-center text-rental-700">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium truncate">{user.name}</span>
                  </div>
                  <div className="col-span-4 lg:col-span-4 truncate">
                    {user.email}
                  </div>
                  <div className="col-span-3 lg:col-span-3">
                    <div className="flex items-center gap-1">
                      {user.role === 'admin' ? (
                        <Shield className="h-4 w-4 text-rental-700" />
                      ) : (
                        <User className="h-4 w-4 text-gray-500" />
                      )}
                      <span className="capitalize">{user.role}</span>
                    </div>
                  </div>
                  <div className="col-span-2 lg:col-span-2 flex justify-end gap-2">
                    <Select
                      value={user.role}
                      onValueChange={(value) => toggleUserRole(user.id, value)}
                      disabled={user.id === currentUser?.id}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="host">Host</SelectItem>
                        <SelectItem value="guest">Guest</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={user.id === currentUser?.id}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <AlertTriangle className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                No users found.
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="create" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New Admin User</CardTitle>
              <CardDescription>
                Create a new administrator account. Admins have full access to the system.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateAdmin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={newUser.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={newUser.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={newUser.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                  />
                  <p className="text-xs text-muted-foreground">
                    Password must be at least 6 characters long.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={newUser.role} onValueChange={handleRoleChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="host">Host</SelectItem>
                      <SelectItem value="guest">Guest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create User
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
