
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, UserCheck, Navigation } from "lucide-react";
import { MapUser } from "./types";

interface UserCardProps {
  user: MapUser | null;
  onClose: () => void;
}

const UserCard = ({ user, onClose }: UserCardProps) => {
  if (!user) return null;
  
  return (
    <div className="absolute bottom-20 right-4 left-4 md:left-auto md:right-4 md:w-80 z-20">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6" 
              onClick={onClose}
            >
              ×
            </Button>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <CardTitle>{user.name}</CardTitle>
                <CardDescription>{user.group}</CardDescription>
              </div>
              <Avatar>
                <AvatarImage src={user.image} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-right">
            {user.location && (
              <div className="flex items-center justify-end gap-2">
                <div className="text-sm">{user.location}</div>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
            
            {user.distance !== undefined && (
              <div className="flex items-center justify-end gap-2">
                <div className="text-sm">{user.distance} ק"מ ממך</div>
                <Navigation className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
            
            {user.status === "safe" && user.time && (
              <div className="flex items-center justify-end gap-2">
                <div className="text-sm flex items-center">
                  <span>{user.time}</span>
                </div>
                <Badge variant="outline" className="flex items-center gap-1 bg-green-100">
                  <Clock className="h-3 w-3" />
                  דיווח אחרון
                </Badge>
              </div>
            )}
            
            <div className="flex justify-end gap-2 mt-4">
              <Button size="sm" className="flex items-center gap-1">
                <UserCheck className="h-4 w-4" />
                שלח הודעה
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserCard;
