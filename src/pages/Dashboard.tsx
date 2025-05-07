
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useListing } from "@/contexts/ListingContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Home, List as ListIcon, User, BarChart3 } from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const { userListings, listings, getStatsData } = useListing();
  const [stats, setStats] = useState({
    totalListings: 0,
    totalHosts: 0,
    averagePrice: 0,
    cityDistribution: {} as Record<string, number>
  });
  
  useEffect(() => {
    const loadStats = async () => {
      const statsData = await getStatsData();
      setStats(statsData);
    };
    
    loadStats();
  }, [getStatsData]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Your Listings
            </CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userListings.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Listings
            </CardTitle>
            <ListIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{listings.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Hosts
            </CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalHosts}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. Price
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
          <div className="text-2xl font-bold">${stats.averagePrice ? stats.averagePrice.toFixed(2) : '0.00'}</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Your Listings */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Your Listings</CardTitle>
            <CardDescription>
              Manage your property listings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {userListings.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <p>You haven't added any listings yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {userListings.slice(0, 3).map(listing => (
                  <div key={listing.listing_id} className="flex items-center gap-3 border rounded-md p-3">
                    <div className="h-12 w-12 rounded bg-gray-100 overflow-hidden">
                      {listing.photos && listing.photos.length > 0 ? (
                        <img src={listing.photos[0].photo_url} alt={listing.description} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                          <Home className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{listing.description.substring(0, 30)}...</h4>
                      <p className="text-sm text-muted-foreground">
                        {listing.location ? `${listing.location.city}, ${listing.location.state}` : 'Location not available'}
                      </p>
                    </div>
                    <div className="font-medium">${listing.price}</div>
                    <Link to={`/listings/${listing.listing_id}`} className="text-sm text-blue-500 hover:underline">
                      View
                    </Link>
                  </div>
                ))}
                
                {userListings.length > 3 && (
                  <div className="text-center text-sm">
                    <Link to="/listings" className="text-primary hover:underline">
                      View all {userListings.length} listings
                    </Link>
                  </div>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Link to="/listings/create" className="w-full">
              <Button className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Listing
              </Button>
            </Link>
          </CardFooter>
        </Card>
        
        {/* Quick Stats */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Property Insights</CardTitle>
            <CardDescription>
              Distribution of properties by city
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(stats.cityDistribution).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(stats.cityDistribution).map(([city, count]) => (
                  <div key={city} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>{city}</span>
                      <span className="font-medium">{count} listings</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-rental-500 h-2.5 rounded-full" 
                        style={{ width: `${listings.length > 0 ? (count / listings.length) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <p>No data available yet.</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Link to="/reports" className="w-full">
              <Button variant="outline" className="w-full">
                View Full Reports
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
