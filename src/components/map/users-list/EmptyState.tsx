
import React from 'react';
import { UserPlus } from 'lucide-react';

const EmptyState = () => {
  return (
    <div className="p-4 text-center">
      <div className="flex justify-center mb-2">
        <UserPlus className="h-10 w-10 text-muted-foreground" />
      </div>
      <p className="text-muted-foreground">אין חברי קבוצה זמינים</p>
      <p className="text-xs text-muted-foreground mt-1">נא להוסיף קבוצות וחברים בדף הקבוצות</p>
      <p className="text-xs text-amber-600 mt-3">
        שים לב: חברים יופיעו על המפה רק לאחר שידווחו סטטוס עם מיקום
      </p>
    </div>
  );
};

export default EmptyState;
