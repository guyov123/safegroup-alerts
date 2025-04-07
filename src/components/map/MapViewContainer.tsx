
import React, { useState, useEffect } from "react";
import { MapUser } from "@/components/map/types";
import mapboxgl from 'mapbox-gl';
import MapComponent from "@/components/map/MapComponent";
import MapControls from "@/components/map/MapControls";
import LocationErrorMessage from "@/components/map/LocationErrorMessage";
import UserCard from "@/components/map/UserCard";
import UsersList from "@/components/map/users-list/UsersList";
import { useMapboxToken } from "@/hooks/useMapboxToken";
import { useLocation } from "@/hooks/useLocation";
import { useMapUsers } from "@/hooks/useMapUsers";
import RealtimeIndicator from "@/components/map/RealtimeIndicator";
import NoUsersWithLocationWarning from "@/components/map/warnings/NoUsersWithLocationWarning";
import NoGroupsWarning from "@/components/map/warnings/NoGroupsWarning";
import MarkerManager from "@/components/map/MarkerManager";
import { toast } from "sonner";

const MapViewContainer = () => {
  const [selectedUser, setSelectedUser] = useState<MapUser | null>(null);
  const [mapInstance, setMapInstance] = useState<mapboxgl.Map | null>(null);
  const [realtimeIndicator, setRealtimeIndicator] = useState<"connected" | "disconnected" | "connecting">("connecting");
  const realtimeStatusNotifiedRef = React.useRef<{[key: string]: boolean}>({});
  
  // Custom hooks
  const { currentPosition, locationError } = useLocation();
  const { mapUsers, isLoading, error } = useMapUsers(
    currentPosition ? 
    { 
      latitude: currentPosition.coords.latitude, 
      longitude: currentPosition.coords.longitude 
    } : null,
    (status) => {
      if (status === 'SUBSCRIBED') {
        setRealtimeIndicator("connected");
        
        // Only show the toast once per session for this status
        if (!realtimeStatusNotifiedRef.current['connected']) {
          toast.success("מחובר לעדכונים בזמן אמת", { 
            id: "realtime-connected",
            duration: 3000 // Only show for 3 seconds
          });
          realtimeStatusNotifiedRef.current['connected'] = true;
        }
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        setRealtimeIndicator("disconnected");
        
        // Only show the toast once per session for this status
        if (!realtimeStatusNotifiedRef.current['disconnected']) {
          toast.error("נותק מעדכונים בזמן אמת", { 
            id: "realtime-disconnected",
            duration: 3000
          });
          realtimeStatusNotifiedRef.current['disconnected'] = true;
        }
      }
    }
  );

  const mapboxToken = useMapboxToken();
  
  // Debug information
  useEffect(() => {
    if (mapUsers && mapUsers.length > 0) {
      console.log("MapUsers loaded:", mapUsers.length, "users");
      const usersWithLocation = mapUsers.filter(user => user.latitude && user.longitude).length;
      console.log(`Users with location data: ${usersWithLocation} of ${mapUsers.length}`);
      
      // Log each user's data for debugging
      mapUsers.forEach(user => {
        console.log(`User ${user.name} data:`, {
          id: user.id,
          hasLocation: Boolean(user.latitude && user.longitude),
          status: user.status,
          coords: user.latitude && user.longitude ? `${user.latitude}, ${user.longitude}` : 'No location'
        });
      });
    }
  }, [mapUsers]);
  
  // Function to center the map on a user
  const centerOnUser = (user: MapUser) => {
    if (mapInstance && user.latitude && user.longitude) {
      console.log(`Centering on ${user.name} at ${user.latitude}, ${user.longitude}`);
      mapInstance.flyTo({
        center: [user.longitude, user.latitude],
        zoom: 15,
        essential: true
      });
      
      // Show toast confirmation with limited duration
      toast.success(`מתמקד במיקום של ${user.name}`, {
        duration: 3000 // 3 seconds
      });
    } else if (user.status === "safe" && (!user.latitude || !user.longitude)) {
      // Handle the case where a user is marked as safe but has no location data
      toast.info(`${user.name} סימן/ה שהוא/היא בטוח/ה, אך אין נתוני מיקום`, {
        duration: 3000 // 3 seconds
      });
    }
  };
  
  // If we have data loading errors, show them
  useEffect(() => {
    if (error) {
      toast.error(`שגיאה בטעינת הנתונים: ${error}`, {
        duration: 5000 // 5 seconds
      });
    }
  }, [error]);
  
  function handleMapInit(map: mapboxgl.Map) {
    console.log("Map initialized");
    setMapInstance(map);
  }
  
  // Check if there are any groups/members
  const hasGroups = mapUsers && mapUsers.length > 0;
  const hasUsersWithLocation = mapUsers && mapUsers.some(user => user.latitude && user.longitude);
  
  return (
    <div className="h-screen relative">
      <MapComponent 
        mapboxToken={mapboxToken} 
        currentPosition={currentPosition}
        onMapInit={handleMapInit}
      />
      
      <MapControls 
        map={mapInstance}
        currentPosition={currentPosition}
      />
      
      <LocationErrorMessage error={locationError} />
      
      <UserCard 
        user={selectedUser} 
        onClose={() => setSelectedUser(null)} 
      />
      
      <UsersList 
        users={mapUsers || []}
        isLoading={isLoading}
        onSelectUser={(user) => {
          setSelectedUser(user);
          centerOnUser(user);
        }}
      />
      
      <RealtimeIndicator status={realtimeIndicator} />
      
      <MarkerManager
        mapInstance={mapInstance}
        mapUsers={mapUsers || []}
        isLoading={isLoading}
        onSelectUser={setSelectedUser}
      />
      
      {hasGroups && !hasUsersWithLocation && (
        <NoUsersWithLocationWarning />
      )}
      
      {!hasGroups && !isLoading && (
        <NoGroupsWarning />
      )}
    </div>
  );
};

export default MapViewContainer;
