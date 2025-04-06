
import React from 'react';
import { AlertTriangle } from "lucide-react";

interface LocationErrorMessageProps {
  error: string | null;
}

const LocationErrorMessage = ({ error }: LocationErrorMessageProps) => {
  if (!error) return null;
  
  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded flex items-center gap-2 shadow-md">
        <AlertTriangle className="h-4 w-4" />
        <span>{error}</span>
      </div>
    </div>
  );
};

export default LocationErrorMessage;
