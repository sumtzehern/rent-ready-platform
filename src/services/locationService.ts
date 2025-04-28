import { supabase } from '../lib/supabase';

export interface Location {
  location_id: number;
  zip_code: string;
  city: string;
  state: string;
  street: string;
  number_of_rooms: number;
}

export const locationService = {
  // Get all locations
  async getAll() {
    const { data, error } = await supabase
      .from('locations')
      .select('*');
    
    if (error) throw error;
    return data;
  },

  // Get location by ID
  async getById(locationId: number) {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('location_id', locationId)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Create a new location
  async create(location: Omit<Location, 'location_id'>) {
    const { data, error } = await supabase
      .from('locations')
      .insert([location])
      .select();
    
    if (error) throw error;
    return data[0];
  },

  // Update a location
  async update(locationId: number, updates: Partial<Location>) {
    const { data, error } = await supabase
      .from('locations')
      .update(updates)
      .eq('location_id', locationId)
      .select();
    
    if (error) throw error;
    return data[0];
  },

  // Delete a location
  async delete(locationId: number) {
    const { error } = await supabase
      .from('locations')
      .delete()
      .eq('location_id', locationId);
    
    if (error) throw error;
    return true;
  },

  // Search locations by city and state
  async searchByCityAndState(city: string, state: string) {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('city', city)
      .eq('state', state);
    
    if (error) throw error;
    return data;
  },

  // Search locations by zip code
  async searchByZipCode(zipCode: string) {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('zip_code', zipCode);
    
    if (error) throw error;
    return data;
  }
};
