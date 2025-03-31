
import { Button } from "@/components/ui/button";
import { CardTitle, CardDescription, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, Users, Edit, Trash2 } from "lucide-react";

interface GroupCardHeaderProps {
  name: string;
  memberCount: number;
  onDeleteClick: () => void;
}

export const GroupCardHeader = ({ name, memberCount, onDeleteClick }: GroupCardHeaderProps) => {
  return (
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
              onClick={onDeleteClick}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              מחק קבוצה
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <div className="text-right">
          <CardTitle>{name}</CardTitle>
          <CardDescription className="mt-1">
            <Badge variant="outline" className="gap-1">
              <Users className="h-3 w-3" />
              {memberCount} חברים
            </Badge>
          </CardDescription>
        </div>
      </div>
    </CardHeader>
  );
};
