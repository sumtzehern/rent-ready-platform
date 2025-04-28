
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
    location_id?: number;
    zip_code: string;
    city: string;
    state: string;
    street: string;
    number_of_rooms: number;
  };
  photos?: {
    photo_id?: number;
    photo_url: string;
    f_listing_id: number;
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
        const locationData = await locationService.create({
          zip_code: listingData.location.zip_code,
          city: listingData.location.city,
          state: listingData.location.state,
          street: listingData.location.street,
          number_of_rooms: listingData.location.number_of_rooms
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
            f_listing_id: newListing.listing_id
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
    setIsLoading(true);
    try {
      // Get the current listing
      const listing = await listingService.getById(id);
      
      if (!listing) {
        throw new Error("Listing not found");
      }
      
      if (listing.host_username !== user?.username && user?.mode !== 'admin') {
        throw new Error("You don't have permission to update this listing");
      }
      
      // Update location if provided
      if (listingData.location && listing.location_id) {
        await locationService.update(listing.location_id, {
          zip_code: listingData.location.zip_code,
          city: listingData.location.city,
          state: listingData.location.state,
          street: listingData.location.street,
          number_of_rooms: listingData.location.number_of_rooms
        });
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
