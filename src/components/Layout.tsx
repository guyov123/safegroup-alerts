
import { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { Home, Users, Bell, Map, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Layout = () => {
  const [open, setOpen] = useState(false);
  
  const links = [
    { to: "/", label: "ראשי", icon: Home },
    { to: "/groups", label: "קבוצות", icon: Users },
    { to: "/alerts", label: "התראות", icon: Bell },
    { to: "/map", label: "מפה", icon: Map },
  ];

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
                      <AvatarImage src="" alt="User" />
                      <AvatarFallback>IG</AvatarFallback>
                    </Avatar>
                    <div className="grid gap-0.5">
                      <h2 className="text-base font-medium">ישראל ישראלי</h2>
                      <p className="text-xs text-muted-foreground">israel@example.com</p>
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
                </div>
              </SheetContent>
            </Sheet>
          </div>
          <div className="font-medium text-lg">SafeGroup</div>
          <Avatar className="h-8 w-8">
            <AvatarImage src="" alt="User" />
            <AvatarFallback>IG</AvatarFallback>
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
                <AvatarImage src="" alt="User" />
                <AvatarFallback>IG</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">ישראל ישראלי</div>
                <div className="text-xs text-muted-foreground">israel@example.com</div>
              </div>
            </div>
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
