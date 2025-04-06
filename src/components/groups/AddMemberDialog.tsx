
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
      
      // Check if the email already exists in this group
      const existingMember = members.find(member => 
        member.email.toLowerCase() === newMemberEmail.toLowerCase()
      );
      
      if (existingMember) {
        toast.error('כתובת האימייל כבר קיימת בקבוצה');
        setCheckingEmail(false);
        return;
      }
      
      // Validate email format
      const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newMemberEmail);
      
      if (!isValidEmail) {
        toast.error('כתובת האימייל אינה תקינה');
        setCheckingEmail(false);
        return;
      }
      
      // First check if this user already exists in any group by email
      // This helps ensure consistent member_id across groups
      const { data: existingMemberInOtherGroups, error: searchError } = await supabase
        .from('group_members')
        .select('id, name')
        .eq('email', newMemberEmail.toLowerCase())
        .limit(1);
      
      if (searchError) {
        console.error("Error checking for existing member:", searchError);
        throw new Error(searchError.message);
      }
      
      // Insert new member, using existing ID if available
      const memberToInsert = {
        group_id: groupId,
        email: newMemberEmail.toLowerCase(), // Store emails in lowercase for consistency
        name: newMemberName.trim() || null
      };
      
      // If member exists in another group, use their existing ID
      if (existingMemberInOtherGroups && existingMemberInOtherGroups.length > 0) {
        console.log("Found existing member in other groups:", existingMemberInOtherGroups[0]);
        // We'll use the existing name if a new one wasn't provided
        if (!memberToInsert.name && existingMemberInOtherGroups[0].name) {
          memberToInsert.name = existingMemberInOtherGroups[0].name;
        }
      }
      
      // Insert the member into the database
      const { data, error } = await supabase
        .from('group_members')
        .insert([memberToInsert])
        .select()
        .single();
      
      if (error) {
        if (error.code === '23505') {
          toast.error('כתובת האימייל כבר קיימת בקבוצה');
        } else {
          throw error;
        }
      } else {
        console.log("Successfully added member:", data);
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
