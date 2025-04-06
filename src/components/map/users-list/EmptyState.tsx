
import React from 'react';
import { UserPlus, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

const EmptyState = () => {
  const navigate = useNavigate();

  return (
    <div className="p-4 text-center">
      <div className="flex justify-center mb-2">
        <UserPlus className="h-10 w-10 text-muted-foreground" />
      </div>
      <p className="text-muted-foreground font-medium">אין חברי קבוצה זמינים</p>
      <p className="text-xs text-muted-foreground mt-1">יש להוסיף קבוצות וחברים כדי לראותם על המפה</p>
      
      <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-right">
        <div className="flex items-center gap-2 mb-1">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <p className="text-xs font-semibold text-amber-700">כיצד להוסיף חברים למפה:</p>
        </div>
        <ol className="list-decimal list-inside text-xs text-amber-700 space-y-1.5 pr-2">
          <li>הוסף קבוצה חדשה בדף הקבוצות</li>
          <li>הזמן חברים לקבוצה באמצעות <span className="font-semibold">אותה כתובת אימייל</span> שאיתה הם נרשמו למערכת</li>
          <li>בקש מהם לדווח סטטוס "אני בטוח" כדי להופיע על המפה</li>
        </ol>
        <p className="mt-2 text-xs text-amber-700">
          המערכת תחבר אוטומטית בין המשתמש לחבר הקבוצה לפי כתובת האימייל
        </p>
      </div>
      
      <Button 
        variant="outline" 
        className="mt-4" 
        size="sm"
        onClick={() => navigate('/groups')}
      >
        עבור לדף הקבוצות
      </Button>
    </div>
  );
};

export default EmptyState;
