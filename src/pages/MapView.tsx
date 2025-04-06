
import React, { useState, useRef, useEffect } from "react";
import { useMapboxToken } from "@/hooks/useMapboxToken";
import { useLocation } from "@/hooks/useLocation";
import { useMapUsers } from "@/hooks/useMapUsers";
import { MapUser } from "@/components/map/types";
import MapComponent from "@/components/map/MapComponent";
import MapControls from "@/components/map/MapControls";
import LocationErrorMessage from "@/components/map/LocationErrorMessage";
import UserCard from "@/components/map/UserCard";
import UsersList from "@/components/map/UsersList";
import mapboxgl from 'mapbox-gl';
import { toast } from "sonner";

const MapView = () => {
  const [selectedUser, setSelectedUser] = useState<MapUser | null>(null);
  const [mapInstance, setMapInstance] = useState<mapboxgl.Map | null>(null);
  const [membersMarkers, setMembersMarkers] = useState<{[key: string]: mapboxgl.Marker}>({});
  const markerUpdateTimeRef = useRef<number>(0);
  
  // Custom hooks
  const { currentPosition, locationError } = useLocation();
  const { mapUsers, isLoading, error } = useMapUsers(
    currentPosition ? 
    { 
      latitude: currentPosition.coords.latitude, 
      longitude: currentPosition.coords.longitude 
    } : null
  );

  const mapboxToken = useMapboxToken();
  
  // Debug information
  useEffect(() => {
    if (mapUsers && mapUsers.length > 0) {
      console.log("MapUsers loaded:", mapUsers.length, "users");
      const usersWithLocation = mapUsers.filter(user => user.latitude && user.longitude).length;
      console.log(`Users with location data: ${usersWithLocation} of ${mapUsers.length}`);
    }
  }, [mapUsers]);
  
  // Test realtime connection by showing status on the UI
  useEffect(() => {
    // Check if Supabase realtime is connected by subscribing to a test channel
    const testChannel = supabase.channel('connection_test');
    const startTime = Date.now();
    
    testChannel
      .subscribe((status) => {
        const elapsed = Date.now() - startTime;
        console.log(`Realtime test connection status: ${status} (after ${elapsed}ms)`);
        
        if (status === 'SUBSCRIBED') {
          console.log(`✅ Realtime connection test successful in ${elapsed}ms`);
        } else if (status === 'CHANNEL_ERROR') {
          console.error("❌ Error in realtime test connection");
        }
      });
      
    return () => {
      supabase.removeChannel(testChannel);
    };
  }, []);
  
  // Add/update member markers on the map - with debouncing
  useEffect(() => {
    if (!mapInstance) return;
    if (isLoading && !mapUsers.length) return;
    
    console.log("Updating map markers for", mapUsers.length, "users");
    
    // Avoid overly frequent marker updates (debounce)
    const now = Date.now();
    if (now - markerUpdateTimeRef.current < 1000 && Object.keys(membersMarkers).length > 0) {
      return;
    }
    markerUpdateTimeRef.current = now;
    
    const newMarkers: {[key: string]: mapboxgl.Marker} = {...membersMarkers};
    
    // Add or update markers for each user with location
    mapUsers.forEach(user => {
      if (user.latitude && user.longitude) {
        console.log(`Adding/updating marker for user ${user.name} at ${user.latitude}, ${user.longitude}, status: ${user.status}`);
        
        if (newMarkers[user.id]) {
          // Update existing marker position
          newMarkers[user.id].setLngLat([user.longitude, user.latitude]);
        } else {
          // Create marker element
          const markerEl = document.createElement('div');
          markerEl.className = 'member-location-marker';
          markerEl.style.width = '20px';
          markerEl.style.height = '20px';
          markerEl.style.borderRadius = '50%';
          markerEl.style.backgroundColor = user.status === 'safe' ? '#10B981' : '#F59E0B';
          markerEl.style.border = '2px solid white';
          markerEl.style.boxShadow = '0 0 0 2px rgba(0, 0, 0, 0.1)';
          markerEl.style.cursor = 'pointer';
          
          // Add popup with user information
          const popup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false,
            offset: 25,
            className: 'member-popup',
            maxWidth: '300px'
          });
          
          // Format the popup content
          const popupContent = document.createElement('div');
          popupContent.className = 'p-2 text-right';
          
          const userName = document.createElement('div');
          userName.className = 'font-bold text-sm';
          userName.textContent = user.name;
          popupContent.appendChild(userName);
          
          if (user.time) {
            const timeReported = document.createElement('div');
            timeReported.className = 'text-xs';
            timeReported.textContent = `דווח ${user.time}`;
            popupContent.appendChild(timeReported);
          }
          
          if (user.distance !== undefined) {
            const distanceInfo = document.createElement('div');
            distanceInfo.className = 'text-xs';
            distanceInfo.textContent = `${user.distance} ק"מ ממך`;
            popupContent.appendChild(distanceInfo);
          }
          
          popup.setDOMContent(popupContent);
          
          // Show popup on hover
          markerEl.addEventListener('mouseenter', () => {
            popup.setLngLat([user.longitude!, user.latitude!]).addTo(mapInstance);
          });
          
          markerEl.addEventListener('mouseleave', () => {
            popup.remove();
          });
          
          // Add click handler
          markerEl.addEventListener('click', () => {
            setSelectedUser(user);
          });
          
          // Create marker
          const marker = new mapboxgl.Marker({
            element: markerEl,
            anchor: 'center'
          })
          .setLngLat([user.longitude, user.latitude])
          .addTo(mapInstance);
          
          newMarkers[user.id] = marker;
        }
      } else if (newMarkers[user.id]) {
        // Remove marker if no location
        newMarkers[user.id].remove();
        delete newMarkers[user.id];
      }
    });
    
    // Remove markers for users that are no longer in the list
    Object.keys(membersMarkers).forEach(id => {
      if (!mapUsers.find(user => user.id === id) && membersMarkers[id]) {
        membersMarkers[id].remove();
        delete newMarkers[id];
      }
    });
    
    setMembersMarkers(newMarkers);
    
    // Log the number of markers created
    const markerCount = Object.keys(newMarkers).length;
    console.log(`Created ${markerCount} markers on the map`);
  }, [mapInstance, mapUsers, isLoading]);
  
  // Function to center the map on a user
  const centerOnUser = (user: MapUser) => {
    if (mapInstance && user.latitude && user.longitude) {
      mapInstance.flyTo({
        center: [user.longitude, user.latitude],
        zoom: 15,
        essential: true
      });
      
      // Show toast confirmation
      toast.success(`מתמקד במיקום של ${user.name}`);
    } else if (user.status === "safe" && (!user.latitude || !user.longitude)) {
      // Handle the case where a user is marked as safe but has no location data
      toast.info(`${user.name} סימן/ה שהוא/היא בטוח/ה, אך אין נתוני מיקום`);
    }
  };
  
  // If we have data loading errors, show them
  useEffect(() => {
    if (error) {
      toast.error(`שגיאה בטעינת הנתונים: ${error}`);
    }
  }, [error]);

  // Import Supabase for realtime connection test button
  const { supabase } = React.useMemo(() => {
    const { supabase } = require("@/integrations/supabase/client");
    return { supabase };
  }, []);
  
  // Function to manually test realtime by publishing an event
  const testRealtime = async () => {
    try {
      toast.info("בדיקת תקשורת בזמן אמת...");
      const userId = 'test-' + Date.now();
      
      const testChannel = supabase.channel('test_publish');
      await testChannel.subscribe((status) => {
        console.log("Test publication channel status:", status);
        
        if (status === 'SUBSCRIBED') {
          // Channel is ready, send a broadcast message
          testChannel.send({
            type: 'broadcast',
            event: 'test',
            payload: { message: 'Hello from client', timestamp: new Date().toISOString() }
          });
          
          console.log("Sent test broadcast message");
          toast.success("נשלחה הודעת בדיקה");
        }
      });
      
      // Clean up after 5 seconds
      setTimeout(() => {
        supabase.removeChannel(testChannel);
      }, 5000);
    } catch (e) {
      console.error("Error testing realtime:", e);
      toast.error("שגיאה בבדיקת תקשורת בזמן אמת");
    }
  };
  
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
      
      {/* Realtime test button */}
      <button
        onClick={testRealtime}
        className="absolute top-4 left-4 z-10 bg-white rounded-md shadow-md px-3 py-2 text-sm font-medium"
      >
        בדיקת Realtime
      </button>
    </div>
  );

  function handleMapInit(map: mapboxgl.Map) {
    console.log("Map initialized");
    setMapInstance(map);
  }
};

export default MapView;
