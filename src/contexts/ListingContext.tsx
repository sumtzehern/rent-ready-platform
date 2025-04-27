
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from './AuthContext';

// Define listing types
export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  bedrooms: number;
  bathrooms: number;
  imageUrl: string;
  hostId: string;
  createdAt: string;
  updatedAt: string;
}

interface ListingContextType {
  listings: Listing[];
  userListings: Listing[];
  isLoading: boolean;
  getListing: (id: string) => Listing | undefined;
  createListing: (listing: Omit<Listing, 'id' | 'hostId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateListing: (id: string, listing: Partial<Listing>) => Promise<void>;
  deleteListing: (id: string) => Promise<void>;
  getStatsData: () => {
    totalListings: number;
    totalHosts: number;
    averagePrice: number;
    cityDistribution: Record<string, number>;
  };
}

// Create the context
const ListingContext = createContext<ListingContextType | undefined>(undefined);

// Storage key
const LISTINGS_STORAGE_KEY = 'rental_listings';

// Provider component
export const ListingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Load listings from storage on component mount
  useEffect(() => {
    const storedListings = localStorage.getItem(LISTINGS_STORAGE_KEY);
    if (storedListings) {
      setListings(JSON.parse(storedListings));
    } else {
      // Initialize with sample data if empty
      const sampleListings = [
        {
          id: "listing-1",
          title: "Cozy Downtown Apartment",
          description: "A beautiful apartment in the heart of downtown with great views",
          price: 120,
          address: "123 Main St",
          city: "New York",
          state: "NY",
          zipCode: "10001",
          bedrooms: 2,
          bathrooms: 1,
          imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YXBhcnRtZW50fGVufDB8fDB8fHww&auto=format&fit=crop&w=600&q=60",
          hostId: "admin-1",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: "listing-2",
          title: "Luxury Beach House",
          description: "Stunning beachfront property with private access to the shore",
          price: 350,
          address: "456 Ocean Dr",
          city: "Miami",
          state: "FL",
          zipCode: "33139",
          bedrooms: 4,
          bathrooms: 3,
          imageUrl: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGhvdXNlfGVufDB8fDB8fHww&auto=format&fit=crop&w=600&q=60",
          hostId: "admin-1",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      
      localStorage.setItem(LISTINGS_STORAGE_KEY, JSON.stringify(sampleListings));
      setListings(sampleListings);
    }
    setIsLoading(false);
  }, []);

  // Filter listings for the current user
  const userListings = listings.filter(listing => listing.hostId === user?.id);

  // Get a single listing by ID
  const getListing = (id: string) => {
    return listings.find(listing => listing.id === id);
  };

  // Create a new listing
  const createListing = async (listingData: Omit<Listing, 'id' | 'hostId' | 'createdAt' | 'updatedAt'>) => {
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
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newListing = {
        ...listingData,
        id: `listing-${Date.now()}`,
        hostId: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const updatedListings = [...listings, newListing];
      setListings(updatedListings);
      localStorage.setItem(LISTINGS_STORAGE_KEY, JSON.stringify(updatedListings));
      
      toast({
        title: "Listing created",
        description: "Your property has been listed successfully"
      });
    } catch (error) {
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
  const updateListing = async (id: string, listingData: Partial<Listing>) => {
    setIsLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const listing = listings.find(l => l.id === id);
      
      if (!listing) {
        throw new Error("Listing not found");
      }
      
      if (listing.hostId !== user?.id && user?.role !== 'admin') {
        throw new Error("You don't have permission to update this listing");
      }
      
      const updatedListings = listings.map(l => {
        if (l.id === id) {
          return {
            ...l,
            ...listingData,
            updatedAt: new Date().toISOString()
          };
        }
        return l;
      });
      
      setListings(updatedListings);
      localStorage.setItem(LISTINGS_STORAGE_KEY, JSON.stringify(updatedListings));
      
      toast({
        title: "Listing updated",
        description: "Your property listing has been updated"
      });
    } catch (error: any) {
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
  const deleteListing = async (id: string) => {
    setIsLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const listing = listings.find(l => l.id === id);
      
      if (!listing) {
        throw new Error("Listing not found");
      }
      
      if (listing.hostId !== user?.id && user?.role !== 'admin') {
        throw new Error("You don't have permission to delete this listing");
      }
      
      const updatedListings = listings.filter(l => l.id !== id);
      setListings(updatedListings);
      localStorage.setItem(LISTINGS_STORAGE_KEY, JSON.stringify(updatedListings));
      
      toast({
        title: "Listing deleted",
        description: "The property has been removed from listings"
      });
    } catch (error: any) {
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
  const getStatsData = () => {
    // Get unique host IDs
    const hostIds = [...new Set(listings.map(listing => listing.hostId))];
    
    // Calculate average price
    const totalPrice = listings.reduce((sum, listing) => sum + listing.price, 0);
    const averagePrice = listings.length > 0 ? totalPrice / listings.length : 0;
    
    // Get distribution by city
    const cityDistribution = listings.reduce<Record<string, number>>((acc, listing) => {
      const city = listing.city;
      acc[city] = (acc[city] || 0) + 1;
      return acc;
    }, {});
    
    return {
      totalListings: listings.length,
      totalHosts: hostIds.length,
      averagePrice,
      cityDistribution
    };
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
