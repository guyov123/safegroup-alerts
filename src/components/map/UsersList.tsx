
import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Users, Clock, Navigation, MapPin, Loader2, AlertTriangle } from "lucide-react";
import { MapUser } from "./types";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface UsersListProps {
  users: MapUser[];
  isLoading: boolean;
  onSelectUser: (user: MapUser) => void;
}

const UsersList = ({ users, isLoading, onSelectUser }: UsersListProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [displayType, setDisplayType] = useState<"all" | "withLocation">("all");
  const [progressValue, setProgressValue] = useState(30);
  
  console.log("UsersList rendered with", users.length, "users", isLoading ? "(loading)" : "");

  // Increment progress during loading
  useEffect(() => {
    let interval: number | null = null;
    
    if (isLoading && progressValue < 90) {
      interval = window.setInterval(() => {
        setProgressValue(prev => Math.min(prev + 10, 90));
      }, 1000);
    } else if (!isLoading) {
      setProgressValue(100);
      setTimeout(() => setProgressValue(30), 500);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading, progressValue]);

  // Filter users based on search query and display type
  const filteredUsers = users.filter(user => {
    // First, apply text search filter
    const matchesSearch = !searchQuery || 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      user.group.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.location && user.location.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Then, apply location filter if necessary  
    return matchesSearch && (displayType === "all" || (displayType === "withLocation" && Boolean(user.latitude && user.longitude)));
  });
  
  // Sort by status (safe first), then by reported time (most recent first)
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    // Sort by status first (safe before unknown)
    if (a.status !== b.status) {
      return a.status === "safe" ? -1 : 1;
    }
    
    // Then sort by whether they have location data
    const aHasLocation = Boolean(a.latitude && a.longitude);
    const bHasLocation = Boolean(b.latitude && b.longitude);
    
    if (aHasLocation !== bHasLocation) {
      return aHasLocation ? -1 : 1;
    }
    
    // Then sort by reported time (if both have timestamps)
    if (a.lastReported && b.lastReported) {
      return new Date(b.lastReported).getTime() - new Date(a.lastReported).getTime();
    }
    
    // Put users with timestamps before those without
    if (a.lastReported && !b.lastReported) return -1;
    if (!a.lastReported && b.lastReported) return 1;
    
    // Fall back to sorting by name
    return a.name.localeCompare(b.name);
  });

  const hasAnyUsersWithLocation = users.some(user => user.latitude && user.longitude);
  
  return (
    <div className="absolute top-4 right-4 z-10 w-80 bg-white rounded-md shadow-md">
      <div className="p-3 border-b">
        <h2 className="font-medium text-right mb-2">חברי קבוצה על המפה</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="חיפוש לפי שם..."
            className="w-full rounded-md border border-input px-3 py-1 text-sm bg-background pl-10 text-right"
            dir="rtl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="mt-2">
          <RadioGroup
            value={displayType}
            onValueChange={(value) => setDisplayType(value as "all" | "withLocation")}
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
      
      {/* Conditional rendering based on loading state and available users */}
      <div className="max-h-80 overflow-y-auto p-2">
        {isLoading && users.length === 0 ? (
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-center mb-2">
              <Loader2 className="h-5 w-5 text-primary animate-spin mr-2" />
              <p className="text-muted-foreground">טוען נתונים...</p>
            </div>
            <Progress value={progressValue} className="h-2" />
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        ) : sortedUsers.length > 0 ? (
          <>
            {!hasAnyUsersWithLocation && (
              <div className="mb-2 p-2 bg-amber-50 border border-amber-200 rounded-md">
                <div className="flex items-center justify-center gap-2 text-amber-600">
                  <AlertTriangle className="h-4 w-4" />
                  <p className="text-xs">אין חברים עם נתוני מיקום זמינים</p>
                </div>
              </div>
            )}
            {isLoading && (
              <div className="mb-2">
                <Progress value={progressValue} className="h-1" />
              </div>
            )}
            {sortedUsers.map(user => (
              <div 
                key={user.id} 
                className="p-2 hover:bg-accent rounded-md cursor-pointer transition-colors mb-1"
                onClick={() => onSelectUser(user)}
              >
                <div className="flex items-center justify-between">
                  <Badge 
                    variant="outline" 
                    className={user.status === "safe" ? "bg-green-100" : "bg-amber-100"}
                  >
                    {user.status === "safe" ? "בטוח" : "לא ידוע"}
                  </Badge>
                  
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="font-medium text-sm">{user.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                        <span>{user.group}</span>
                        <Users className="h-3 w-3" />
                      </div>
                    </div>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.image} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </div>
                </div>
                
                {/* Info row with time, location and distance */}
                <div className="flex flex-wrap items-center gap-2 justify-end mt-1 text-xs text-muted-foreground">
                  {user.time && (
                    <div className="flex items-center gap-1">
                      <span>{user.time}</span>
                      <Clock className="h-3 w-3" />
                    </div>
                  )}
                  
                  {user.distance !== undefined && (
                    <div className="flex items-center gap-1">
                      <span>{user.distance} ק"מ</span>
                      <Navigation className="h-3 w-3" />
                    </div>
                  )}
                  
                  {user.latitude && user.longitude && (
                    <div className="flex items-center gap-1">
                      <span>{user.location}</span>
                      <MapPin className="h-3 w-3" />
                    </div>
                  )}
                  
                  {!user.latitude && !user.longitude && user.status === "safe" && (
                    <div className="flex items-center gap-1 text-amber-500">
                      <span>אין נתוני מיקום</span>
                      <AlertTriangle className="h-3 w-3" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </>
        ) : (
          <div className="p-4 text-center">
            <p className="text-muted-foreground">אין חברי קבוצה זמינים</p>
            <p className="text-xs text-muted-foreground mt-1">נא להוסיף קבוצות וחברים בדף הקבוצות</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersList;
