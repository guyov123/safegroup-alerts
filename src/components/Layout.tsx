
import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { Home, Users, Bell, Map, Menu, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Layout = () => {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Get the current authenticated user
        const { data: { user: authUser } } = await supabase.auth.getUser();
        
        if (authUser) {
          // Get user metadata
          const fullName = authUser.user_metadata?.full_name || '';
          const email = authUser.email || '';
          
          setUser({
            fullName: fullName,
            email: email
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session && session.user) {
          const fullName = session.user.user_metadata?.full_name || '';
          const email = session.user.email || '';
          
          setUser({
            fullName: fullName,
            email: email
          });
        } else {
          setUser(null);
          navigate("/login");
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);
  
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      toast.success("התנתקת בהצלחה");
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("שגיאה בהתנתקות");
    }
  };
  
  const links = [
    { to: "/", label: "ראשי", icon: Home },
    { to: "/groups", label: "קבוצות", icon: Users },
    { to: "/alerts", label: "התראות", icon: Bell },
    { to: "/map", label: "מפה", icon: Map },
  ];

  // Generate avatar fallback from name
  const getAvatarFallback = () => {
    if (!user || !user.fullName) return "U";
    
    const nameParts = user.fullName.split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return user.fullName[0].toUpperCase();
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header for mobile */}
      <header className="sticky top-0 z-30 w-full border-b bg-background lg:hidden">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 p-0">
                <div className="grid gap-2 px-2 py-4">
                  <div className="flex items-center gap-2 p-2">
                    <Avatar>
                      <AvatarImage src="" alt={user?.fullName || 'User'} />
                      <AvatarFallback>{loading ? '...' : getAvatarFallback()}</AvatarFallback>
                    </Avatar>
                    <div className="grid gap-0.5">
                      <h2 className="text-base font-medium">{loading ? 'טוען...' : user?.fullName}</h2>
                      <p className="text-xs text-muted-foreground">{loading ? '' : user?.email}</p>
                    </div>
                  </div>
                  <div className="border-t my-2" />
                  <nav className="grid gap-1">
                    {links.map((link) => (
                      <NavLink
                        key={link.to}
                        to={link.to}
                        className={({ isActive }) =>
                          cn(
                            "flex items-center gap-2 p-2 text-base font-medium rounded-md hover:bg-accent hover:text-accent-foreground",
                            isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                          )
                        }
                        onClick={() => setOpen(false)}
                      >
                        <link.icon className="h-5 w-5" />
                        {link.label}
                      </NavLink>
                    ))}
                  </nav>
                  <Button 
                    variant="outline" 
                    className="mt-2 w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    התנתק
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
          <div className="font-medium text-lg">SafeGroup</div>
          <Avatar className="h-8 w-8">
            <AvatarImage src="" alt={user?.fullName || 'User'} />
            <AvatarFallback>{loading ? '...' : getAvatarFallback()}</AvatarFallback>
          </Avatar>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:right-0 lg:z-40 lg:flex lg:w-72 lg:flex-col">
        <div className="flex h-full flex-col border-l border-l-border bg-background">
          <div className="flex h-14 items-center px-4 py-2 gap-2 border-b">
            <div className="font-semibold text-xl">SafeGroup</div>
          </div>
          <div className="flex flex-1 flex-col py-4">
            <nav className="grid gap-1 px-2">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2 p-2 text-base font-medium rounded-md hover:bg-accent hover:text-accent-foreground",
                      isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                    )
                  }
                >
                  <link.icon className="h-5 w-5" />
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="border-t border-t-border p-4">
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarImage src="" alt={user?.fullName || 'User'} />
                <AvatarFallback>{loading ? '...' : getAvatarFallback()}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{loading ? 'טוען...' : user?.fullName}</div>
                <div className="text-xs text-muted-foreground">{loading ? '' : user?.email}</div>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="mt-4 w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="ml-2 h-4 w-4" />
              התנתק
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 lg:pr-72">
        <div className="min-h-screen">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
