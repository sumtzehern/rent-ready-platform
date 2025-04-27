
import { useListing } from "@/contexts/ListingContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const ReportingPage = () => {
  const { listings, getStatsData } = useListing();
  const stats = getStatsData();
  
  // Prepare data for city distribution chart
  const cityData = Object.entries(stats.cityDistribution).map(([city, count]) => ({
    name: city,
    count
  }));
  
  // Prepare data for price range distribution
  const getPriceRanges = () => {
    const ranges = {
      "Under $50": 0,
      "$50-$100": 0,
      "$100-$200": 0,
      "$200-$300": 0,
      "Over $300": 0
    };
    
    listings.forEach(listing => {
      const price = listing.price;
      if (price < 50) ranges["Under $50"]++;
      else if (price < 100) ranges["$50-$100"]++;
      else if (price < 200) ranges["$100-$200"]++;
      else if (price < 300) ranges["$200-$300"]++;
      else ranges["Over $300"]++;
    });
    
    return Object.entries(ranges).map(([range, count]) => ({
      name: range,
      value: count
    }));
  };
  
  const priceRangeData = getPriceRanges();

  // For pie chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // Prepare bedroom distribution data
  const getBedroomDistribution = () => {
    const distribution: Record<string, number> = {};
    
    listings.forEach(listing => {
      const bedrooms = listing.bedrooms.toString();
      distribution[bedrooms] = (distribution[bedrooms] || 0) + 1;
    });
    
    return Object.entries(distribution)
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([bedrooms, count]) => ({
        bedrooms: `${bedrooms} ${Number(bedrooms) === 1 ? 'bed' : 'beds'}`,
        count
      }));
  };
  
  const bedroomData = getBedroomDistribution();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Reporting Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Listings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalListings}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Hosts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalHosts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Average Price</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.averagePrice.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Cities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(stats.cityDistribution).length}</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Listings by City</CardTitle>
            <CardDescription>Distribution of rental properties across cities</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={cityData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#0ea5e9" name="Listings" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Price Range Distribution</CardTitle>
            <CardDescription>Number of listings in each price range</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priceRangeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {priceRangeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Bedroom Distribution</CardTitle>
            <CardDescription>Number of listings by bedroom count</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={bedroomData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="bedrooms" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#14b8a6" name="Listings" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportingPage;
