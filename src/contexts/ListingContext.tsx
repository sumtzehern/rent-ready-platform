import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from './AuthContext';
import { listingService, locationService, photoService } from '@/services';

// Define listing types
export interface Listing {
  listing_id: number;
  title?: string;
  description: string;
  price: number;
  contact_info: string;
  host_username: string;
  location_id: number;
  location?: {
    location_id: number;
    street: string;
    city: string;
    state: string;
    zip_code: string | number;
    number_of_rooms: number;
  };
  // Adding locations as an alternative property name for the same data
  locations?: {
    location_id: number;
    street: string;
    city: string;
    state: string;
    zip_code: string | number;
    number_of_rooms: number;
  };
  photos?: {
    photo_id?: number;
    photoid?: number; // Match the database column name
    photo_url: string;
    f_listing_id: number;
    f_location_id?: number;
    photo_time?: string;
  }[];
}

interface ListingContextType {
  listings: Listing[];
  userListings: Listing[];
  isLoading: boolean;
  getListing: (id: number) => Promise<Listing | undefined>;
  createListing: (listing: Omit<Listing, 'listing_id'>) => Promise<void>;
  updateListing: (id: number, listing: Partial<Listing>) => Promise<void>;
  deleteListing: (id: number) => Promise<void>;
  getStatsData: () => Promise<{
    totalListings: number;
    totalHosts: number;
    averagePrice: number;
    cityDistribution: Record<string, number>;
  }>;
}

// Create the context
const ListingContext = createContext<ListingContextType | undefined>(undefined);

// Provider component
export const ListingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Load listings from Supabase on component mount
  useEffect(() => {
    const fetchListings = async () => {
      try {
        setIsLoading(true);
        const data = await listingService.getAllWithLocation();
        setListings(data);
      } catch (error) {
        console.error('Error fetching listings:', error);
        toast({
          title: 'Error',
          description: 'Failed to load listings',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchListings();
  }, []);

  // Filter listings for the current user
  const userListings = listings.filter(listing => listing.host_username === user?.username);

  // Get a single listing by ID
  const getListing = async (id: number) => {
    try {
      return await listingService.getById(id);
    } catch (error) {
      console.error('Error fetching listing:', error);
      toast({
        title: 'Error',
        description: 'Failed to load listing details',
        variant: 'destructive'
      });
      return undefined;
    }
  };

  // Create a new listing
  const createListing = async (listingData: Omit<Listing, 'listing_id'>) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to create a listing",
        variant: "destructive"
      });
      return Promise.reject("Not authenticated");
    }

    setIsLoading(true);
    try {
      // Create location first if it doesn't exist
      let locationId = listingData.location_id;
      
      if (!locationId && listingData.location) {
        // Map the location to match the schema structure
        const locationData = await locationService.create({
          zip_code: typeof listingData.location.zip_code === 'string' 
            ? parseInt(listingData.location.zip_code) 
            : listingData.location.zip_code, // Handle either string or number
          city: listingData.location.city,
          state: listingData.location.state,
          street: listingData.location.street,
          number_of_listings: 1, // Default value for a new location
          loc_type: 'residential' // Default value
        });
        locationId = locationData.location_id;
      }
      
      // Create the listing
      const newListing = await listingService.create({
        price: listingData.price,
        description: listingData.description,
        contact_info: listingData.contact_info,
        host_username: user.username,
        location_id: locationId || 0
      });
      
      // Upload photos if provided
      if (listingData.photos && listingData.photos.length > 0) {
        for (const photo of listingData.photos) {
          await photoService.create({
            photo_url: photo.photo_url,
            f_listing_id: newListing.listing_id // Match the schema column name
          });
        }
      }
      
      // Refresh listings
      const updatedListings = await listingService.getAllWithLocation();
      setListings(updatedListings);
      
      toast({
        title: "Listing created",
        description: "Your property has been listed successfully"
      });
    } catch (error) {
      console.error('Error creating listing:', error);
      toast({
        title: "Error",
        description: "Failed to create listing",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Update an existing listing
  const updateListing = async (id: number, listingData: Partial<Listing>) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to update a listing",
        variant: "destructive"
      });
      return Promise.reject("Not authenticated");
    }
    
    setIsLoading(true);
    try {
      // First get the current listing
      const currentListing = await listingService.getById(id);
      
      if (!currentListing) {
        throw new Error("Listing not found");
      }
      
      // Check that user is owner or admin
      if (currentListing.host_username !== user.username && user.mode !== 'admin') {
        throw new Error("You don't have permission to update this listing");
      }
      
      // Update location if needed
      if (listingData.location) {
        // If location exists, update it
        if (currentListing.location_id) {
          await locationService.update(currentListing.location_id, {
            zip_code: typeof listingData.location.zip_code === 'string' 
              ? parseInt(listingData.location.zip_code) 
              : listingData.location.zip_code, // Handle either string or number
            city: listingData.location.city,
            state: listingData.location.state,
            street: listingData.location.street,
            number_of_listings: 1, // Maintain the same count
            loc_type: 'residential' // Maintain the same type
          });
        } else {
          // If location doesn't exist, create it
          const locationData = await locationService.create({
            zip_code: typeof listingData.location.zip_code === 'string' 
              ? parseInt(listingData.location.zip_code) 
              : listingData.location.zip_code, // Convert to number to match schema
            city: listingData.location.city,
            state: listingData.location.state,
            street: listingData.location.street,
            number_of_listings: 1,
            loc_type: 'residential'
          });
          
          // Update the listing with the new location ID
          await listingService.update(id, {
            location_id: locationData.location_id
          });
        }
      }
      
      // Update the listing
      const updatedListingData: Partial<Listing> = {
        price: listingData.price,
        description: listingData.description,
        contact_info: listingData.contact_info,
      };
      
      await listingService.update(id, updatedListingData);
      
      // Refresh listings
      const updatedListings = await listingService.getAllWithLocation();
      setListings(updatedListings);
      
      toast({
        title: "Listing updated",
        description: "Your property listing has been updated"
      });
    } catch (error: any) {
      console.error('Error updating listing:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update listing",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a listing
  const deleteListing = async (id: number) => {
    setIsLoading(true);
    try {
      // Get the current listing
      const listing = await listingService.getById(id);
      
      if (!listing) {
        throw new Error("Listing not found");
      }
      
      if (listing.host_username !== user?.username && user?.mode !== 'admin') {
        throw new Error("You don't have permission to delete this listing");
      }
      
      // Delete the listing
      await listingService.delete(id);
      
      // Refresh listings
      const updatedListings = await listingService.getAllWithLocation();
      setListings(updatedListings);
      
      toast({
        title: "Listing deleted",
        description: "The property has been removed from listings"
      });
    } catch (error: any) {
      console.error('Error deleting listing:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete listing",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Get statistics for reporting
  const getStatsData = async () => {
    try {
      // Get all listings with location details
      const allListings = await listingService.getAllWithLocation();
      
      // Get unique host usernames
      const hostUsernames = [...new Set(allListings.map(listing => listing.host_username))];
      
      // Calculate average price
      const totalPrice = allListings.reduce((sum, listing) => sum + listing.price, 0);
      const averagePrice = allListings.length > 0 ? totalPrice / allListings.length : 0;
      
      // Get distribution by city
      const cityDistribution = allListings.reduce<Record<string, number>>((acc, listing) => {
        if (listing.location) {
          const city = listing.location.city;
          acc[city] = (acc[city] || 0) + 1;
        }
        return acc;
      }, {});
      
      return {
        totalListings: allListings.length,
        totalHosts: hostUsernames.length,
        averagePrice,
        cityDistribution
      };
    } catch (error) {
      console.error('Error getting stats data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load statistics',
        variant: 'destructive'
      });
      return {
        totalListings: 0,
        totalHosts: 0,
        averagePrice: 0,
        cityDistribution: {}
      };
    }
  };

  // Context value
  const contextValue = {
    listings,
    userListings,
    isLoading,
    getListing,
    createListing,
    updateListing,
    deleteListing,
    getStatsData
  };

  return (
    <ListingContext.Provider value={contextValue}>
      {children}
    </ListingContext.Provider>
  );
};

// Custom hook to use the listing context
export const useListing = () => {
  const context = useContext(ListingContext);
  if (context === undefined) {
    throw new Error('useListing must be used within a ListingProvider');
  }
  return context;
};
