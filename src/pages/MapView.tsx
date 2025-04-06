
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

const MapView = () => {
  const [selectedUser, setSelectedUser] = useState<MapUser | null>(null);
  const [mapInstance, setMapInstance] = useState<mapboxgl.Map | null>(null);
  const [membersMarkers, setMembersMarkers] = useState<{[key: string]: mapboxgl.Marker}>({});
  
  // Custom hooks
  const { currentPosition, locationError } = useLocation();
  const { mapUsers, isLoading } = useMapUsers(
    currentPosition ? 
    { 
      latitude: currentPosition.coords.latitude, 
      longitude: currentPosition.coords.longitude 
    } : null
  );
  const mapboxToken = useMapboxToken();

  const handleMapInit = (map: mapboxgl.Map) => {
    setMapInstance(map);
  };
  
  // Add/update member markers on the map
  useEffect(() => {
    if (!mapInstance || mapUsers.length === 0) return;
    
    const newMarkers: {[key: string]: mapboxgl.Marker} = {...membersMarkers};
    
    // Add or update markers for each user with location
    mapUsers.forEach(user => {
      if (user.latitude && user.longitude) {
        if (newMarkers[user.id]) {
          // Update existing marker
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
            popup.addTo(mapInstance);
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
          .setPopup(popup)
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
      }
    });
    
    setMembersMarkers(newMarkers);
    
    return () => {
      // Clean up markers when component unmounts
      Object.values(newMarkers).forEach(marker => marker.remove());
    };
  }, [mapInstance, mapUsers]);
  
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
        users={mapUsers}
        isLoading={isLoading}
        onSelectUser={setSelectedUser}
      />
    </div>
  );
};

export default MapView;
