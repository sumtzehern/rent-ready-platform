import { supabase } from '../lib/supabase';

export interface HostReview {
  review_id: number;
  f_listing_id: number;
  f_host_username: string;
  f_guest_username: string;
}

export const reviewService = {
  // Get all reviews
  async getAll() {
    const { data, error } = await supabase
      .from('host_review')
      .select('*');
    
    if (error) throw error;
    return data;
  },

  // Get reviews by listing ID
  async getByListingId(listingId: number) {
    const { data, error } = await supabase
      .from('host_review')
      .select('*')
      .eq('f_listing_id', listingId);
    
    if (error) throw error;
    return data;
  },

  // Get reviews by host username
  async getByHostUsername(hostUsername: string) {
    const { data, error } = await supabase
      .from('host_review')
      .select('*')
      .eq('f_host_username', hostUsername);
    
    if (error) throw error;
    return data;
  },

  // Get reviews by guest username
  async getByGuestUsername(guestUsername: string) {
    const { data, error } = await supabase
      .from('host_review')
      .select('*')
      .eq('f_guest_username', guestUsername);
    
    if (error) throw error;
    return data;
  },

  // Create a new review
  async create(review: Omit<HostReview, 'review_id'>) {
    const { data, error } = await supabase
      .from('host_review')
      .insert([review])
      .select();
    
    if (error) throw error;
    return data[0];
  },

  // Update a review
  async update(reviewId: number, updates: Partial<HostReview>) {
    const { data, error } = await supabase
      .from('host_review')
      .update(updates)
      .eq('review_id', reviewId)
      .select();
    
    if (error) throw error;
    return data[0];
  },

  // Delete a review
  async delete(reviewId: number) {
    const { error } = await supabase
      .from('host_review')
      .delete()
      .eq('review_id', reviewId);
    
    if (error) throw error;
    return true;
  }
};
