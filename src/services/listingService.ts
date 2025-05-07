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

  // Get listing by ID with location and photos
  async getById(listingId: number) {
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
      
      if (error) throw error;
      
      // Get location separately if not included in the join
      let locationData = data.locations;
      
      if (!locationData && data.location_id) {
        const { data: locData, error: locError } = await supabase
          .from('locations')
          .select('*')
          .eq('location_id', data.location_id)
          .single();
          
        if (!locError) {
          locationData = locData;
        }
      }
      
      // Get photos separately
      const { data: photosData, error: photosError } = await supabase
        .from('photos')
        .select('*')
        .eq('f_location_id', data.location_id);
      
      if (photosError) throw photosError;
      
      // Map the photos to the listing
      const formattedPhotos = photosData.map(photo => ({
        photo_id: photo.photoid,
        photoid: photo.photoid,
        photo_url: photo.photo_url,
        f_listing_id: listingId,
        f_location_id: data.location_id
      }));
      
      // Create a properly structured result
      return {
        ...data,
        location: locationData, // Ensure location is always at this property
        photos: formattedPhotos.length > 0 ? formattedPhotos : undefined
      };
    } catch (error) {
      console.error('Error fetching listing details:', error);
      throw error;
    }
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

  // Get listings with location details and photos
  async getAllWithLocation() {
    try {
      // First get all listings
      const { data: listingsData, error: listingsError } = await supabase
        .from('listing')
        .select(`
          *,
          locations(*)
        `);
      
      if (listingsError) throw listingsError;
      
      // Now get all photos separately
      const { data: photosData, error: photosError } = await supabase
        .from('photos')
        .select('*');
      
      if (photosError) throw photosError;
      
      // Map photos to their respective listings
      const enhancedData = listingsData.map(listing => {
        const listingPhotos = photosData.filter(photo => 
          // In your schema, photos are linked to listings via f_location_id
          photo.f_location_id === listing.location_id
        );
        
        return {
          ...listing,
          photos: listingPhotos.length > 0 ? listingPhotos.map(photo => ({
            photo_id: photo.photoid,
            photoid: photo.photoid,
            photo_url: photo.photo_url,
            f_listing_id: listing.listing_id,
            f_location_id: photo.f_location_id
          })) : undefined
        };
      });
      
      return enhancedData;
    } catch (error) {
      console.error('Error fetching listings:', error);
      throw error;
    }
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
