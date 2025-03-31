
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DeleteGroupDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
  groupName: string;
  onDelete: () => void;
}

export const DeleteGroupDialog = ({ isOpen, onOpenChange, groupId, groupName, onDelete }: DeleteGroupDialogProps) => {
  const handleDeleteGroup = async () => {
    try {
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', groupId);
      
      if (error) throw error;
      
      toast.success('הקבוצה נמחקה בהצלחה');
      onDelete();
    } catch (error) {
      console.error('Error deleting group:', error);
      toast.error('שגיאה במחיקת הקבוצה');
    } finally {
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-right">האם אתה בטוח?</AlertDialogTitle>
          <AlertDialogDescription className="text-right">
            פעולה זו תמחק את הקבוצה "{groupName}" וכל החברים שבה. פעולה זו לא ניתנת לביטול.
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
  );
};
