
import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Users, Clock, Navigation } from "lucide-react";
import { MapUser } from "./types";

interface UsersListProps {
  users: MapUser[];
  isLoading: boolean;
  onSelectUser: (user: MapUser) => void;
}

const UsersList = ({ users, isLoading, onSelectUser }: UsersListProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter users based on search query
  const filteredUsers = searchQuery 
    ? users.filter(user => 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        user.group.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.location && user.location.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : users;
  
  // Sort by status (safe first), then by reported time (most recent first)
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    // Sort by status first (safe before unknown)
    if (a.status !== b.status) {
      return a.status === "safe" ? -1 : 1;
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
      </div>
      <div className="max-h-80 overflow-y-auto p-2">
        {isLoading ? (
          <div className="p-4 text-center">
            <p className="text-muted-foreground">טוען נתונים...</p>
          </div>
        ) : sortedUsers.length > 0 ? (
          sortedUsers.map(user => (
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
              
              {/* Extra info row */}
              {(user.time || user.distance !== undefined) && (
                <div className="flex items-center gap-2 justify-end mt-1 text-xs text-muted-foreground">
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
                </div>
              )}
            </div>
          ))
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
