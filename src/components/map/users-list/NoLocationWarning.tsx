
import React from 'react';
import { AlertTriangle, Info } from "lucide-react";

const NoLocationWarning = () => {
  return (
    <div className="mb-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
      <div className="flex items-center justify-center gap-2 text-amber-600 mb-1">
        <AlertTriangle className="h-4 w-4" />
        <p className="text-xs font-semibold">אין חברים עם נתוני מיקום זמינים</p>
      </div>
      
      <p className="text-xs text-amber-600 text-center mt-1 mb-2">
        יתכן שהחברים לא דיווחו סטטוס או שטרם אפשרו שיתוף מיקום
      </p>
      
      <div className="flex items-start gap-2 bg-blue-50 p-2 rounded border border-blue-100">
        <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-blue-700 text-right">
          <p className="font-semibold">חשוב לדעת:</p>
          <p>כדי שמשתמש יופיע על המפה, הוא צריך:</p>
          <ol className="list-decimal list-inside mt-1 space-y-1 pr-1">
            <li>להיות מוזמן לקבוצה עם <span className="font-semibold">אותה כתובת אימייל</span> שאיתה נרשם למערכת</li>
            <li>לדווח סטטוס "אני בטוח" עם מיקום</li>
          </ol>
          <p className="mt-1 text-xs">המערכת תזהה אוטומטית את הקשר בין המשתמש לחבר הקבוצה</p>
        </div>
      </div>
    </div>
  );
};

export default NoLocationWarning;
