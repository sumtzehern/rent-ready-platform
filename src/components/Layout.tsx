import { useState } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Home,
  List,
  PlusCircle,
  LogOut,
  User,
  Menu,
  X,
  BarChart3,
  Shield,
  MessageSquare,
  Bookmark
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ListingProvider } from "@/contexts/ListingContext";

const Layout = () => {
  const { user, logout, checkIsAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const isAdmin = checkIsAdmin();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  interface MenuItem {
    name: string;
    path: string;
    icon: JSX.Element;
    modes: ReadonlyArray<UserRole>; 
  }

  const menuItems: MenuItem[] = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <Home className="mr-2 h-4 w-4" />,
      modes: ['guest', 'host', 'admin'] 
    },
    {
      name: "Saved Listings",
      path: "/saved-listings",
      icon: <Bookmark className="mr-2 h-4 w-4" />,
      modes: ['guest']
    },
    {
      name: "My Listings",
      path: "/listings", 
      icon: <List className="mr-2 h-4 w-4" />,
      modes: ['host'] 
    },
    {
      name: "Add Listing",
      path: "/listings/create",
      icon: <PlusCircle className="mr-2 h-4 w-4" />,
      modes: ['host'] 
    },
    {
      name: "All Listings",
      path: "/listings/all", 
      icon: <List className="mr-2 h-4 w-4" />,
      modes: ['guest', 'host', 'admin'] 
    },
    {
      name: "Reports",
      path: "/reports",
      icon: <BarChart3 className="mr-2 h-4 w-4" />,
      modes: ['host', 'admin'] 
    },
    {
      name: "Messages",
      path: "/messages",
      icon: <MessageSquare className="mr-2 h-4 w-4" />,
      modes: ['guest', 'host', 'admin'] 
    },
    {
      name: "Profile",
      path: "/profile",
      icon: <User className="mr-2 h-4 w-4" />,
      modes: ['guest', 'host', 'admin'] 
    }
  ];

  const currentUserMode = user?.mode || 'guest'; 
  const accessibleMenuItems = menuItems.filter(item => 
    (item.modes as UserRole[]).includes(currentUserMode) 
  );

  if (isAdmin) {
    accessibleMenuItems.push({
      name: "Admin Dashboard",
      path: "/admin",
      icon: <Shield className="mr-2 h-4 w-4" />,
      modes: ['admin'] 
    });
  }

  return (
    <ListingProvider>
      <div className="flex min-h-screen bg-gray-50">
        <button
          className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? (
            <X className="h-6 w-6 text-gray-600" />
          ) : (
            <Menu className="h-6 w-6 text-gray-600" />
          )}
        </button>

        <div
          className={cn(
            "fixed inset-y-0 left-0 z-40 w-64 transform bg-white shadow-lg transition-transform duration-200 ease-in-out lg:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex flex-col h-full">
            <div className="p-4 border-b">
              <Link to="/" className="block">
                <h1 className="text-xl font-bold text-rental-600">RentReady</h1>
              </Link>
            </div>
            
            <div className="p-4 border-b">
              <div className="flex items-center space-x-3">
                <div className="h-9 w-9 rounded-full bg-rental-100 flex items-center justify-center text-rental-700 font-medium">
                  {user?.username ? user.username.charAt(0).toUpperCase() : '?'}
                </div>
                <div>
                  <p className="font-medium">{user?.username || 'User'}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.mode || 'guest'}</p>
                </div>
              </div>
            </div>
            
            <nav className="flex-grow p-4 space-y-1 overflow-y-auto">
              {accessibleMenuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    location.pathname === item.path
                      ? "bg-rental-100 text-rental-700"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  {item.icon}
                  {item.name}
                </Link>
              ))}
            </nav>
            
            <div className="p-4 border-t mt-auto">
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center" 
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        <div className={cn(
          "flex-1 transition-all duration-200 ease-in-out",
          sidebarOpen ? "lg:ml-64" : "ml-0"
        )}>
          <div className="p-6 md:p-8">
            <Outlet />
          </div>
        </div>
      </div>
    </ListingProvider>
  );
};

export default Layout;
