import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      user: {
        Row: {
          username: string;
          password: string;
          email: string;
          mode: string;
        };
        Insert: {
          username: string;
          password: string;
          email: string;
          mode?: string;
        };
        Update: {
          username?: string;
          password?: string;
          email?: string;
          mode?: string;
        };
      };
      listing: {
        Row: {
          listing_id: number;
          price: number;
          description: string;
          contact_info: string;
          host_username: string;
          location_id: number;
        };
        Insert: {
          listing_id?: number;
          price: number;
          description: string;
          contact_info: string;
          host_username: string;
          location_id: number;
        };
        Update: {
          listing_id?: number;
          price?: number;
          description?: string;
          contact_info?: string;
          host_username?: string;
          location_id?: number;
        };
      };
      booking: {
        Row: {
          f_listing_id: number;
          check_in_date: string;
          check_out_date: string;
          reservation_status: string;
          reservation_confirmation: string;
          duration: number;
        };
        Insert: {
          f_listing_id: number;
          check_in_date: string;
          check_out_date: string;
          reservation_status?: string;
          reservation_confirmation?: string;
          duration: number;
        };
        Update: {
          f_listing_id?: number;
          check_in_date?: string;
          check_out_date?: string;
          reservation_status?: string;
          reservation_confirmation?: string;
          duration?: number;
        };
      };
      location: {
        Row: {
          location_id: number;
          zip_code: string;
          city: string;
          state: string;
          street: string;
          number_of_rooms: number;
        };
        Insert: {
          location_id?: number;
          zip_code: string;
          city: string;
          state: string;
          street: string;
          number_of_rooms: number;
        };
        Update: {
          location_id?: number;
          zip_code?: string;
          city?: string;
          state?: string;
          street?: string;
          number_of_rooms?: number;
        };
      };
      availability: {
        Row: {
          availability_id: number;
          listing_id: number;
          date: string;
        };
        Insert: {
          availability_id?: number;
          listing_id: number;
          date: string;
        };
        Update: {
          availability_id?: number;
          listing_id?: number;
          date?: string;
        };
      };
      photos: {
        Row: {
          photo_id: number;
          photo_url: string;
          f_listing_id: number;
        };
        Insert: {
          photo_id?: number;
          photo_url: string;
          f_listing_id: number;
        };
        Update: {
          photo_id?: number;
          photo_url?: string;
          f_listing_id?: number;
        };
      };
      message: {
        Row: {
          message_id: number;
          text: string;
          sender_id: string;
          receiver_id: string;
        };
        Insert: {
          message_id?: number;
          text: string;
          sender_id: string;
          receiver_id: string;
        };
        Update: {
          message_id?: number;
          text?: string;
          sender_id?: string;
          receiver_id?: string;
        };
      };
      host_review: {
        Row: {
          review_id: number;
          f_listing_id: number;
          f_host_username: string;
          f_guest_username: string;
        };
        Insert: {
          review_id?: number;
          f_listing_id: number;
          f_host_username: string;
          f_guest_username: string;
        };
        Update: {
          review_id?: number;
          f_listing_id?: number;
          f_host_username?: string;
          f_guest_username?: string;
        };
      };
    };
  };
};
