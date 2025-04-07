
import React from 'react';

interface RealtimeIndicatorProps {
  status: "connected" | "disconnected" | "connecting";
}

const RealtimeIndicator = ({ status }: RealtimeIndicatorProps) => {
  return (
    <div className="absolute top-4 left-4 z-10 bg-white rounded-md shadow-md px-3 py-2 text-sm font-medium flex items-center gap-2">
      <div 
        className={`w-3 h-3 rounded-full ${
          status === "connected" 
            ? "bg-green-500" 
            : status === "connecting" 
              ? "bg-amber-500" 
              : "bg-red-500"
        }`}
      />
      <span>
        {status === "connected" 
          ? "מחובר לעדכונים" 
          : status === "connecting" 
            ? "מתחבר..." 
            : "מנותק"}
      </span>
    </div>
  );
};

export default RealtimeIndicator;
