
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Group } from "@/components/groups/types";
import { GroupCard } from "@/components/groups/GroupCard";
import { CreateGroupDialog } from "@/components/groups/CreateGroupDialog";
import { EmptyGroupsState } from "@/components/groups/EmptyGroupsState";

const Groups = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  
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
  
  const filteredGroups = groups.filter(group => 
    group.name.includes(searchQuery)
  );
  
  const handleGroupCreated = (newGroup: Group) => {
    setGroups(prevGroups => [newGroup, ...prevGroups]);
  };
  
  return (
    <div className="container max-w-5xl px-4 py-6 md:py-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-right">הקבוצות שלי</h1>
          <p className="text-muted-foreground text-right">נהל את קבוצות ההתראות שלך</p>
        </div>
        
        <CreateGroupDialog onGroupCreated={handleGroupCreated} />
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
        <EmptyGroupsState 
          onCreateClick={() => setIsCreateGroupOpen(true)} 
          isSearching={searchQuery.length > 0}
        />
      )}
    </div>
  );
};

export default Groups;
