
import { useState, useEffect } from 'react';
import { MapUser } from '@/components/map/types';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useMapUsers() {
  const [mapUsers, setMapUsers] = useState<MapUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch group members
  useEffect(() => {
    const fetchGroupMembers = async () => {
      try {
        setIsLoading(true);
        
        // Check if user is authenticated
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setIsLoading(false);
          return;
        }
        
        // Fetch groups that belong to the current user
        const { data: groups, error: groupsError } = await supabase
          .from('groups')
          .select('id, name')
          .eq('owner_id', user.id);
          
        if (groupsError) {
          console.error("Error fetching groups:", groupsError);
          toast.error("שגיאה בטעינת הקבוצות");
          setIsLoading(false);
          return;
        }
        
        if (!groups || groups.length === 0) {
          setMapUsers([]);
          setIsLoading(false);
          return;
        }
        
        // Fetch all members from the user's groups
        const groupIds = groups.map(group => group.id);
        
        const { data: members, error: membersError } = await supabase
          .from('group_members')
          .select('*, groups!inner(name)')
          .in('group_id', groupIds);
          
        if (membersError) {
          console.error("Error fetching group members:", membersError);
          toast.error("שגיאה בטעינת חברי הקבוצה");
          setIsLoading(false);
          return;
        }
        
        // Transform the data to match the MapUser interface
        const formattedMembers = members.map(member => ({
          id: member.id,
          name: member.name || member.email,
          status: "safe" as "safe" | "unknown",
          time: "",
          location: "",
          group: member.groups.name,
          image: ""
        }));
        
        setMapUsers(formattedMembers);
        setIsLoading(false);
      } catch (error) {
        console.error("Error:", error);
        toast.error("שגיאה בטעינת הנתונים");
        setIsLoading(false);
      }
    };
    
    fetchGroupMembers();
  }, []);

  return { mapUsers, isLoading };
}
