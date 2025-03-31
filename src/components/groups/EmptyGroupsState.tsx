
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";

interface EmptyGroupsStateProps {
  onCreateClick: () => void;
  isSearching: boolean;
}

export const EmptyGroupsState = ({ onCreateClick, isSearching }: EmptyGroupsStateProps) => {
  return (
    <div className="text-center py-10">
      <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
      <h3 className="text-lg font-medium">אין קבוצות</h3>
      <p className="text-muted-foreground mb-4">
        {isSearching 
          ? 'לא נמצאו תוצאות לחיפוש שלך' 
          : 'טרם יצרת קבוצות'}
      </p>
      <Button onClick={onCreateClick}>
        <Plus className="mr-2 h-4 w-4" />
        צור קבוצה חדשה
      </Button>
    </div>
  );
};
