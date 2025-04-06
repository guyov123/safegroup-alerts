
import React from 'react';
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Compass, Layers } from "lucide-react";
import { toast } from "sonner";

interface MapControlsProps {
  map: mapboxgl.Map | null;
  currentPosition: GeolocationPosition | null;
}

const MapControls = ({ map, currentPosition }: MapControlsProps) => {
  const handlePanToUserLocation = () => {
    if (!map || !currentPosition) {
      toast.error("מיקום המשתמש אינו זמין");
      return;
    }
    
    const { longitude, latitude } = currentPosition.coords;
    
    map.flyTo({
      center: [longitude, latitude],
      zoom: 15,
      essential: true
    });
  };

  return (
    <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
      <Button 
        variant="secondary" 
        size="icon" 
        className="shadow-md"
        onClick={() => map?.zoomIn()}
      >
        <ZoomIn className="h-4 w-4" />
      </Button>
      <Button 
        variant="secondary" 
        size="icon" 
        className="shadow-md"
        onClick={() => map?.zoomOut()}
      >
        <ZoomOut className="h-4 w-4" />
      </Button>
      <Button 
        variant="secondary" 
        size="icon" 
        className="shadow-md"
        onClick={handlePanToUserLocation}
      >
        <Compass className="h-4 w-4" />
      </Button>
      <Button 
        variant="secondary" 
        size="icon" 
        className="shadow-md"
      >
        <Layers className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default MapControls;
