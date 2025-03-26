
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Users, UserPlus, Search, MoreVertical, UserCheck, UserX, Edit } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const Groups = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  
  // Mock data
  const groups = [
    { id: 1, name: "משפחה", members: 4 },
    { id: 2, name: "עבודה", members: 8 },
    { id: 3, name: "חברים", members: 5 },
  ];
  
  // Filtered groups
  const filteredGroups = groups.filter(group => 
    group.name.includes(searchQuery)
  );
  
  const handleCreateGroup = () => {
    // Here would be the logic to create a new group
    console.log("Creating group:", newGroupName);
    setIsCreateGroupOpen(false);
    setNewGroupName("");
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
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredGroups.map(group => (
          <GroupCard key={group.id} group={group} />
        ))}
      </div>
    </div>
  );
};

// Group Card Component
const GroupCard = ({ group }) => {
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");

  // Mock group members
  const members = [
    { id: 1, name: "יעל כהן", email: "yael@example.com", image: "" },
    { id: 2, name: "דני לוי", email: "dani@example.com", image: "" },
    { id: 3, name: "מיכל רבין", email: "michal@example.com", image: "" },
  ];

  const handleAddMember = () => {
    // Logic to add a new member
    console.log("Adding member:", newMemberEmail);
    setIsAddMemberOpen(false);
    setNewMemberEmail("");
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
              <DropdownMenuItem className="text-destructive">
                מחק קבוצה
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <div className="text-right">
            <CardTitle>{group.name}</CardTitle>
            <CardDescription className="mt-1">
              <Badge variant="outline" className="gap-1">
                <Users className="h-3 w-3" />
                {group.members} חברים
              </Badge>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-3">
          {members.slice(0, 3).map(member => (
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
                  <DropdownMenuItem className="text-destructive">
                    <UserX className="mr-2 h-4 w-4" />
                    הסר מהקבוצה
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="font-medium">{member.name}</div>
                  <div className="text-xs text-muted-foreground">{member.email}</div>
                </div>
                <Avatar>
                  <AvatarImage src={member.image} alt={member.name} />
                  <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </div>
            </div>
          ))}
        </div>
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
                הזן את כתובת הדוא"ל של החבר שברצונך להוסיף ל{group.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-right block">
                  כתובת דוא"ל
                </label>
                <Input
                  id="email"
                  placeholder="הזן כתובת דוא״ל"
                  type="email"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
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
      </CardFooter>
    </Card>
  );
};

export default Groups;
