import { supabase } from '../lib/supabase';

export interface Listing {
  listing_id: number;
  price: number;
  description: string;
  contact_info: string;
  host_username: string;
  location_id: number;
}

export const listingService = {
  // Get all listings
  async getAll() {
    const { data, error } = await supabase
      .from('listing')
      .select('*');
    
    if (error) throw error;
    return data;
  },

  // Get listing by ID
  async getById(listingId: number) {
    const { data, error } = await supabase
      .from('listing')
      .select('*')
      .eq('listing_id', listingId)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get listings by host username
  async getByHostUsername(hostUsername: string) {
    const { data, error } = await supabase
      .from('listing')
      .select('*')
      .eq('host_username', hostUsername);
    
    if (error) throw error;
    return data;
  },

  // Get listings with location details
  async getAllWithLocation() {
    // Using the correct foreign key constraints from the schema
    const { data, error } = await supabase
      .from('listing')
      .select(`
        *,
        locations(*) 
      `);
    
    if (error) throw error;
    return data;
  },

  // Create a new listing
  async create(listing: Omit<Listing, 'listing_id'>) {
    console.log('Creating listing:', listing);
    const { data, error } = await supabase
      .from('listing')
      .insert([listing])
      .select();
    
    if (error) {
      console.error('Error creating listing:', error);
      throw error;
    }
    return data[0];
  },

  // Update a listing
  async update(listingId: number, updates: Partial<Listing>) {
    const { data, error } = await supabase
      .from('listing')
      .update(updates)
      .eq('listing_id', listingId)
      .select();
    
    if (error) throw error;
    return data[0];
  },

  // Delete a listing
  async delete(listingId: number) {
    const { error } = await supabase
      .from('listing')
      .delete()
      .eq('listing_id', listingId);
    
    if (error) throw error;
    return true;
  },

  // Search listings by location
  async searchByLocation(city: string, state: string) {
    const { data, error } = await supabase
      .from('listing')
      .select(`
        *,
        locations(*) 
      `)
      .eq('locations.city', city)
      .eq('locations.state', state);
    
    if (error) throw error;
    return data;
  },

  // Get listings with photos
  async getListingsWithPhotos() {
    // Using the correct foreign key from the schema
    const { data, error } = await supabase
      .from('listing')
      .select(`
        *,
        photos(*)
      `);
    
    if (error) throw error;
    return data;
  }
};
