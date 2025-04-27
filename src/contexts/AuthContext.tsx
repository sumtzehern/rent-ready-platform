
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';

// Define user types
export type UserRole = 'admin' | 'host' | 'guest';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
  checkIsAdmin: () => boolean;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock database for demo (would be replaced by actual API calls)
const USERS_STORAGE_KEY = 'rental_users';

// Initial admin user (this would normally be created via a secure process)
const initialAdminUser = {
  id: "admin-1",
  email: "admin@example.com",
  name: "Admin User",
  role: "admin" as UserRole,
  // In real app, we'd never store passwords like this - this is just for demo
  password: "$2a$10$randomHashedPasswordString" // Simulating a hashed password
};

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Setup initial state on first load
  useEffect(() => {
    // Initialize users if they don't exist yet
    const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    if (!storedUsers) {
      const initialUsers = [
        {
          ...initialAdminUser,
          password: "admin123" // Insecure, just for demo purposes
        }
      ];
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(initialUsers));
    }
    
    // Check for logged in user
    const loggedInUser = localStorage.getItem('currentUser');
    if (loggedInUser) {
      setUser(JSON.parse(loggedInUser));
    }
    setIsLoading(false);
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API request delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get users from storage
      const users = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
      const foundUser = users.find((u: any) => u.email === email);
      
      if (!foundUser) {
        throw new Error('User not found');
      }

      // In real app, we'd use bcrypt.compare or similar
      if (foundUser.password !== password) { 
        throw new Error('Invalid password');
      }

      // Create a safe user object without password
      const safeUser = {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
        role: foundUser.role
      };

      // Store user in state and localStorage
      setUser(safeUser);
      localStorage.setItem('currentUser', JSON.stringify(safeUser));
      
      toast({
        title: "Logged in successfully",
        description: `Welcome back, ${safeUser.name}!`,
      });
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      // Simulate API request delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get existing users
      const users = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
      
      // Check if user already exists
      if (users.some((u: any) => u.email === email)) {
        throw new Error('User already exists with this email');
      }

      // Create new user (as a host by default)
      const newUser = {
        id: `user-${Date.now()}`,
        email,
        name,
        password, // In a real app, we would hash this
        role: 'host' as UserRole
      };

      // Save to "database"
      users.push(newUser);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

      // Log user in (without password in state)
      const safeUser = { ...newUser };
      delete (safeUser as any).password;

      setUser(safeUser);
      localStorage.setItem('currentUser', JSON.stringify(safeUser));
      
      toast({
        title: "Registration successful",
        description: `Welcome, ${safeUser.name}!`,
      });
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('currentUser');
    setUser(null);
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };

  // Update user profile
  const updateUserProfile = async (data: Partial<User>) => {
    if (!user) return Promise.reject('No user logged in');
    
    try {
      // Get existing users
      const users = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
      
      // Find and update the user
      const updatedUsers = users.map((u: any) => {
        if (u.id === user.id) {
          return { ...u, ...data };
        }
        return u;
      });
      
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
      
      // Update current user
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });

      return Promise.resolve();
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to update profile",
        variant: "destructive"
      });
      return Promise.reject(error);
    }
  };

  // Check if current user is admin
  const checkIsAdmin = () => {
    return user?.role === 'admin';
  };

  // Context value
  const contextValue = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateUserProfile,
    checkIsAdmin
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
