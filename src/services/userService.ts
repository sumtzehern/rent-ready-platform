import { supabase } from '../lib/supabase';
import { createClient } from '@supabase/supabase-js';

// Constants for token storage
const AUTH_TOKEN_KEY = 'rent_ready_auth_token';
const USER_DATA_KEY = 'rent_ready_user_data';

export interface User {
  username: string;
  email: string;
  password: string;
  mode: string;
}

export const userService = {
  // Get all users
  async getAll() {
    const { data, error } = await supabase
      .from('user')
      .select('*');
    
    if (error) throw error;
    return data;
  },

  // Get user by username
  async getByUsername(username: string) {
    const { data, error } = await supabase
      .from('user')
      .select('*')
      .eq('username', username)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Create a new user
  async create(user: Omit<User, 'mode'> & { mode?: string }) {
    console.log('Creating new user:', { ...user, password: '***' });
    
    try {
      const { data, error } = await supabase
        .from('user')
        .insert([{ ...user, mode: user.mode || 'guest' }])
        .select();
      
      if (error) {
        console.error('Error creating user:', error);
        throw error;
      }
      
      console.log('User created successfully:', data[0]);
      return data[0];
    } catch (error) {
      console.error('Error in create user:', error);
      throw error;
    }
  },

  // Update a user
  async update(username: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from('user')
      .update(updates)
      .eq('username', username)
      .select();
    
    if (error) throw error;
    return data[0];
  },

  // Delete a user
  async delete(username: string) {
    const { error } = await supabase
      .from('user')
      .delete()
      .eq('username', username);
    
    if (error) throw error;
    return true;
  },

  // Login user (authenticate)
  async login(email: string, password: string) {
    try {
      console.log('Login attempt with email:', email);
      
      // First try to find the user by email only to see if they exist
      const { data: userCheck, error: checkError } = await supabase
        .from('user')
        .select('*')
        .eq('email', email);
      
      if (checkError) {
        console.error('Error checking for user:', checkError);
        throw checkError;
      }
      
      console.log('Users found with this email:', userCheck?.length || 0);
      
      if (!userCheck || userCheck.length === 0) {
        console.log('No user found with this email');
        return null;
      }
      
      // Now check with password
      const { data, error } = await supabase
        .from('user')
        .select('*')
        .eq('email', email)
        .eq('password', password);
      
      if (error) {
        console.error('Error during password check:', error);
        throw error;
      }
      
      // If no user found with matching password
      if (!data || data.length === 0) {
        console.log('Password does not match');
        return null;
      }
      
      console.log('User authenticated successfully:', data[0]);
      
      // Instead of using Supabase Auth which requires email confirmation,
      // we'll create a simple token by encoding the user data
      // This is a simplified approach - in a production app, you'd want to use a proper JWT library
      const token = btoa(JSON.stringify({
        id: data[0].username,
        email: data[0].email,
        exp: Date.now() + (7 * 24 * 60 * 60 * 1000) // Token expires in 7 days
      }));
      
      // Store the token and user data in localStorage
      this.storeAuthData(token, data[0]);
      
      console.log('Authentication token created and stored');
      
      // Return the first user found
      return data[0];
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  },
  
  // Store authentication data in localStorage
  storeAuthData(token: string, userData: User) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
  },
  
  // Get authentication data from localStorage
  getAuthData() {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const userDataStr = localStorage.getItem(USER_DATA_KEY);
    
    if (!token || !userDataStr) return null;
    
    try {
      const userData = JSON.parse(userDataStr) as User;
      return { token, userData };
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  },
  
  // Clear authentication data from localStorage
  clearAuthData() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
  },
  
  // Check if the user is authenticated
  isAuthenticated() {
    return !!this.getAuthData();
  }
};
