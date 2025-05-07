import { supabase } from '../lib/supabase';

export interface Photo {
  photo_id: number;
  photoid: number; 
  photo_url: string;
  f_listing_id?: number; 
  f_location_id: number;
}

export interface Listing {
  listing_id: number;
  price: number;
  description: string;
  contact_info: string;
  host_username: string;
  location_id: number;
  title?: string; 
  photos?: Photo[]; 
  locations?: Location; 
}

export interface Location {
  location_id: number;
  loc_type?: string | null; 
  zip_code: number;
  city: string;
  state: string;
  street: string;
  number_of_listings?: number | null; 
  number_of_rooms?: number; 
}

export const listingService = {
  // Get all listings
  async getAll(): Promise<Listing[]> {
    const { data, error } = await supabase
      .from('listing')
      .select('*');
    
    if (error) throw error;
    return data;
  },

  // Get listing by ID with location and photos
  async getById(listingId: number): Promise<Listing | null> {
    try {
      // Get the listing with its location
      const { data, error } = await supabase
        .from('listing')
        .select(`
          *,
          locations(*)
        `)
        .eq('listing_id', listingId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') { 
          return null;
        }
        throw error;
      }
      
      if (!data) return null;

      // Supabase might return location nested under 'locations'
      const locationData = data.locations as Location | undefined;
      
      // Get photos separately
      const { data: photosData, error: photosError } = await supabase
        .from('photos')
        .select('*')
        .eq('f_location_id', data.location_id);
      
      if (photosError) throw photosError;
      
      const formattedPhotos: Photo[] = photosData ? photosData.map(photo => ({
        photo_id: photo.photoid,
        photoid: photo.photoid,
        photo_url: photo.photo_url,
        f_listing_id: listingId, 
        f_location_id: data.location_id
      })) : [];
      
      return {
        ...data,
        location_id: data.location_id, 
        price: data.price,
        description: data.description,
        contact_info: data.contact_info,
        host_username: data.host_username,
        // title should come from data if it exists, otherwise handle as optional
        title: data.title, 
        locations: locationData, 
        photos: formattedPhotos.length > 0 ? formattedPhotos : undefined
      } as Listing;
    } catch (error) {
      console.error('Error fetching listing details:', error);
      throw error;
    }
  },

  // Get listings by host username
  async getByHostUsername(hostUsername: string): Promise<Listing[]> {
    const { data, error } = await supabase
      .from('listing')
      .select('*')
      .eq('host_username', hostUsername);
    
    if (error) throw error;
    return data;
  },

  // Get listings with location details and photos
  async getAllWithLocation(): Promise<Listing[]> {
    try {
      // First get all listings
      const { data: listingsData, error: listingsError } = await supabase
        .from('listing')
        .select(`
          *,
          locations(*)
        `);
      
      if (listingsError) throw listingsError;
      if (!listingsData) return [];
      
      // Now get all photos separately
      const { data: photosData, error: photosError } = await supabase
        .from('photos')
        .select('*');
      
      if (photosError) throw photosError;
      
      // Map photos to their respective listings
      const enhancedData = listingsData.map(listing => {
        const listingPhotos: Photo[] = photosData ? photosData
          .filter(photo => photo.f_location_id === listing.location_id)
          .map(photo => ({
            photo_id: photo.photoid,
            photoid: photo.photoid,
            photo_url: photo.photo_url,
            f_listing_id: listing.listing_id,
            f_location_id: photo.f_location_id
          })) : [];
        
        return {
          ...listing,
          photos: listingPhotos.length > 0 ? listingPhotos : undefined,
          locations: listing.locations as Location | undefined 
        } as Listing;
      });
      
      return enhancedData;
    } catch (error) {
      console.error('Error fetching listings:', error);
      throw error;
    }
  },

  // Create a new listing
  async create(listingData: Omit<Listing, 'listing_id' | 'photos' | 'locations'> & { location_id: number, title?: string }): Promise<Listing> {
    console.log('Creating listing:', listingData);
    const { data, error } = await supabase
      .from('listing')
      .insert([listingData])
      .select('*, locations(*)') 
      .single();
    
    if (error) {
      console.error('Error creating listing:', error);
      throw error;
    }
    if (!data) throw new Error('Listing creation failed, no data returned');

    // Assuming photos are handled separately after listing creation
    return {
        ...data,
        locations: data.locations as Location | undefined
    } as Listing;
  },

  // Update a listing
  async update(listingId: number, updates: Partial<Omit<Listing, 'photos' | 'locations'>>): Promise<Listing | null> {
    const { data, error } = await supabase
      .from('listing')
      .update(updates)
      .eq('listing_id', listingId)
      .select('*, locations(*)')
      .single();
    
    if (error) {
        if (error.code === 'PGRST116') return null; 
        throw error;
    }
    if (!data) return null;

    return {
        ...data,
        locations: data.locations as Location | undefined
    } as Listing;
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
  async searchByLocation(city: string, state: string): Promise<Listing[]> {
    const { data, error } = await supabase
      .from('listing')
      .select(`
        *,
        locations(*)
      `)
      .eq('locations.city', city)
      .eq('locations.state', state);
    
    if (error) throw error;
    if (!data) return [];

    // Similar to getAllWithLocation, we might need to fetch photos separately if not included
    // For simplicity, assuming photos are not directly needed for search results display
    // or would be fetched when viewing details.
    return data.map(item => ({
        ...item,
        locations: item.locations as Location | undefined
    })) as Listing[];
  },

  // Get listings with photos
  async getListingsWithPhotos() {
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
