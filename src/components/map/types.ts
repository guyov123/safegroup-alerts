
export interface MapUser {
  id: string;
  name: string;
  status: "safe" | "unknown";
  time?: string;
  location?: string;
  group: string;
  image: string;
  latitude?: number;
  longitude?: number;
  distance?: number;
  lastReported?: string;
}

export interface GeolocationPosition {
  coords: {
    latitude: number;
    longitude: number;
    accuracy: number; // Changed from optional to required
    altitude: number | null;
    altitudeAccuracy: number | null;
    heading: number | null;
    speed: number | null;
    toJSON: () => any; // Changed from optional to required
  };
  timestamp: number;
  toJSON: () => any; // Changed from optional to required
}

