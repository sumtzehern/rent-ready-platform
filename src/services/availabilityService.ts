import { supabase } from '../lib/supabase';

export interface Availability {
  availability: string; 
  f_listing_id: number; 
}

export const availabilityService = {
  // Get all availability records
  async getAll() {
    const { data, error } = await supabase
      .from('availability')
      .select('*');
    
    if (error) throw error;
    return data;
  },

  // Get availability by listing ID
  async getByListingId(listingId: number) {
    const { data, error } = await supabase
      .from('availability')
      .select('*')
      .eq('f_listing_id', listingId); 
    
    if (error) throw error;
    return data;
  },

  // Create a new availability record
  async create(availability: Availability) { 
    const { data, error } = await supabase
      .from('availability')
      .insert([availability])
      .select();
    
    if (error) throw error;
    return data[0];
  },

  // Update an availability record
  async update(date: string, listingId: number, updates: Partial<Availability>) { 
    const { data, error } = await supabase
      .from('availability')
      .update(updates)
      .eq('availability', date) 
      .eq('f_listing_id', listingId) 
      .select();
    
    if (error) throw error;
    return data[0];
  },

  // Delete an availability record
  async delete(date: string, listingId: number) { 
    const { error } = await supabase
      .from('availability')
      .delete()
      .eq('availability', date) 
      .eq('f_listing_id', listingId); 
    
    if (error) throw error;
    return true;
  },

  // Check if a listing is available on a specific date
  async checkAvailabilityOnDate(listingId: number, date: string) {
    const { data, error } = await supabase
      .from('availability')
      .select('*')
      .eq('f_listing_id', listingId) 
      .eq('availability', date); 
    
    if (error) throw error;
    return data.length > 0;
  },

  // Add multiple availability dates for a listing
  async addMultipleDates(listingId: number, dates: string[]) {
    const records = dates.map(date => ({
      f_listing_id: listingId, 
      availability: date 
    }));

    const { data, error } = await supabase
      .from('availability')
      .insert(records)
      .select();
    
    if (error) throw error;
    return data;
  }
};
