
import React from 'react';
import { Search } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface UserListFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  displayType: "all" | "withLocation";
  onDisplayTypeChange: (type: "all" | "withLocation") => void;
}

const UserListFilter = ({ 
  searchQuery, 
  onSearchChange,
  displayType,
  onDisplayTypeChange
}: UserListFilterProps) => {
  return (
    <div className="p-3 border-b">
      <h2 className="font-medium text-right mb-2">חברי קבוצה על המפה</h2>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="חיפוש לפי שם או אימייל..."
          className="w-full rounded-md border border-input px-3 py-1 text-sm bg-background pl-10 text-right"
          dir="rtl"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      <div className="mt-2">
        <RadioGroup
          value={displayType}
          onValueChange={(value) => onDisplayTypeChange(value as "all" | "withLocation")}
          className="flex justify-end gap-4"
          dir="rtl"
        >
          <div className="flex items-center space-x-2 space-x-reverse flex-row-reverse">
            <RadioGroupItem value="all" id="all" />
            <label htmlFor="all" className="text-sm">כל החברים</label>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse flex-row-reverse">
            <RadioGroupItem value="withLocation" id="withLocation" />
            <label htmlFor="withLocation" className="text-sm">עם מיקום</label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
};

export default UserListFilter;
