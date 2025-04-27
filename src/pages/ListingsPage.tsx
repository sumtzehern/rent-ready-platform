
import { useState } from "react";
import { Link } from "react-router-dom";
import { useListing } from "@/contexts/ListingContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  PlusCircle, 
  Pencil, 
  Trash2,
  Loader2
} from "lucide-react";
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
import { Input } from "@/components/ui/input";

const ListingsPage = () => {
  const { userListings, listings, deleteListing, isLoading } = useListing();
  const { user, checkIsAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [listingToDelete, setListingToDelete] = useState<string | null>(null);
  
  const isAdmin = checkIsAdmin();
  const displayListings = isAdmin ? listings : userListings;
  
  // Filter listings based on search term
  const filteredListings = displayListings.filter(listing => 
    listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteClick = (id: string) => {
    setListingToDelete(id);
  };

  const handleConfirmDelete = async () => {
    if (listingToDelete) {
      try {
        await deleteListing(listingToDelete);
      } catch (error) {
        // Error handling is done in the context
      } finally {
        setListingToDelete(null);
      }
    }
  };

  const handleCancelDelete = () => {
    setListingToDelete(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">
          {isAdmin ? "All Listings" : "My Listings"}
        </h1>
        <Link to="/listings/create">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Listing
          </Button>
        </Link>
      </div>
      
      <div className="max-w-md mb-6">
        <Input
          placeholder="Search listings..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredListings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((listing) => (
            <Card key={listing.id} className="overflow-hidden listing-card h-full">
              <div className="relative h-48 w-full">
                {listing.imageUrl ? (
                  <img 
                    src={listing.imageUrl} 
                    alt={listing.title} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">No image</span>
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-white rounded-full px-3 py-1 text-sm font-medium text-rental-700">
                  ${listing.price}/night
                </div>
              </div>
              <CardContent className="p-4 flex flex-col flex-1">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1 line-clamp-1">{listing.title}</h3>
                  <p className="text-sm text-gray-500 mb-2 line-clamp-1">
                    {listing.address}, {listing.city}, {listing.state}
                  </p>
                  <p className="text-sm mb-4 line-clamp-2">{listing.description}</p>
                  <div className="text-sm text-gray-500 flex gap-3 mb-4">
                    <span>{listing.bedrooms} {listing.bedrooms === 1 ? 'bed' : 'beds'}</span>
                    <span>•</span>
                    <span>{listing.bathrooms} {listing.bathrooms === 1 ? 'bath' : 'baths'}</span>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-auto pt-2 border-t">
                  <Link to={`/listings/${listing.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      View Details
                    </Button>
                  </Link>
                  {(user?.id === listing.hostId || isAdmin) && (
                    <>
                      <Link to={`/listings/edit/${listing.id}`}>
                        <Button variant="ghost" size="sm" className="px-3">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="px-3 text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleDeleteClick(listing.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-md bg-gray-50">
          <h3 className="font-medium text-lg mb-2">No listings found</h3>
          <p className="text-muted-foreground mb-6">
            {searchTerm 
              ? "No listings match your search criteria." 
              : "You haven't created any listings yet."}
          </p>
          <Link to="/listings/create">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Your First Listing
            </Button>
          </Link>
        </div>
      )}
      
      <AlertDialog open={!!listingToDelete} onOpenChange={handleCancelDelete}>
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
              onClick={handleConfirmDelete}
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

export default ListingsPage;
