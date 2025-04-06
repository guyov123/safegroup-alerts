
import { useState, useEffect } from 'react';
import { MapUser } from '@/components/map/types';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';

// Function to calculate distance between two points in kilometers
const calculateDistance = (
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180; 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c; // Distance in km
};

export function useMapUsers(currentPosition?: { latitude: number, longitude: number } | null) {
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
          console.log("User not authenticated");
          setIsLoading(false);
          return;
        }
        
        console.log("Fetching groups for user ID:", user.id);
        
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
        
        console.log("User groups found:", groups?.length || 0);
        
        if (!groups || groups.length === 0) {
          setMapUsers([]);
          setIsLoading(false);
          return;
        }
        
        // Fetch all members from the user's groups
        const groupIds = groups.map(group => group.id);
        console.log("Fetching members for group IDs:", groupIds);
        
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
        
        console.log("Group members found:", members?.length || 0);
        
        // Fetch the latest safety status for each member
        const memberIds = members.map(member => member.id);
        console.log("Fetching safety statuses for member IDs:", memberIds);
        
        const { data: safetyStatuses, error: safetyError } = await supabase
          .from('member_safety_status')
          .select('*')
          .in('member_id', memberIds)
          .order('reported_at', { ascending: false });
          
        if (safetyError) {
          console.error("Error fetching safety statuses:", safetyError);
          toast.error("שגיאה בטעינת נתוני בטיחות");
          setIsLoading(false);
          return;
        }
        
        console.log("Safety statuses found:", safetyStatuses?.length || 0);
        
        // Get the latest status for each member
        const latestStatusByMember = safetyStatuses ? 
          safetyStatuses.reduce((acc, status) => {
            if (!acc[status.member_id] || new Date(status.reported_at) > new Date(acc[status.member_id].reported_at)) {
              acc[status.member_id] = status;
            }
            return acc;
          }, {} as Record<string, any>) : {};
          
        console.log("Latest statuses by member:", Object.keys(latestStatusByMember).length);
        
        // Transform the data to match the MapUser interface
        const formattedMembers = members.map(member => {
          const latestStatus = latestStatusByMember[member.id];
          let distance: number | undefined = undefined;
          
          // Calculate distance if both positions are available
          if (latestStatus?.latitude && latestStatus?.longitude && currentPosition?.latitude && currentPosition?.longitude) {
            distance = calculateDistance(
              currentPosition.latitude,
              currentPosition.longitude,
              latestStatus.latitude,
              latestStatus.longitude
            );
          }
          
          const formattedTime = latestStatus ? 
            formatDistanceToNow(new Date(latestStatus.reported_at), { addSuffix: true, locale: he }) : "";
          
          return {
            id: member.id,
            name: member.name || member.email,
            status: latestStatus?.status || "unknown" as "safe" | "unknown",
            time: formattedTime,
            lastReported: latestStatus?.reported_at,
            latitude: latestStatus?.latitude,
            longitude: latestStatus?.longitude,
            location: latestStatus?.latitude ? `${latestStatus.latitude.toFixed(5)}, ${latestStatus.longitude.toFixed(5)}` : "",
            group: member.groups.name,
            image: "",
            distance: distance ? Number(distance.toFixed(2)) : undefined
          };
        });
        
        console.log("Formatted members:", formattedMembers.length);
        formattedMembers.forEach(member => {
          console.log(`Member ${member.name} - lat: ${member.latitude}, lng: ${member.longitude}, time: ${member.time}, distance: ${member.distance}`);
        });
        
        setMapUsers(formattedMembers);
        setIsLoading(false);
      } catch (error) {
        console.error("Error:", error);
        toast.error("שגיאה בטעינת הנתונים");
        setIsLoading(false);
      }
    };
    
    fetchGroupMembers();
    
    // Setup real-time listener for safety status updates
    const safetyChannel = supabase
      .channel('member_safety_updates')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'member_safety_status' 
        },
        (payload) => {
          console.log("Safety status updated:", payload);
          fetchGroupMembers();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(safetyChannel);
    };
  }, [currentPosition]);

  return { mapUsers, isLoading };
}
