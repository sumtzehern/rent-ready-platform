import { supabase } from '../lib/supabase';
import { Listing, Location } from './listingService'; // Assuming Listing and Location interfaces are exported from listingService

export interface SavedListing {
  listings: number; // Corresponds to listing_id
  f_username: string;
}

export const savedListingService = {
  // Add a listing to saved listings
  async add(username: string, listingId: number): Promise<SavedListing | null> {
    const { data, error } = await supabase
      .from('saved_listings')
      .insert([{ listings: listingId, f_username: username }])
      .select()
      .single(); // Use single() if you expect one record back or handle array

    if (error) {
      console.error('Error saving listing:', error.message);
      // Check for unique constraint violation (already saved)
      if (error.code === '23505') { // PostgreSQL unique violation error code
        console.warn(`Listing ${listingId} already saved by user ${username}`);
        // Optionally, you could fetch and return the existing saved listing entry
        return this.getSavedListingEntry(username, listingId);
      }
      throw error;
    }
    return data;
  },

  // Remove a listing from saved listings
  async remove(username: string, listingId: number): Promise<boolean> {
    const { error } = await supabase
      .from('saved_listings')
      .delete()
      .eq('f_username', username)
      .eq('listings', listingId);

    if (error) {
      console.error('Error unsaving listing:', error.message);
      throw error;
    }
    return true;
  },

  // Get all listings saved by a user, optionally with listing details
  async getByUsername(
    username: string,
    includeDetails: boolean = false
  ): Promise<(SavedListing | (SavedListing & { listing_details: Listing & { locations: Location | null } | null }))[]> {
    // Define a type for the data expected from Supabase when details are included
    type SavedListingWithDetails = SavedListing & {
      listing: (Listing & { locations: Location | null }) | null;
    };

    let query = supabase
      .from('saved_listings')
      // Explicitly type the expected return shape for the select query
      .select<
        string,
        SavedListing & { 
          listing: (Listing & { locations: Location | null }) | null; 
        }
      >(includeDetails ? `*, listing!inner(*, locations(*))` : '*') 
      .eq('f_username', username);

    // The data type from Supabase client can be `PostgrestResponse<T>['data']` which can be T[] | null
    // or for single(), T | null. Here it's T[] | null.
    const { data, error } = await query;

    if (error) {
      console.error('Error fetching saved listings:', error.message);
      throw error;
    }

    // If data is null (e.g., no records found or error), return an empty array.
    if (!data) {
      return [];
    }

    if (includeDetails) {
      // At this point, 'data' is (SavedListing & { listing: ... })[]
      // The 'as any as X' pattern is sometimes needed if TypeScript struggles with complex mapped types.
      // However, with explicit select typing, it might directly map.
      return (data as SavedListingWithDetails[]).map(sl => {
        const { listing, ...savedListingBase } = sl;
        return {
          ...savedListingBase,
          listing_details: listing ? {
            ...listing,
            locations: listing.locations || null
          } : null
        };
        // Ensure the final mapped type matches the Promise return type
      }) as (SavedListing & { listing_details: (Listing & { locations: Location | null }) | null })[];
    }

    // If not includeDetails, data is SavedListing[]
    return data as SavedListing[];
  },

  // Check if a specific listing is saved by a user
  async isListingSaved(username: string, listingId: number): Promise<boolean> {
    const { data, error, count } = await supabase
      .from('saved_listings')
      .select('*', { count: 'exact', head: true })
      .eq('f_username', username)
      .eq('listings', listingId);

    if (error) {
      console.error('Error checking if listing is saved:', error.message);
      throw error;
    }
    return (count || 0) > 0;
  },

  // Helper to get a specific saved listing entry
  async getSavedListingEntry(username: string, listingId: number): Promise<SavedListing | null> {
    const { data, error } = await supabase
      .from('saved_listings')
      .select('*')
      .eq('f_username', username)
      .eq('listings', listingId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116: Row not found, which is fine for a "get or null"
        console.error('Error fetching specific saved listing entry:', error.message);
        throw error;
    }
    return data;
  }
};
