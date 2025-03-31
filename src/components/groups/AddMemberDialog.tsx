
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { GroupMember } from "./types";

interface AddMemberDialogProps {
  groupId: string;
  groupName: string;
  members: GroupMember[];
  onMemberAdded: (newMember: GroupMember) => void;
}

export const AddMemberDialog = ({ groupId, groupName, members, onMemberAdded }: AddMemberDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberName, setNewMemberName] = useState("");
  const [checkingEmail, setCheckingEmail] = useState(false);

  const handleAddMember = async () => {
    if (!newMemberEmail.trim()) return;
    
    try {
      setCheckingEmail(true);
      
      const existingMember = members.find(member => 
        member.email.toLowerCase() === newMemberEmail.toLowerCase()
      );
      
      if (existingMember) {
        toast.error('כתובת האימייל כבר קיימת בקבוצה');
        setCheckingEmail(false);
        return;
      }
      
      // Check if user exists in the auth system
      const { data: emailCheckData, error: emailCheckError } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', newMemberEmail)
        .maybeSingle();
        
      if (emailCheckError) {
        console.error('Error checking if user exists:', emailCheckError);
        throw emailCheckError;
      }
      
      if (!emailCheckData) {
        toast.error('משתמש עם כתובת אימייל זו אינו קיים במערכת');
        setCheckingEmail(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('group_members')
        .insert([{ 
          group_id: groupId, 
          email: newMemberEmail,
          name: newMemberName.trim() || null
        }])
        .select()
        .single();
      
      if (error) {
        if (error.code === '23505') {
          toast.error('כתובת האימייל כבר קיימת בקבוצה');
        } else {
          throw error;
        }
      } else {
        toast.success('המשתמש נוסף לקבוצה בהצלחה');
        onMemberAdded(data);
        setIsOpen(false);
        setNewMemberEmail("");
        setNewMemberName("");
      }
    } catch (error) {
      console.error('Error adding member:', error);
      toast.error('שגיאה בהוספת המשתמש לקבוצה');
    } finally {
      setCheckingEmail(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full" size="sm">
          <UserPlus className="mr-2 h-4 w-4" />
          הוסף חבר לקבוצה
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-right">הוספת חבר לקבוצה</DialogTitle>
          <DialogDescription className="text-right">
            הזן את פרטי החבר שברצונך להוסיף ל{groupName}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-right block">
              כתובת דוא"ל *
            </Label>
            <Input
              id="email"
              placeholder="הזן כתובת דוא״ל"
              type="email"
              value={newMemberEmail}
              onChange={(e) => setNewMemberEmail(e.target.value)}
              className="text-right"
              dir="rtl"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name" className="text-right block">
              שם (אופציונלי)
            </Label>
            <Input
              id="name"
              placeholder="הזן שם"
              type="text"
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              className="text-right"
              dir="rtl"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            ביטול
          </Button>
          <Button 
            onClick={handleAddMember} 
            disabled={!newMemberEmail.trim() || checkingEmail}
          >
            {checkingEmail ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                בודק...
              </>
            ) : (
              'הוסף'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
