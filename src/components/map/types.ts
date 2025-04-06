
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
    accuracy?: number;
  }
}
