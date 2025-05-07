import { supabase } from '../lib/supabase';

export interface Photo {
  photo_id?: number; // Changed to optional for creation
  photoid?: number; // Match schema column name
  photo_url: string;
  f_listing_id: number;
  f_location_id?: number; // This exists in the schema
  photo_time?: string; // This exists in the schema
}

export const photoService = {
  // Get all photos
  async getAll() {
    const { data, error } = await supabase
      .from('photos')
      .select('*');
    
    if (error) throw error;
    return data;
  },

  // Get photos by listing ID
  async getByListingId(listingId: number) {
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .eq('f_listing_id', listingId);
    
    if (error) throw error;
    
    // Map database columns to expected format if needed
    return data.map(photo => ({
      photo_id: photo.photoid, // Map photoid to photo_id for consistency
      photoid: photo.photoid,
      photo_url: photo.photo_url,
      f_listing_id: photo.f_listing_id,
      f_location_id: photo.f_location_id,
      photo_time: photo.photo_time
    }));
  },

  // Create a new photo
  async create(photo: Omit<Photo, 'photo_id'>) {
    const { data, error } = await supabase
      .from('photos')
      .insert([photo])
      .select();
    
    if (error) throw error;
    return data[0];
  },

  // Update a photo
  async update(photoId: number, updates: Partial<Photo>) {
    const { data, error } = await supabase
      .from('photos')
      .update(updates)
      .eq('photo_id', photoId)
      .select();
    
    if (error) throw error;
    return data[0];
  },

  // Delete a photo
  async delete(photoId: number) {
    const { error } = await supabase
      .from('photos')
      .delete()
      .eq('photo_id', photoId);
    
    if (error) throw error;
    return true;
  },

  // Upload a photo to Supabase storage and create a record
  async uploadAndCreate(file: File, listingId: number) {
    // First get the listing to find its location_id
    const { data: listing, error: listingError } = await supabase
      .from('listing')
      .select('location_id')
      .eq('listing_id', listingId)
      .single();
      
    if (listingError) throw listingError;
    
    // Generate a unique filename
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `listings/${listingId}/${fileName}`;
    
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('photos')
      .upload(filePath, file);
    
    if (uploadError) throw uploadError;
    
    // Get the public URL
    const { data: urlData } = supabase
      .storage
      .from('photos')
      .getPublicUrl(filePath);
    
    // Get current time for photo_time field
    const now = new Date();
    const timeString = now.toTimeString().split(' ')[0]; // Format: HH:MM:SS
    
    // Create a record in the photos table matching the schema
    const photo = {
      photo_url: urlData.publicUrl,
      f_listing_id: listingId,
      f_location_id: listing.location_id,
      photo_time: timeString
    };
    
    return await photoService.create(photo);
  }
};
