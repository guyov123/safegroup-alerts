
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Users, Layers, ZoomIn, ZoomOut, UserCheck, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MapUser {
  id: string;
  name: string;
  status: "safe" | "unknown";
  time?: string;
  location?: string;
  group: string;
  image: string;
}

const MapView = () => {
  const [selectedUser, setSelectedUser] = useState<MapUser | null>(null);
  const [mapUsers, setMapUsers] = useState<MapUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  useEffect(() => {
    const fetchGroupMembers = async () => {
      try {
        setIsLoading(true);
        
        // Check if user is authenticated
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setIsLoading(false);
          return;
        }
        
        // Fetch groups that belong to the current user
        const { data: groups, error: groupsError } = await supabase
          .from('groups')
          .select('id, name')
          .eq('owner_id', user.id);
          
        if (groupsError) {
          console.error("Error fetching groups:", groupsError);
          toast.error("שגיאה בטעינת הקבוצות");
          setIsLoading(false);
          return;
        }
        
        if (!groups || groups.length === 0) {
          setMapUsers([]);
          setIsLoading(false);
          return;
        }
        
        // Fetch all members from the user's groups
        const groupIds = groups.map(group => group.id);
        
        const { data: members, error: membersError } = await supabase
          .from('group_members')
          .select('*, groups!inner(name)')
          .in('group_id', groupIds);
          
        if (membersError) {
          console.error("Error fetching group members:", membersError);
          toast.error("שגיאה בטעינת חברי הקבוצה");
          setIsLoading(false);
          return;
        }
        
        // Transform the data to match the MapUser interface
        const formattedMembers = members.map(member => ({
          id: member.id,
          name: member.name || member.email,
          status: "safe" as "safe" | "unknown",
          time: "",
          location: "",
          group: member.groups.name,
          image: ""
        }));
        
        setMapUsers(formattedMembers);
        setIsLoading(false);
      } catch (error) {
        console.error("Error:", error);
        toast.error("שגיאה בטעינת הנתונים");
        setIsLoading(false);
      }
    };
    
    fetchGroupMembers();
  }, []);
  
  // Filter users based on search query
  const filteredUsers = searchQuery 
    ? mapUsers.filter(user => 
        user.name.includes(searchQuery) || 
        user.group.includes(searchQuery) ||
        (user.location && user.location.includes(searchQuery))
      )
    : mapUsers;
  
  return (
    <div className="h-screen relative">
      {/* Mock Map - Replace with actual map component */}
      <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <MapPin className="h-12 w-12 mx-auto mb-2" />
          <p className="text-lg font-medium">הצגת מפה</p>
          <p>(מידע המפה יוצג כאן)</p>
        </div>
      </div>
      
      {/* Map Controls */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
        <Button variant="secondary" size="icon" className="shadow-md">
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="secondary" size="icon" className="shadow-md">
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button variant="secondary" size="icon" className="shadow-md">
          <Layers className="h-4 w-4" />
        </Button>
      </div>
      
      {/* User Card - Shows when user is selected */}
      {selectedUser && (
        <div className="absolute bottom-20 right-4 left-4 md:left-auto md:right-4 md:w-80 z-20">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6" 
                  onClick={() => setSelectedUser(null)}
                >
                  ×
                </Button>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <CardTitle>{selectedUser.name}</CardTitle>
                    <CardDescription>{selectedUser.group}</CardDescription>
                  </div>
                  <Avatar>
                    <AvatarImage src={selectedUser.image} alt={selectedUser.name} />
                    <AvatarFallback>{selectedUser.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-right">
                {selectedUser.location && (
                  <div className="flex items-center justify-end gap-2">
                    <div className="text-sm">{selectedUser.location}</div>
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
                {selectedUser.status === "safe" && selectedUser.time && (
                  <div className="flex items-center justify-end gap-2">
                    <div className="text-sm flex items-center">
                      <span>{selectedUser.time}</span>
                    </div>
                    <Badge variant="outline" className="flex items-center gap-1 bg-green-100">
                      <Clock className="h-3 w-3" />
                      דיווח אחרון
                    </Badge>
                  </div>
                )}
                
                <div className="flex justify-end gap-2 mt-4">
                  <Button size="sm" className="flex items-center gap-1">
                    <UserCheck className="h-4 w-4" />
                    שלח הודעה
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Users List */}
      <div className="absolute top-4 right-4 z-10 w-80 bg-white rounded-md shadow-md">
        <div className="p-3 border-b">
          <h2 className="font-medium text-right mb-2">חברי קבוצה על המפה</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="חיפוש לפי שם..."
              className="w-full rounded-md border border-input px-3 py-1 text-sm bg-background pl-10 text-right"
              dir="rtl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="max-h-60 overflow-y-auto p-2">
          {isLoading ? (
            <div className="p-4 text-center">
              <p className="text-muted-foreground">טוען נתונים...</p>
            </div>
          ) : filteredUsers.length > 0 ? (
            filteredUsers.map(user => (
              <div 
                key={user.id} 
                className="p-2 hover:bg-accent rounded-md cursor-pointer transition-colors"
                onClick={() => setSelectedUser(user)}
              >
                <div className="flex items-center justify-between">
                  <Badge 
                    variant="outline" 
                    className={user.status === "safe" ? "bg-green-100" : "bg-amber-100"}
                  >
                    {user.status === "safe" ? "בטוח" : "לא ידוע"}
                  </Badge>
                  
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="font-medium text-sm">{user.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                        <span>{user.group}</span>
                        <Users className="h-3 w-3" />
                      </div>
                    </div>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.image} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center">
              <p className="text-muted-foreground">אין חברי קבוצה זמינים</p>
              <p className="text-xs text-muted-foreground mt-1">נא להוסיף קבוצות וחברים בדף הקבוצות</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapView;
