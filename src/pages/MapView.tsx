
import React, { useState } from "react";
import MapViewContainer from "@/components/map/MapViewContainer";
import AuthDebugPanel from "@/components/map/debug/AuthDebugPanel";
import { Button } from "@/components/ui/button";
import { Bug } from "lucide-react";

const MapView = () => {
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  
  return (
    <>
      <MapViewContainer />
      
      {/* Debug button */}
      <div className="absolute bottom-4 right-4 z-20">
        <Button 
          variant="outline" 
          size="sm"
          className="bg-white"
          onClick={() => setShowDebugPanel(true)}
        >
          <Bug className="h-4 w-4 mr-1" /> בדיקת אימות
        </Button>
      </div>
      
      {showDebugPanel && (
        <AuthDebugPanel onClose={() => setShowDebugPanel(false)} />
      )}
    </>
  );
};

export default MapView;
