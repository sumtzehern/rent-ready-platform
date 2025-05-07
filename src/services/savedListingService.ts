import { supabase } from '../lib/supabase';
import { Listing, Location, Photo } from './listingService'; // Assuming Listing, Location, and Photo interfaces are exported from listingService

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
  ): Promise<(SavedListing | (SavedListing & { listing_details: Listing & { locations: (Location & { photos?: Photo[] }) | null } | null }))[]> { 
    // Define types for handling data with and without details
    type LocationWithPhotos = Location & { photos?: Photo[] };
    type ListingWithLocationAndPhotos = Listing & { locations: LocationWithPhotos | null };

    // Define a type for the data expected directly from Supabase query when details are included
    // 'listing' will have 'locations' and 'photos' as sibling properties here.
    type RawSupabaseListing = Listing & { // Extends base Listing properties
      locations: Location | null;         // Raw location object from query
      photos: Photo[] | null;             // Raw photos array from query, sibling to locations
    };

    type SavedListingWithRawSupabaseDetails = SavedListing & {
      listing: RawSupabaseListing | null;
    };

    if (includeDetails) {
      // Call the RPC function
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_saved_listings_with_details_by_username', {
        _username: username,
      });

      if (rpcError) {
        console.error('Error fetching saved listings via RPC:', rpcError.message);
        throw rpcError;
      }
      if (!rpcData) {
        return [];
      }

      // Transform the RPC data to the expected frontend structure
      return rpcData.map(item => {
        // The 'item' from RPC has: { listings: number, f_username: string, listing_details: RawSupabaseListing | null }
        const { listings, f_username: item_f_username, listing_details: rawListingDataFromRpc } = item;
        let processedListingDetails: ListingWithLocationAndPhotos | null = null;

        if (rawListingDataFromRpc) {
          // rawListingDataFromRpc is already structured like RawSupabaseListing by the RPC
          // Explicitly cast for type safety, though structure should match.
          const typedRawListingData = rawListingDataFromRpc as RawSupabaseListing;
          const { locations: rawLocationObj, photos: rawPhotosArray, ...baseListingProps } = typedRawListingData;
          
          processedListingDetails = {
            ...baseListingProps, 
            locations: rawLocationObj ? {
              ...rawLocationObj,    
              photos: rawPhotosArray || [] 
            } : null
          };
        }

        return {
          listings, // from item
          f_username: item_f_username, // from item
          listing_details: processedListingDetails
        };
      }) as (SavedListing & { listing_details: ListingWithLocationAndPhotos | null })[];

    } else {
      // Original logic for when includeDetails is false (no need to fetch full listing details)
      const { data, error } = await supabase
        .from('saved_listings')
        .select('*')
        .eq('f_username', username);

      if (error) {
        console.error('Error fetching saved listings (basic):', error.message);
        throw error;
      }
      return (data || []) as SavedListing[];
    }
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
