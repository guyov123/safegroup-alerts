
export interface MapUser {
  id: string;
  name: string;
  email?: string;  // Added email field to help debug issues
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
    accuracy: number;
    altitude: number | null;
    altitudeAccuracy: number | null;
    heading: number | null;
    speed: number | null;
    toJSON: () => any;
  };
  timestamp: number;
  toJSON: () => any;
}
