
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Group } from "./types";

interface CreateGroupDialogProps {
  onGroupCreated: (group: Group) => void;
}

export const CreateGroupDialog = ({ onGroupCreated }: CreateGroupDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        toast.error('יש להתחבר תחילה');
        return;
      }
      
      const { data, error } = await supabase
        .from('groups')
        .insert([{ 
          name: newGroupName,
          owner_id: userData.user.id
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      toast.success('הקבוצה נוצרה בהצלחה');
      onGroupCreated(data);
      setIsOpen(false);
      setNewGroupName("");
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error('שגיאה ביצירת הקבוצה');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          קבוצה חדשה
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-right">יצירת קבוצה חדשה</DialogTitle>
          <DialogDescription className="text-right">
            צור קבוצה חדשה והוסף אליה משתמשים
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-right block">
              שם הקבוצה
            </label>
            <Input
              id="name"
              placeholder="הזן שם לקבוצה"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              className="text-right"
              dir="rtl"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            ביטול
          </Button>
          <Button onClick={handleCreateGroup} disabled={!newGroupName.trim()}>
            צור קבוצה
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
