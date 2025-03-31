
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Users, UserPlus, Search, MoreVertical, UserCheck, UserX, Edit, Trash2, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Define types for our data
interface Group {
  id: string;
  name: string;
  created_at: string;
}

interface GroupMember {
  id: string;
  group_id: string;
  email: string;
  name: string | null;
  created_at: string;
}

const Groups = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch groups on component mount
  useEffect(() => {
    fetchGroups();
  }, []);
  
  const fetchGroups = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setGroups(data || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast.error('שגיאה בטעינת הקבוצות');
    } finally {
      setLoading(false);
    }
  };
  
  // Filtered groups based on search query
  const filteredGroups = groups.filter(group => 
    group.name.includes(searchQuery)
  );
  
  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    
    try {
      const { data, error } = await supabase
        .from('groups')
        .insert([{ name: newGroupName }])
        .select()
        .single();
      
      if (error) throw error;
      
      toast.success('הקבוצה נוצרה בהצלחה');
      setGroups(prevGroups => [data, ...prevGroups]);
      setIsCreateGroupOpen(false);
      setNewGroupName("");
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error('שגיאה ביצירת הקבוצה');
    }
  };
  
  return (
    <div className="container max-w-5xl px-4 py-6 md:py-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-right">הקבוצות שלי</h1>
          <p className="text-muted-foreground text-right">נהל את קבוצות ההתראות שלך</p>
        </div>
        
        <Dialog open={isCreateGroupOpen} onOpenChange={setIsCreateGroupOpen}>
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
              <Button variant="outline" onClick={() => setIsCreateGroupOpen(false)}>
                ביטול
              </Button>
              <Button onClick={handleCreateGroup} disabled={!newGroupName.trim()}>
                צור קבוצה
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="חפש קבוצות..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="pl-10 text-right"
          dir="rtl"
        />
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredGroups.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredGroups.map(group => (
            <GroupCard key={group.id} group={group} onDelete={fetchGroups} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <h3 className="text-lg font-medium">אין קבוצות</h3>
          <p className="text-muted-foreground mb-4">טרם יצרת קבוצות או לא נמצאו תוצאות לחיפוש שלך</p>
          <Button onClick={() => setIsCreateGroupOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            צור קבוצה חדשה
          </Button>
        </div>
      )}
    </div>
  );
};

// Group Card Component
const GroupCard = ({ group, onDelete }: { group: Group, onDelete: () => void }) => {
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberName, setNewMemberName] = useState("");
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

  const handleAddMember = async () => {
    if (!newMemberEmail.trim()) return;
    
    try {
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

  const getInitials = (name: string | null) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
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
              <div key={member.id} className="flex items-center justify-between">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">פתח תפריט</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <UserCheck className="mr-2 h-4 w-4" />
                      שלח תזכורת
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-destructive"
                      onClick={() => handleRemoveMember(member.id)}
                    >
                      <UserX className="mr-2 h-4 w-4" />
                      הסר מהקבוצה
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-medium">{member.name || "משתמש"}</div>
                    <div className="text-xs text-muted-foreground">{member.email}</div>
                  </div>
                  <Avatar>
                    <AvatarImage src="" alt={member.name || "משתמש"} />
                    <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                  </Avatar>
                </div>
              </div>
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
              <Button onClick={handleAddMember} disabled={!newMemberEmail.trim()}>
                הוסף
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

export default Groups;
