
import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { GroupMember, Group } from "./types";
import { GroupMemberItem } from "./GroupMemberItem";
import { AddMemberDialog } from "./AddMemberDialog";
import { DeleteGroupDialog } from "./DeleteGroupDialog";
import { GroupCardHeader } from "./GroupCardHeader";

interface GroupCardProps {
  group: Group;
  onDelete: () => void;
}

export const GroupCard = ({ group, onDelete }: GroupCardProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);

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

  const handleAddMember = (newMember: GroupMember) => {
    setMembers(prevMembers => [...prevMembers, newMember]);
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

  return (
    <Card>
      <GroupCardHeader 
        name={group.name} 
        memberCount={members.length} 
        onDeleteClick={() => setIsDeleteDialogOpen(true)} 
      />
      
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
        <AddMemberDialog 
          groupId={group.id}
          groupName={group.name}
          members={members}
          onMemberAdded={handleAddMember}
        />

        <DeleteGroupDialog 
          isOpen={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          groupId={group.id}
          groupName={group.name}
          onDelete={onDelete}
        />
      </CardFooter>
    </Card>
  );
};
