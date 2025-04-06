
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Clock, Navigation, MapPin, AlertTriangle } from "lucide-react";
import { MapUser } from "../types";

interface UserListItemProps {
  user: MapUser;
  onSelect: (user: MapUser) => void;
}

const UserListItem = ({ user, onSelect }: UserListItemProps) => {
  return (
    <div 
      className="p-2 hover:bg-accent rounded-md cursor-pointer transition-colors mb-1"
      onClick={() => onSelect(user)}
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
            {user.email && (
              <div className="text-xs text-gray-400 text-right">
                {user.email}
              </div>
            )}
          </div>
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.image} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </div>
      </div>
      
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
  );
};

export default UserListItem;
