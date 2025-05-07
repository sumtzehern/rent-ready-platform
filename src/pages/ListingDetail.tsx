
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useListing, Listing } from "@/contexts/ListingContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Loader2, ArrowLeft, Pencil, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const ListingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { getListing, deleteListing, isLoading: contextLoading } = useListing();
  const { user, checkIsAdmin } = useAuth();
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [listing, setListing] = useState<Listing | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  const isAdmin = checkIsAdmin();
  const canEdit = listing && (user?.username === listing.host_username || isAdmin);
  
  // Fetch listing data when component mounts
  useEffect(() => {
    const fetchListingData = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const listingData = await getListing(parseInt(id));
        setListing(listingData);
      } catch (error) {
        console.error("Error fetching listing:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchListingData();
  }, [id, getListing]);

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      await deleteListing(parseInt(id));
      navigate("/listings");
    } catch (error) {
      // Error is handled in the context
    }
  };

  if (isLoading || contextLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="text-center py-12 border rounded-md bg-gray-50">
        <h3 className="font-medium text-lg mb-2">Listing not found</h3>
        <p className="text-muted-foreground mb-6">
          The listing you're looking for doesn't exist or has been removed.
        </p>
        <Link to="/listings">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Listings
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/listings">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">{listing.title || 'Property Listing'}</h1>
        </div>
        {canEdit && (
          <div className="flex space-x-2">
            <Link to={`/listings/edit/${listing.listing_id}`}>
              <Button variant="outline">
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </Link>
            <Button 
              variant="outline" 
              className="text-red-500 hover:text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="aspect-video w-full overflow-hidden">
              {listing.photos && listing.photos.length > 0 ? (
                <img 
                  src={listing.photos[0].photo_url} 
                  alt={listing.title || 'Property'} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">No image available</span>
                </div>
              )}
            </div>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">About this listing</h2>
              <p className="text-gray-700 mb-6">{listing.description}</p>
              
              <div className="grid grid-cols-2 gap-4 border-t pt-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Rooms</h3>
                  <p className="text-lg">{listing.location?.number_of_rooms || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Contact</h3>
                  <p className="text-lg">{listing.contact_info || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Location</h2>
              <div className="space-y-2">
                {listing.location ? (
                  <>
                    <p className="text-gray-700">{listing.location.street}</p>
                    <p className="text-gray-700">{listing.location.city}, {listing.location.state} {listing.location.zip_code}</p>
                  </>
                ) : (
                  <p className="text-gray-700">Location information unavailable</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="text-2xl font-bold">${listing.price}</div>
                <div className="text-sm text-gray-500">per night</div>
              </div>
              
              <div className="border-t border-b py-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span>Listing ID</span>
                  <span>{listing.listing_id}</span>
                </div>
              </div>
              
              <div className="text-sm text-gray-500 mb-6">
                <div className="mb-1">Property ID: {listing.listing_id}</div>
                <div>Host: {listing.host_username}</div>
              </div>
            </CardContent>
            <CardFooter className="px-6 pb-6 pt-0">
              <Button className="w-full" disabled>
                Book Now
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              listing and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ListingDetail;
