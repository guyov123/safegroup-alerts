
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Users, Layers, ZoomIn, ZoomOut, UserCheck, Search, Compass, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Geolocation } from '@capacitor/geolocation';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useMapboxToken } from "@/hooks/useMapboxToken";

interface MapUser {
  id: string;
  name: string;
  status: "safe" | "unknown";
  time?: string;
  location?: string;
  group: string;
  image: string;
}

interface GeolocationPosition {
  coords: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  }
}

const MapView = () => {
  const [selectedUser, setSelectedUser] = useState<MapUser | null>(null);
  const [mapUsers, setMapUsers] = useState<MapUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPosition, setCurrentPosition] = useState<GeolocationPosition | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocationPermissionGranted, setIsLocationPermissionGranted] = useState(false);
  
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const userMarker = useRef<mapboxgl.Marker | null>(null);
  const mapboxToken = useMapboxToken();
  
  // Request location permission and get current position
  useEffect(() => {
    const requestLocationPermission = async () => {
      try {
        // Request permissions
        const permissionStatus = await Geolocation.requestPermissions();
        
        if (permissionStatus.location === 'granted') {
          setIsLocationPermissionGranted(true);
          
          // Get current position
          const position = await Geolocation.getCurrentPosition({
            enableHighAccuracy: true,
            timeout: 30000,
          });
          
          setCurrentPosition(position);
          toast.success("המיקום נמצא בהצלחה");
        } else {
          setLocationError("לא ניתנה הרשאה למיקום");
          toast.error("לא ניתנה הרשאה למיקום");
        }
      } catch (error) {
        console.error("Error getting location:", error);
        setLocationError("שגיאה בקבלת המיקום");
        toast.error("שגיאה בקבלת המיקום");
      }
    };
    
    requestLocationPermission();
    
    // Setup watchPosition to track location changes
    let watchId: string;
    
    const setupWatchPosition = async () => {
      try {
        watchId = await Geolocation.watchPosition(
          { enableHighAccuracy: true, timeout: 30000 },
          (position) => {
            setCurrentPosition(position);
            
            // Update marker position if map and marker exist
            if (map.current && userMarker.current && position) {
              const { latitude, longitude } = position.coords;
              userMarker.current.setLngLat([longitude, latitude]);
            }
          }
        );
      } catch (error) {
        console.error("Error watching position:", error);
      }
    };
    
    setupWatchPosition();
    
    // Cleanup watch position
    return () => {
      if (watchId) {
        Geolocation.clearWatch({ id: watchId });
      }
    };
  }, []);
  
  // Initialize map when position is available and token exists
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || map.current) return;
    
    // Initialize mapbox map
    mapboxgl.accessToken = mapboxToken;
    
    const initialPosition = currentPosition 
      ? [currentPosition.coords.longitude, currentPosition.coords.latitude]
      : [34.855499, 31.046051]; // Default to Israel if location not available
      
    const newMap = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: initialPosition as [number, number],
      zoom: currentPosition ? 15 : 8
    });
    
    map.current = newMap;
    
    // Add navigation controls
    newMap.addControl(
      new mapboxgl.NavigationControl(),
      'top-left'
    );
    
    // Add scale
    newMap.addControl(
      new mapboxgl.ScaleControl(),
      'bottom-left'
    );
    
    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [mapContainer, mapboxToken]);
  
  // Add/update user location marker when position changes
  useEffect(() => {
    if (!map.current || !currentPosition) return;
    
    const { latitude, longitude } = currentPosition.coords;
    
    // Create or update user marker
    if (!userMarker.current) {
      // Create a custom marker element
      const markerElement = document.createElement('div');
      markerElement.className = 'user-location-marker';
      markerElement.style.width = '20px';
      markerElement.style.height = '20px';
      markerElement.style.borderRadius = '50%';
      markerElement.style.backgroundColor = '#4A66F8';
      markerElement.style.border = '2px solid white';
      markerElement.style.boxShadow = '0 0 0 2px rgba(74, 102, 248, 0.3)';
      
      // Create the marker
      userMarker.current = new mapboxgl.Marker({
        element: markerElement,
        anchor: 'center'
      })
      .setLngLat([longitude, latitude])
      .addTo(map.current);
      
      // Fly to user position
      map.current.flyTo({
        center: [longitude, latitude],
        zoom: 15,
        essential: true
      });
    } else {
      // Update existing marker position
      userMarker.current.setLngLat([longitude, latitude]);
    }
  }, [currentPosition, map.current]);
  
  // Fetch group members
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
  
  // Pan to user location
  const handlePanToUserLocation = () => {
    if (!map.current || !currentPosition) {
      toast.error("מיקום המשתמש אינו זמין");
      return;
    }
    
    const { longitude, latitude } = currentPosition.coords;
    
    map.current.flyTo({
      center: [longitude, latitude],
      zoom: 15,
      essential: true
    });
  };
  
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
      {/* Real Map Container */}
      <div 
        ref={mapContainer} 
        className="absolute inset-0 bg-gray-200"
      />
      
      {/* Map Controls */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
        <Button 
          variant="secondary" 
          size="icon" 
          className="shadow-md"
          onClick={() => map.current?.zoomIn()}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button 
          variant="secondary" 
          size="icon" 
          className="shadow-md"
          onClick={() => map.current?.zoomOut()}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button 
          variant="secondary" 
          size="icon" 
          className="shadow-md"
          onClick={handlePanToUserLocation}
        >
          <Compass className="h-4 w-4" />
        </Button>
        <Button 
          variant="secondary" 
          size="icon" 
          className="shadow-md"
        >
          <Layers className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Location Error Message */}
      {locationError && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded flex items-center gap-2 shadow-md">
            <AlertTriangle className="h-4 w-4" />
            <span>{locationError}</span>
          </div>
        </div>
      )}
      
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
