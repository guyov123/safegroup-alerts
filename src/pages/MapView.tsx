
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Users, Layers, ZoomIn, ZoomOut, UserCheck, Search } from "lucide-react";

const MapView = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Mock data for users on map
  const mapUsers = [
    { id: 1, name: "יעל כהן", status: "safe", time: "12:45", location: "רחוב הברוש 10, תל אביב", group: "משפחה", image: "" },
    { id: 2, name: "דני לוי", status: "safe", time: "11:30", location: "שדרות רוטשילד 20, תל אביב", group: "משפחה", image: "" },
    { id: 3, name: "מיכל רבין", status: "unknown", time: "", location: "אלנבי 85, תל אביב", group: "חברים", image: "" },
  ];
  
  return (
    <div className="h-screen relative">
      {/* Mock Map - Replace with actual map component */}
      <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <MapPin className="h-12 w-12 mx-auto mb-2" />
          <p className="text-lg font-medium">הצגת מפה</p>
          <p>(מידע המפה יוצג כאן)</p>
        </div>
      </div>
      
      {/* Map Controls */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
        <Button variant="secondary" size="icon" className="shadow-md">
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="secondary" size="icon" className="shadow-md">
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button variant="secondary" size="icon" className="shadow-md">
          <Layers className="h-4 w-4" />
        </Button>
      </div>
      
      {/* User Card - Shows when user is selected */}
      {selectedUser && (
        <div className="absolute bottom-20 right-4 left-4 md:left-auto md:right-4 md:w-80 z-20">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6" 
                  onClick={() => setSelectedUser(null)}
                >
                  ×
                </Button>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <CardTitle>{selectedUser.name}</CardTitle>
                    <CardDescription>{selectedUser.group}</CardDescription>
                  </div>
                  <Avatar>
                    <AvatarImage src={selectedUser.image} alt={selectedUser.name} />
                    <AvatarFallback>{selectedUser.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-right">
                <div className="flex items-center justify-end gap-2">
                  <div className="text-sm">{selectedUser.location}</div>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </div>
                {selectedUser.status === "safe" && (
                  <div className="flex items-center justify-end gap-2">
                    <div className="text-sm flex items-center">
                      <span>{selectedUser.time}</span>
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
      )}
      
      {/* Users List */}
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
            />
          </div>
        </div>
        <div className="max-h-60 overflow-y-auto p-2">
          {mapUsers.map(user => (
            <div 
              key={user.id} 
              className="p-2 hover:bg-accent rounded-md cursor-pointer transition-colors"
              onClick={() => setSelectedUser(user)}
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MapView;
