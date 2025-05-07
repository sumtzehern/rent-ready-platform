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

    let query = supabase
      .from('saved_listings')
      .select<
        string,
        SavedListingWithRawSupabaseDetails // Use the new type for raw data
      >(includeDetails ? `*, listing!inner(*, locations!inner(*), photos(*))` : '*') // photos is now sibling to locations, under listing
      .eq('f_username', username);

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching saved listings:', error.message);
      throw error;
    }

    if (!data) {
      return [];
    }

    if (includeDetails) {
      return (data as SavedListingWithRawSupabaseDetails[]).map(sl => {
        const { listing: rawListingData, ...savedListingBase } = sl;
        let processedListingDetails: ListingWithLocationAndPhotos | null = null;

        if (rawListingData) {
          const { locations: rawLocationObj, photos: rawPhotosArray, ...baseListingProps } = rawListingData;
          processedListingDetails = {
            ...baseListingProps, // Spread base props from Listing (description, price, etc.)
            locations: rawLocationObj ? {
              ...rawLocationObj,    // Spread props from Location (city, zip_code, etc.)
              photos: rawPhotosArray || [] // Attach photos here
            } : null
          };
        }

        return {
          ...savedListingBase,
          listing_details: processedListingDetails
        };
      }) as (SavedListing & { listing_details: ListingWithLocationAndPhotos | null })[];
    }

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
