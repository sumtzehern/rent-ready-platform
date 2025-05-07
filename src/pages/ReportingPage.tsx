import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
const ReportingPage = () => {
  const [totalListings, setTotalListings] = useState(0);
  const [totalHosts, setTotalHosts] = useState(0);
  const [totalGuests, setTotalGuests] = useState(0);
  const [averagePrice, setAveragePrice] = useState(0);
  const [cityData, setCityData] = useState([]);
  const [priceRangeData, setPriceRangeData] = useState([]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  useEffect(() => {
    const fetchData = async () => {
      const [{ count: listingCount }, { count: hostCount }, { count: guestCount }] = await Promise.all([
        supabase.from("listing").select("*", { count: "exact", head: true }),
        supabase.from("hosts").select("f_username", { count: "exact", head: true }),
        supabase.from("guests").select("f_username", { count: "exact", head: true }),
      ]);

      const { data: avgPriceData } = await supabase.rpc("average_listing_price");
      const { data: listings } = await supabase.from("listing").select("price, location_id");
      const { data: locations } = await supabase.from("locations").select("location_id, city");

      setTotalListings(listingCount || 0);
      setTotalHosts(hostCount || 0);
      setTotalGuests(guestCount || 0);
      setAveragePrice(avgPriceData || 0);

      if (listings && listings.length > 0) {
        const validPrices = listings.filter(listing => listing.price != null && !isNaN(listing.price));
        const totalPrice = validPrices.reduce((sum, listing) => sum + Number(listing.price), 0);
        const avgPrice = validPrices.length > 0 ? totalPrice / validPrices.length : 0;
        setAveragePrice(avgPrice);
      } else {
        setAveragePrice(0);
      }

      const cityMap = {};
      listings?.forEach(listing => {
        const city = locations?.find(loc => loc.location_id === listing.location_id)?.city || "Unknown";
        cityMap[city] = (cityMap[city] || 0) + 1;
      });
      setCityData(Object.entries(cityMap).map(([name, count]) => ({ name, count })));

      const ranges = {
        "Under $50": 0,
        "$50-$100": 0,
        "$100-$200": 0,
        "$200-$300": 0,
        "Over $300": 0,
      };
      listings?.forEach(({ price }) => {
        if (price < 50) ranges["Under $50"]++;
        else if (price < 100) ranges["$50-$100"]++;
        else if (price < 200) ranges["$100-$200"]++;
        else if (price < 300) ranges["$200-$300"]++;
        else ranges["Over $300"]++;
      });
      setPriceRangeData(Object.entries(ranges).map(([name, value]) => ({ name, value })));
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reporting Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[{
          title: "Total Listings",
          value: totalListings
        }, {
          title: "Total Hosts",
          value: totalHosts
        }, {
          title: "Total Guests",
          value: totalGuests
        }, {
          title: "Average Price",
          value: `$${averagePrice.toFixed(2)}`
        }].map((card, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{card.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Listings by City</CardTitle>
            <CardDescription>Distribution of rental properties across cities</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cityData}>
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
      </div>
    </div>
  );
};

export default ReportingPage;