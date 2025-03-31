
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { UserCheck, UserX, MoreVertical } from "lucide-react";
import { GroupMember } from "./types";

interface GroupMemberItemProps {
  member: GroupMember;
  onRemove: (memberId: string) => void;
}

export const GroupMemberItem = ({ member, onRemove }: GroupMemberItemProps) => {
  const getInitials = (name: string | null) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <div className="flex items-center justify-between">
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
            onClick={() => onRemove(member.id)}
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
  );
};
