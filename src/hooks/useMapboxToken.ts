
import { useState, useEffect } from 'react';

export function useMapboxToken(): string {
  const [mapboxToken, setMapboxToken] = useState<string>('');
  
  useEffect(() => {
    // Clear any existing token that might be invalid
    localStorage.removeItem('mapbox_token');
    
    // Use the token provided by the user
    const validToken = 'pk.eyJ1IjoibXJzaGFwcm9uIiwiYSI6ImNtOTVpdWY3bjE0aGUycHF6cGpraDhvdGMifQ.Zcl9RxqHJ9zVFDTS6SmcpA';
    localStorage.setItem('mapbox_token', validToken);
    setMapboxToken(validToken);
  }, []);
  
  return mapboxToken;
}
