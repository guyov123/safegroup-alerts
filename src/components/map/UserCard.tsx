
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, UserCheck, Navigation } from "lucide-react";
import { MapUser } from "./types";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

interface UserCardProps {
  user: MapUser | null;
  onClose: () => void;
}

const UserCard = ({ user, onClose }: UserCardProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [contactMethod, setContactMethod] = useState<"email" | "sms">("email");

  if (!user) return null;

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast.error("הודעה לא יכולה להיות ריקה");
      return;
    }

    setIsLoading(true);

    try {
      // Get the current user's info for the "from" details
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser) {
        toast.error("עליך להתחבר כדי לשלוח הודעות");
        setIsLoading(false);
        return;
      }

      const recipientContact = contactMethod === "email" 
        ? user.email 
        : user.phoneNumber;

      if (!recipientContact) {
        toast.error(`למשתמש אין ${contactMethod === "email" ? "כתובת אימייל" : "מספר טלפון"} מוגדר`);
        setIsLoading(false);
        return;
      }

      // Log the message attempt
      console.log(`Sending ${contactMethod} message to ${user.name} (${recipientContact}): ${message}`);

      // In a real application, this would send to a backend endpoint
      // For now, we'll just simulate a successful message sending
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`הודעה נשלחה אל ${user.name}`);
      setMessage("");
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("שגיאה בשליחת ההודעה, אנא נסו שוב");
    }
    
    setIsLoading(false);
  };

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
            {user.status === "safe" && (
              <div className="flex items-center justify-end gap-2">
                <Badge variant="outline" className="bg-green-100">
                  בטוח/ה
                </Badge>
              </div>
            )}
            
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
            
            {user.time && (
              <div className="flex items-center justify-end gap-2">
                <div className="text-sm">{user.time}</div>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
            
            <div className="flex justify-end gap-2 mt-4">
              <Button 
                size="sm" 
                className="flex items-center gap-1"
                onClick={() => setIsDialogOpen(true)}
              >
                <UserCheck className="h-4 w-4" />
                שלח הודעה
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>שליחת הודעה אל {user.name}</DialogTitle>
            <DialogDescription>
              הודעתך תישלח ישירות אל {user.name}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div className="flex justify-end gap-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="contactMethod"
                  className="mr-2"
                  checked={contactMethod === "sms"}
                  onChange={() => setContactMethod("sms")}
                />
                SMS
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="contactMethod"
                  className="mr-2"
                  checked={contactMethod === "email"}
                  onChange={() => setContactMethod("email")}
                />
                אימייל
              </label>
            </div>
            
            {user.email && contactMethod === "email" && (
              <div className="text-right text-sm text-muted-foreground">
                ישלח אל: {user.email}
              </div>
            )}
            
            {user.phoneNumber && contactMethod === "sms" && (
              <div className="text-right text-sm text-muted-foreground">
                ישלח אל: {user.phoneNumber}
              </div>
            )}
            
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="הקלד את הודעתך כאן..."
              className="h-32 text-right"
              dir="rtl"
            />
          </div>
          
          <DialogFooter className="flex justify-between mt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>ביטול</Button>
            <Button 
              onClick={handleSendMessage} 
              disabled={isLoading || !message.trim()}
            >
              {isLoading ? "שולח..." : "שלח הודעה"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserCard;
