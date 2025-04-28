
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useListing } from "@/contexts/ListingContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";

const CreateListing = () => {
  const navigate = useNavigate();
  const { createListing, isLoading } = useListing();
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: 0,
    contact_info: "",
    street: "",
    city: "",
    state: "",
    zip_code: "",
    number_of_rooms: 1,
    photo_url: ""
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "price" || name === "number_of_rooms" 
        ? Number(value) 
        : value
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Format the data to match the Supabase schema
      const listingData = {
        title: formData.title,
        description: formData.description,
        price: formData.price,
        contact_info: formData.contact_info,
        host_username: '', // This will be set by the service using the current user
        location_id: 0 // This will be set by the service
      };
      
      // Create a separate location object
      const locationData = {
        zip_code: formData.zip_code,
        city: formData.city,
        state: formData.state,
        street: formData.street,
        number_of_rooms: formData.number_of_rooms
      };
      
      // Create a separate photos array
      const photos = formData.photo_url ? [
        {
          photo_url: formData.photo_url,
          f_listing_id: 0 // This will be set by the service
        }
      ] : [];
      
      // Pass the listing data with location and photos to the context
      await createListing({
        ...listingData,
        location: locationData,
        photos: photos
      });
      navigate("/listings");
    } catch (error) {
      // Error is handled in the context
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/listings">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Add New Listing</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Property Details</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Enter listing title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe your property"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={4}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price per Night ($)</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="photo_url">Image URL</Label>
                  <Input
                    id="photo_url"
                    name="photo_url"
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={formData.photo_url}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="street">Street Address</Label>
                <Input
                  id="street"
                  name="street"
                  placeholder="123 Main St"
                  value={formData.street}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    placeholder="City"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    name="state"
                    placeholder="State"
                    value={formData.state}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="zip_code">ZIP Code</Label>
                  <Input
                    id="zip_code"
                    name="zip_code"
                    placeholder="ZIP Code"
                    value={formData.zip_code}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="number_of_rooms">Number of Rooms</Label>
                  <Input
                    id="number_of_rooms"
                    name="number_of_rooms"
                    type="number"
                    min="0"
                    value={formData.number_of_rooms}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contact_info">Contact Information</Label>
                  <Input
                    id="contact_info"
                    name="contact_info"
                    placeholder="Phone or email for inquiries"
                    value={formData.contact_info}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => navigate("/listings")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Listing
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default CreateListing;
