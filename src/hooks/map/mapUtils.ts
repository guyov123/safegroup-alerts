
/**
 * Utility functions for map operations
 */

/**
 * Calculate distance between two points in kilometers
 */
export const calculateDistance = (
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180; 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c; // Distance in km
};

/**
 * Check if position has changed significantly (more than 10 meters)
 */
export const hasPositionChanged = (
  currentPos?: { latitude: number, longitude: number } | null,
  previousPos?: { latitude: number, longitude: number } | null
): boolean => {
  if (!currentPos || !previousPos) return true;
  
  // Calculate distance between current and previous position
  const distance = calculateDistance(
    previousPos.latitude,
    previousPos.longitude,
    currentPos.latitude,
    currentPos.longitude
  );
  
  // Return true if moved more than 10 meters
  return distance > 0.01; // 10 meters in km
};
