import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Set the access token from environment variables
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

interface MapProps {
  center?: [number, number];
  zoom?: number;
  markers?: Array<{
    id: string;
    coordinates: [number, number];
    color?: string;
    onClick?: () => void;
  }>;
  onMapClick?: (lngLat: { lng: number; lat: number }) => void;
}

const Map = ({ center = [34.8516, 31.0461], zoom = 7, markers = [], onMapClick }: MapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: center,
      zoom: zoom,
    });

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    if (onMapClick) {
      map.current.on('click', (e) => {
        onMapClick(e.lngLat);
      });
    }

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  // Handle markers
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Remove markers that are no longer in the markers array
    Object.keys(markersRef.current).forEach((id) => {
      if (!markers.find((m) => m.id === id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });

    // Add or update markers
    markers.forEach((marker) => {
      if (markersRef.current[marker.id]) {
        // Update existing marker position
        markersRef.current[marker.id].setLngLat(marker.coordinates);
      } else {
        // Create new marker
        const el = document.createElement('div');
        el.className = 'marker';
        el.style.width = '24px';
        el.style.height = '24px';
        el.style.borderRadius = '50%';
        el.style.backgroundColor = marker.color || '#FF0000';
        el.style.border = '2px solid white';
        el.style.cursor = 'pointer';

        const newMarker = new mapboxgl.Marker(el)
          .setLngLat(marker.coordinates)
          .addTo(map.current);

        if (marker.onClick) {
          el.addEventListener('click', marker.onClick);
        }

        markersRef.current[marker.id] = newMarker;
      }
    });
  }, [markers, mapLoaded]);

  // Update center and zoom when props change
  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    map.current.setCenter(center);
    map.current.setZoom(zoom);
  }, [center, zoom, mapLoaded]);

  return (
    <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
  );
};

export default Map; 