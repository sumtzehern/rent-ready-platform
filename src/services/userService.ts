import { supabase } from '../lib/supabase';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

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
      // Hash the password before storing
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(user.password, salt);
      const userToSave = { ...user, password: hashedPassword, mode: user.mode || 'guest' };
      const { data, error } = await supabase
        .from('user')
        .insert([userToSave])
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
      // Find the user by email
      const { data: userCheck, error: checkError } = await supabase
        .from('user')
        .select('*')
        .eq('email', email);
      if (checkError) {
        console.error('Error checking for user:', checkError);
        throw checkError;
      }
      if (!userCheck || userCheck.length === 0) {
        console.log('No user found with this email');
        return null;
      }
      const user = userCheck[0];
      // Compare the hashed password
      const isMatch = bcrypt.compareSync(password, user.password);
      if (!isMatch) {
        console.log('Password does not match');
        return null;
      }
      console.log('User authenticated successfully:', user);
      // Create a simple token by encoding the user data
      const token = btoa(JSON.stringify({
        id: user.username,
        email: user.email,
        exp: Date.now() + (7 * 24 * 60 * 60 * 1000) // Token expires in 7 days
      }));
      // Store the token and user data in localStorage
      this.storeAuthData(token, user);
      console.log('Authentication token created and stored');
      return user;
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
