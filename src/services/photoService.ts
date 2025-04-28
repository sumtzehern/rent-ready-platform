import { supabase } from '../lib/supabase';

export interface Photo {
  photo_id: number;
  photo_url: string;
  f_listing_id: number;
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
    return data;
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
    
    // Create a record in the photos table
    const photo = {
      photo_url: urlData.publicUrl,
      f_listing_id: listingId
    };
    
    return await photoService.create(photo);
  }
};
