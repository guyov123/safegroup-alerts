
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Clock, MapPin, Filter, Search, AlertTriangle, Info, Check, ShieldAlert, ShieldCheck, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Define TypeScript interfaces for our data
interface AlertUser {
  name: string;
  image: string;
}

interface Alert {
  id: string;
  type: "emergency" | "safe" | "reminder";
  user: AlertUser;
  group: string;
  location: string;
  time: string;
  date: string;
  status: "active" | "resolved";
}

const Alerts = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setIsLoading(true);
        
        // Check if user is authenticated
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setIsLoading(false);
          return;
        }
        
        // Fetch groups that belong to the current user
        const { data: userGroups, error: groupsError } = await supabase
          .from('groups')
          .select('id, name')
          .eq('owner_id', user.id);
          
        if (groupsError) {
          console.error("Error fetching groups:", groupsError);
          toast.error("שגיאה בטעינת הקבוצות");
          setIsLoading(false);
          return;
        }
        
        // If we have groups, we could fetch alerts associated with them
        // This is where you would normally fetch alerts from your database
        // For now, we'll just set an empty array since there is no alerts table yet
        
        setAlerts([]);
        setIsLoading(false);
      } catch (error) {
        console.error("Error:", error);
        toast.error("שגיאה בטעינת הנתונים");
        setIsLoading(false);
      }
    };
    
    fetchAlerts();
  }, []);
  
  // Filter alerts by search query
  const filteredAlerts = alerts.filter(alert => 
    alert.user.name.includes(searchQuery) || 
    alert.group.includes(searchQuery) ||
    alert.location.includes(searchQuery)
  );
  
  return (
    <div className="container max-w-5xl px-4 py-6 md:py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 text-right">התראות</h1>
        <p className="text-muted-foreground text-right">רשימת ההתראות והעדכונים מחברי הקבוצות שלך</p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="חפש התראות..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10 text-right"
            dir="rtl"
          />
        </div>
        
        <Button variant="outline" className="w-full md:w-auto">
          <Filter className="mr-2 h-4 w-4" />
          סנן
        </Button>
      </div>
      
      <Tabs defaultValue="all" className="w-full mb-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">הכל</TabsTrigger>
          <TabsTrigger value="active">פעילות</TabsTrigger>
          <TabsTrigger value="resolved">נפתרו</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          {isLoading ? (
            <LoadingState />
          ) : (
            <AlertsList alerts={filteredAlerts} />
          )}
        </TabsContent>
        <TabsContent value="active">
          {isLoading ? (
            <LoadingState />
          ) : (
            <AlertsList alerts={filteredAlerts.filter(alert => alert.status === "active")} />
          )}
        </TabsContent>
        <TabsContent value="resolved">
          {isLoading ? (
            <LoadingState />
          ) : (
            <AlertsList alerts={filteredAlerts.filter(alert => alert.status === "resolved")} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Loading State Component
const LoadingState = () => (
  <div className="flex justify-center items-center p-10">
    <Loader2 className="h-8 w-8 animate-spin mr-2" />
    <span>טוען התראות...</span>
  </div>
);

// Alert List Component
const AlertsList = ({ alerts }) => {
  if (alerts.length === 0) {
    return (
      <div className="text-center py-12">
        <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-medium mb-1">אין התראות</h3>
        <p className="text-muted-foreground">לא נמצאו התראות התואמות את החיפוש שלך</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {alerts.map(alert => (
        <Card key={alert.id} className={cn(
          "transition-all",
          alert.status === "active" ? "border-l-4 border-l-red-500" : ""
        )}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-shrink-0 mt-1">
                <AlertIcon type={alert.type} />
              </div>
              
              <div className="flex-1 text-right">
                <div className="flex items-center justify-end gap-2 mb-1">
                  <Badge variant={alert.status === "active" ? "destructive" : "outline"}>
                    {alert.status === "active" ? "פעיל" : "נפתר"}
                  </Badge>
                  <Badge variant="secondary">{alert.group}</Badge>
                </div>
                
                <div className="flex items-center justify-end gap-3 mb-3">
                  <div>
                    <div className="font-medium">{alert.user.name}</div>
                    <div className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                      <span>{alert.date} ,{alert.time}</span>
                      <Clock className="h-3 w-3" />
                    </div>
                  </div>
                  <Avatar>
                    <AvatarImage src={alert.user.image} alt={alert.user.name} />
                    <AvatarFallback>{alert.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </div>
                
                {alert.location && (
                  <div className="text-sm flex items-center justify-end gap-1 text-muted-foreground">
                    <span>{alert.location}</span>
                    <MapPin className="h-4 w-4" />
                  </div>
                )}
                
                {alert.type === "emergency" && alert.status === "active" && (
                  <div className="mt-4 flex justify-end gap-2">
                    <Button size="sm">מסומן כבטוח</Button>
                    <Button size="sm" variant="outline">
                      התקשר
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Alert Icon Component
const AlertIcon = ({ type }) => {
  switch (type) {
    case "emergency":
      return <ShieldAlert className="h-8 w-8 text-red-500" />;
    case "safe":
      return <ShieldCheck className="h-8 w-8 text-green-500" />;
    case "reminder":
      return <Info className="h-8 w-8 text-blue-500" />;
    default:
      return <Bell className="h-8 w-8 text-amber-500" />;
  }
};

export default Alerts;
