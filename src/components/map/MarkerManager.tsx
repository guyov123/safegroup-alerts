
import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { MapUser } from './types';

interface MarkerManagerProps {
  mapInstance: mapboxgl.Map | null;
  mapUsers: MapUser[];
  isLoading: boolean;
  onSelectUser: (user: MapUser) => void;
}

const MarkerManager = ({ mapInstance, mapUsers, isLoading, onSelectUser }: MarkerManagerProps) => {
  const [membersMarkers, setMembersMarkers] = useState<{[key: string]: mapboxgl.Marker}>({});
  const markerUpdateTimeRef = useRef<number>(0);
  
  // Add/update member markers on the map - with debouncing
  useEffect(() => {
    if (!mapInstance) return;
    if (isLoading && !mapUsers.length) return;
    
    console.log("Updating map markers for", mapUsers.length, "users");
    console.log("Users with location:", mapUsers.filter(user => user.latitude && user.longitude).length);
    
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
        console.log(`Creating/updating marker for ${user.name} at ${user.latitude}, ${user.longitude}`);
        // Check if the marker already exists before creating a new one
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
            onSelectUser(user);
          });
          
          // Create marker
          const marker = new mapboxgl.Marker({
            element: markerEl,
            anchor: 'center'
          })
          .setLngLat([user.longitude, user.latitude])
          .addTo(mapInstance);
          
          newMarkers[user.id] = marker;
          console.log(`Added marker for ${user.name}`);
        }
      } else if (newMarkers[user.id]) {
        // Remove marker if no location
        console.log(`Removing marker for ${user.name} - no location data`);
        newMarkers[user.id].remove();
        delete newMarkers[user.id];
      }
    });
    
    // Remove markers for users that are no longer in the list
    Object.keys(membersMarkers).forEach(id => {
      if (!mapUsers.find(user => user.id === id) && membersMarkers[id]) {
        console.log(`Removing marker for user ID ${id} - not found in user list`);
        membersMarkers[id].remove();
        delete newMarkers[id];
      }
    });
    
    setMembersMarkers(newMarkers);
  }, [mapInstance, mapUsers, isLoading, onSelectUser, membersMarkers]);
  
  return null; // This is a logic component, no UI rendering needed
};

export default MarkerManager;
