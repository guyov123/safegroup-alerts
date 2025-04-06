
import React, { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { GeolocationPosition } from './types';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapComponentProps {
  mapboxToken: string;
  currentPosition: GeolocationPosition | null;
  onMapInit: (map: mapboxgl.Map) => void;
}

const MapComponent = ({ mapboxToken, currentPosition, onMapInit }: MapComponentProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const userMarker = useRef<mapboxgl.Marker | null>(null);
  
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

    // Call the callback with the initialized map
    onMapInit(newMap);
    
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
  }, [currentPosition]);
  
  return (
    <div
      ref={mapContainer}
      className="absolute inset-0 bg-gray-200"
    />
  );
};

export default MapComponent;
