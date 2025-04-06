
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
  const [error, setError] = useState<string | null>(null);
  const [fetchAttempts, setFetchAttempts] = useState(0);
  
  // Fetch group members and set up realtime subscription
  useEffect(() => {
    let isMounted = true; // Track if component is mounted
    
    const fetchGroupMembers = async () => {
      // Set loading only on initial fetch
      if (fetchAttempts === 0) {
        setIsLoading(true);
      }
      
      try {
        setError(null);
        console.log(`Fetch attempt ${fetchAttempts + 1}`);
        
        // Check if user is authenticated
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error("Error getting user:", userError);
          if (isMounted) {
            setIsLoading(false);
            setError("שגיאה באימות המשתמש");
            
            // After 3 seconds, reset the error to allow retrying
            setTimeout(() => {
              if (isMounted) {
                setError(null);
                setFetchAttempts(prev => prev + 1);
              }
            }, 3000);
          }
          return;
        }
        
        if (!user) {
          console.log("User not authenticated");
          if (isMounted) {
            setIsLoading(false);
            setMapUsers([]);
          }
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
          if (isMounted) {
            setIsLoading(false);
            setError("שגיאה בטעינת הקבוצות");
            toast.error("שגיאה בטעינת הקבוצות");
          }
          return;
        }
        
        console.log("User groups found:", groups?.length || 0);
        
        if (!groups || groups.length === 0) {
          if (isMounted) {
            setMapUsers([]);
            setIsLoading(false);
          }
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
          if (isMounted) {
            setIsLoading(false);
            setError("שגיאה בטעינת חברי הקבוצה");
            toast.error("שגיאה בטעינת חברי הקבוצה");
          }
          return;
        }
        
        console.log("Group members found:", members?.length || 0);
        
        if (!members || members.length === 0) {
          if (isMounted) {
            setMapUsers([]);
            setIsLoading(false);
          }
          return;
        }
        
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
          if (isMounted) {
            setIsLoading(false);
            setError("שגיאה בטעינת נתוני בטיחות");
            toast.error("שגיאה בטעינת נתוני בטיחות");
          }
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
            console.log(`Distance calculated for ${member.name}: ${distance} km`);
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
        
        if (isMounted) {
          setMapUsers(formattedMembers);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error in fetchGroupMembers:", error);
        if (isMounted) {
          setError("שגיאה בטעינת הנתונים");
          toast.error("שגיאה בטעינת הנתונים");
          setIsLoading(false);
        }
      }
    };
    
    // Initial fetch
    fetchGroupMembers();
    
    // Add a timeout to ensure loading state doesn't get stuck
    const loadingTimeout = setTimeout(() => {
      if (isMounted && isLoading) {
        console.log("Loading timeout reached, resetting loading state");
        setIsLoading(false);
        if (mapUsers.length === 0) {
          setError("לא ניתן היה לטעון את הנתונים");
        }
      }
    }, 10000); // 10 second timeout
    
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
          if (isMounted) {
            toast.success("עדכון סטטוס חדש התקבל");
            fetchGroupMembers(); // Refetch all data when a new status is inserted
          }
        }
      )
      .subscribe((status) => {
        console.log("Realtime subscription status:", status);
      });
      
    return () => {
      isMounted = false;
      console.log("Cleaning up realtime subscription");
      clearTimeout(loadingTimeout);
      supabase.removeChannel(safetyChannel);
    };
  }, [currentPosition, fetchAttempts]);

  return { mapUsers, isLoading, error };
}
