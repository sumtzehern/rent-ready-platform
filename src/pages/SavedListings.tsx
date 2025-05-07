import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { savedListingService, SavedListing } from '@/services/savedListingService';
import { Listing, Location, Photo } from '@/services/listingService'; 
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Trash2, Home } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

// This interface represents the structure when includeDetails is true
interface SavedListingWithPopulatedDetails extends SavedListing {
  listings: number; // Corresponds to listing_id from SavedListing
  f_username: string;
  listing_details: Listing & { locations?: Location | null; photos?: Photo[] }; // Non-nullable listing_details
}

const SavedListingsPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [savedListings, setSavedListings] = useState<SavedListingWithPopulatedDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSavedListings = useCallback(async () => {
    if (user && user.username) {
      setIsLoading(true);
      try {
        // Explicitly type the expected return when includeDetails is true
        const listingsFromService = await savedListingService.getByUsername(
          user.username, 
          true
        ) as unknown as Array<SavedListing & { listing_details?: (Listing & { locations?: Location | null; photos?: Photo[] }) | null }>;

        const detailedSavedListings = listingsFromService
          .filter((item): item is SavedListingWithPopulatedDetails => 
            Boolean(item.listing_details) && typeof item.listing_details === 'object'
          );
        setSavedListings(detailedSavedListings);
      } catch (error) {
        console.error('Failed to fetch saved listings:', error);
        toast({
          title: 'Error',
          description: 'Could not fetch saved listings.',
          variant: 'destructive',
        });
      }
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchSavedListings();
    }
  }, [user, isAuthenticated, fetchSavedListings]);

  const handleUnsaveListing = async (listingId: number) => {
    if (!user || !user.username) return;
    try {
      await savedListingService.remove(user.username, listingId);
      setSavedListings((prevListings) =>
        prevListings.filter((sl) => sl.listing_details?.listing_id !== listingId)
      );
      toast({
        title: 'Success',
        description: 'Listing removed from saved items.',
      });
    } catch (error) {
      console.error('Failed to unsave listing:', error);
      toast({
        title: 'Error',
        description: 'Could not remove listing from saved items.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p>Please log in to see your saved listings.</p>
        <Link to="/login">
          <Button className="mt-4">Login</Button>
        </Link>
      </div>
    );
  }
  
  if (savedListings.length === 0) {
    return (
      <div className="text-center py-12 border rounded-md bg-gray-50">
        <h3 className="font-medium text-lg mb-2">No Saved Listings</h3>
        <p className="text-muted-foreground mb-6">
          You haven't saved any listings yet. Start exploring!
        </p>
        <Link to="/listings">
          <Button>Browse Listings</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Saved Listings</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {savedListings.map(({ listing_details }) => {
          if (!listing_details) return null;
          const listing = listing_details; // alias for clarity
          const location = listing.locations; // Supabase relationship might bring it as 'locations'

          return (
            <Card key={listing.listing_id} className="overflow-hidden listing-card h-full flex flex-col">
              <div className="relative h-48 w-full">
                {listing.photos && listing.photos.length > 0 && listing.photos[0].photo_url ? (
                  <img 
                    src={listing.photos[0].photo_url} 
                    alt={listing.title || 'Property image'} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <Home className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-white rounded-full px-3 py-1 text-sm font-medium text-rental-700">
                  ${listing.price}/night
                </div>
              </div>
              <CardContent className="p-4 flex flex-col flex-1">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1 line-clamp-1">{listing.title || 'Property Listing'}</h3>
                  <p className="text-sm text-gray-500 mb-2 line-clamp-1">
                    {location ? (
                      <>
                        {location.street}, {location.city}, {location.state}
                      </>
                    ) : 'Location information unavailable'}
                  </p>
                  <p className="text-sm mb-4 line-clamp-2">{listing.description}</p>
                  <div className="text-sm text-gray-500 flex gap-3 mb-4">
                    {location && location.number_of_rooms !== undefined && (
                      <span>
                        {location.number_of_rooms} 
                        {location.number_of_rooms === 1 ? 'room' : 'rooms'}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2 mt-auto pt-2 border-t">
                  <Link to={`/listings/${listing.listing_id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      View Details
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="px-3 text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => handleUnsaveListing(listing.listing_id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Unsave
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default SavedListingsPage;