
import React from 'react';
import { AlertTriangle } from "lucide-react";

const NoLocationWarning = () => {
  return (
    <div className="mb-2 p-2 bg-amber-50 border border-amber-200 rounded-md">
      <div className="flex items-center justify-center gap-2 text-amber-600">
        <AlertTriangle className="h-4 w-4" />
        <p className="text-xs">אין חברים עם נתוני מיקום זמינים</p>
      </div>
    </div>
  );
};

export default NoLocationWarning;
