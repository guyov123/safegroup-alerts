
export interface MapUser {
  id: string;
  name: string;
  status: "safe" | "unknown";
  time?: string;
  location?: string;
  group: string;
  image: string;
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
    toJSON?: () => any;
  };
  timestamp: number;
  toJSON?: () => any;
}
