
import { useState, useEffect } from 'react';
import { toast } from "sonner";
import { GeolocationPosition } from '@/components/map/types';

export function useLocation() {
  const [currentPosition, setCurrentPosition] = useState<GeolocationPosition | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocationPermissionGranted, setIsLocationPermissionGranted] = useState(false);

  // Request location permission and get current position
  useEffect(() => {
    const requestLocationPermission = async () => {
      try {
        // Check if browser supports geolocation
        if (!navigator.geolocation) {
          setLocationError("הדפדפן לא תומך במיקום");
          toast.error("הדפדפן לא תומך במיקום");
          return;
        }

        // Request geolocation
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setIsLocationPermissionGranted(true);
            setCurrentPosition({
              coords: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                altitude: position.coords.altitude,
                altitudeAccuracy: position.coords.altitudeAccuracy,
                heading: position.coords.heading,
                speed: position.coords.speed,
                toJSON: position.coords.toJSON || (() => {
                  return {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    altitude: position.coords.altitude,
                    altitudeAccuracy: position.coords.altitudeAccuracy,
                    heading: position.coords.heading,
                    speed: position.coords.speed,
                  };
                })
              },
              timestamp: position.timestamp,
              toJSON: position.toJSON
            });
            toast.success("המיקום נמצא בהצלחה");
          },
          (error) => {
            console.error("Error getting location:", error);
            
            if (error.code === 1) {
              setLocationError("לא ניתנה הרשאה למיקום");
              toast.error("לא ניתנה הרשאה למיקום");
            } else {
              setLocationError("שגיאה בקבלת המיקום");
              toast.error("שגיאה בקבלת המיקום");
            }
          },
          { enableHighAccuracy: true, timeout: 30000 }
        );
      } catch (error) {
        console.error("Error getting location:", error);
        setLocationError("שגיאה בקבלת המיקום");
        toast.error("שגיאה בקבלת המיקום");
      }
    };
    
    requestLocationPermission();
    
    // Setup watchPosition to track location changes
    let watchId: number;
    
    const setupWatchPosition = () => {
      try {
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            setCurrentPosition({
              coords: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                altitude: position.coords.altitude,
                altitudeAccuracy: position.coords.altitudeAccuracy,
                heading: position.coords.heading,
                speed: position.coords.speed,
                toJSON: position.coords.toJSON || (() => {
                  return {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    altitude: position.coords.altitude,
                    altitudeAccuracy: position.coords.altitudeAccuracy,
                    heading: position.coords.heading,
                    speed: position.coords.speed,
                  };
                })
              },
              timestamp: position.timestamp,
              toJSON: position.toJSON
            });
          },
          (error) => {
            console.error("Error watching position:", error);
          },
          { enableHighAccuracy: true, timeout: 30000 }
        );
      } catch (error) {
        console.error("Error watching position:", error);
      }
    };
    
    if (isLocationPermissionGranted) {
      setupWatchPosition();
    }
    
    // Cleanup watch position
    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [isLocationPermissionGranted]);

  return { currentPosition, locationError, isLocationPermissionGranted };
}
