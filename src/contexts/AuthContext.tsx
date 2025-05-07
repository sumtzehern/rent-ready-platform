
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { userService } from '@/services/userService';

// Define user types
export type UserRole = 'admin' | 'host' | 'guest';

export interface User {
  username: string;
  email: string;
  name?: string;
  mode: UserRole;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, mode: UserRole) => Promise<void>;
  logout: () => void;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
  checkIsAdmin: () => boolean;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Setup initial state on first load - check for existing session
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Check for stored auth data first
        const authData = userService.getAuthData();
        
        if (authData) {
          // User has stored authentication data
          const { userData } = authData;
          
          setUser({
            username: userData.username,
            email: userData.email,
            mode: userData.mode as UserRole,
          });
        } else {
          // Fall back to Supabase session
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session) {
            // Get user details from the user table
            const userData = await userService.getByUsername(session.user.email || '');
            
            if (userData) {
              setUser({
                username: userData.username,
                email: userData.email,
                mode: userData.mode as UserRole,
              });
            }
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSession();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log('Attempting login with email:', email);
      
      // Get user from database
      const userData = await userService.login(email, password);
      console.log('Login response:', userData);
      
      if (!userData) {
        console.error('No user data returned from login');
        throw new Error('Invalid credentials - user not found');
      }

      // Store user in state
      const loggedInUser = {
        username: userData.username,
        email: userData.email,
        mode: userData.mode as UserRole
      };

      console.log('Setting user state with:', loggedInUser);
      setUser(loggedInUser);
      
      toast({
        title: "Logged in successfully",
        description: `Welcome back, ${loggedInUser.username}!`,
      });
    } catch (error: any) {
      console.error('Login error:', error);
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
  const register = async (email: string, password: string, name: string, mode: UserRole) => {
    setIsLoading(true);
    try {
      // Create the username from email (removing domain part)
      const username = email.split('@')[0];
      
      // Create new user with selected mode
      const newUser = {
        username,
        email,
        password,
        mode // Use the selected mode from registration
      };

      // Save to database
      const userData = await userService.create(newUser);

      // Log user in
      const registeredUser = {
        username: userData.username,
        email: userData.email,
        mode: userData.mode as UserRole
      };

      setUser(registeredUser);
      
      toast({
        title: "Registration successful",
        description: `Welcome, ${registeredUser.username}!`,
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
  const logout = async () => {
    try {
      // Clear the auth token and user data from localStorage
      userService.clearAuthData();
      
      // We're not using Supabase Auth anymore, so no need to sign out
      
      // Clear user state
      setUser(null);
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    } catch (error) {
      console.error('Error during logout:', error);
      toast({
        title: "Logout failed",
        description: "There was an error logging out",
        variant: "destructive"
      });
    }
  };

  // Update user profile
  const updateUserProfile = async (data: Partial<User>) => {
    if (!user) return Promise.reject('No user logged in');
    
    try {
      // Update user in database
      await userService.update(user.username, data);
      
      // Update current user state
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      
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
    if (!user) return false;
    
    // More permissive check for admin status
    return user.mode === 'admin' || 
           user.username === 'admin';
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
