import { supabase } from '../lib/supabase';

export interface Booking {
  f_listing_id: number;
  check_in_date: string;
  check_out_date: string;
  reservation_status: string;
  reservation_confirmation: string;
  duration: number;
}

export const bookingService = {
  // Get all bookings
  async getAll() {
    const { data, error } = await supabase
      .from('booking')
      .select('*');
    
    if (error) throw error;
    return data;
  },

  // Get booking by listing ID
  async getByListingId(listingId: number) {
    const { data, error } = await supabase
      .from('booking')
      .select('*')
      .eq('f_listing_id', listingId);
    
    if (error) throw error;
    return data;
  },

  // Create a new booking
  async create(booking: Booking) {
    const { data, error } = await supabase
      .from('booking')
      .insert([booking])
      .select();
    
    if (error) throw error;
    return data[0];
  },

  // Update a booking
  async update(listingId: number, checkInDate: string, updates: Partial<Booking>) {
    const { data, error } = await supabase
      .from('booking')
      .update(updates)
      .eq('f_listing_id', listingId)
      .eq('check_in_date', checkInDate)
      .select();
    
    if (error) throw error;
    return data[0];
  },

  // Delete a booking
  async delete(listingId: number, checkInDate: string) {
    const { error } = await supabase
      .from('booking')
      .delete()
      .eq('f_listing_id', listingId)
      .eq('check_in_date', checkInDate);
    
    if (error) throw error;
    return true;
  },

  // Get bookings by status
  async getByStatus(status: string) {
    const { data, error } = await supabase
      .from('booking')
      .select('*')
      .eq('reservation_status', status);
    
    if (error) throw error;
    return data;
  },

  // Check availability for a listing during a specific date range
  async checkAvailability(listingId: number, checkInDate: string, checkOutDate: string) {
    const { data, error } = await supabase
      .from('booking')
      .select('*')
      .eq('f_listing_id', listingId)
      .or(`check_in_date.lte.${checkOutDate},check_out_date.gte.${checkInDate}`);
    
    if (error) throw error;
    // If data is empty, the listing is available for the specified date range
    return data.length === 0;
  }
};
