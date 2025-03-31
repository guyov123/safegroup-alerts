
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, UserPlus, MoreVertical, UserCheck, UserX, Edit, Trash2, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { GroupMember, Group } from "./types";
import { GroupMemberItem } from "./GroupMemberItem";

interface GroupCardProps {
  group: Group;
  onDelete: () => void;
}

export const GroupCard = ({ group, onDelete }: GroupCardProps) => {
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberName, setNewMemberName] = useState("");
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingEmail, setCheckingEmail] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, [group.id]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('group_members')
        .select('*')
        .eq('group_id', group.id)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      setMembers(data || []);
    } catch (error) {
      console.error('Error fetching group members:', error);
      toast.error('שגיאה בטעינת חברי הקבוצה');
    } finally {
      setLoading(false);
    }
  };

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
      
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error("Error checking user:", userError);
      }
      
      // Since we don't have direct access to all users, we'll need a different approach
      // We'll rely on the backend to validate if the user exists and return appropriate errors
      
      const { data, error } = await supabase
        .from('group_members')
        .insert([{ 
          group_id: group.id, 
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
        setMembers(prevMembers => [...prevMembers, data]);
        setIsAddMemberOpen(false);
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

  const handleRemoveMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('id', memberId);
      
      if (error) throw error;
      
      setMembers(prevMembers => prevMembers.filter(member => member.id !== memberId));
      toast.success('המשתמש הוסר מהקבוצה');
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('שגיאה בהסרת המשתמש מהקבוצה');
    }
  };

  const handleDeleteGroup = async () => {
    try {
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', group.id);
      
      if (error) throw error;
      
      toast.success('הקבוצה נמחקה בהצלחה');
      onDelete();
    } catch (error) {
      console.error('Error deleting group:', error);
      toast.error('שגיאה במחיקת הקבוצה');
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">פתח תפריט</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                ערוך קבוצה
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive" 
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                מחק קבוצה
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <div className="text-right">
            <CardTitle>{group.name}</CardTitle>
            <CardDescription className="mt-1">
              <Badge variant="outline" className="gap-1">
                <Users className="h-3 w-3" />
                {members.length} חברים
              </Badge>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : members.length > 0 ? (
          <div className="space-y-3">
            {members.map(member => (
              <GroupMemberItem 
                key={member.id} 
                member={member} 
                onRemove={handleRemoveMember} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-2 text-sm text-muted-foreground">
            אין חברים בקבוצה זו
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-2">
        <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
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
                הזן את פרטי החבר שברצונך להוסיף ל{group.name}
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
              <Button variant="outline" onClick={() => setIsAddMemberOpen(false)}>
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

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-right">האם אתה בטוח?</AlertDialogTitle>
              <AlertDialogDescription className="text-right">
                פעולה זו תמחק את הקבוצה "{group.name}" וכל החברים שבה. פעולה זו לא ניתנת לביטול.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex flex-row-reverse justify-start">
              <AlertDialogAction onClick={handleDeleteGroup} className="bg-destructive hover:bg-destructive/90">
                מחק
              </AlertDialogAction>
              <AlertDialogCancel>ביטול</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
};
