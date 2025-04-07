
import React from 'react';
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const NoGroupsWarning = () => {
  const navigate = useNavigate();
  
  return (
    <div className="absolute top-20 right-4 z-10 bg-amber-50 border border-amber-200 p-4 rounded-md shadow-md max-w-sm">
      <div className="flex items-start gap-2">
        <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-amber-700 text-sm text-right font-semibold">
            אין לך עדיין קבוצות
          </p>
          <p className="text-amber-600 text-xs text-right mt-1">
            כדי לראות חברים על המפה, עליך קודם להקים קבוצות ולהזמין אליהן חברים
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-3 w-full bg-white"
            onClick={() => navigate('/groups')}
          >
            צור קבוצה חדשה
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NoGroupsWarning;
