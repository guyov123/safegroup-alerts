
import { useState, useEffect, useRef } from 'react';
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
  const isMounted = useRef(true);
  const fetchTimeoutRef = useRef<number | null>(null);
  const previousPositionRef = useRef<{ latitude: number, longitude: number } | null>(null);
  const realtimeChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  
  // Check if position has changed significantly
  const hasPositionChanged = (currentPos?: { latitude: number, longitude: number } | null): boolean => {
    if (!currentPos || !previousPositionRef.current) return true;
    
    // Calculate distance between current and previous position
    const distance = calculateDistance(
      previousPositionRef.current.latitude,
      previousPositionRef.current.longitude,
      currentPos.latitude,
      currentPos.longitude
    );
    
    // Return true if moved more than 10 meters
    return distance > 0.01; // 10 meters in km
  };
  
  // Fetch group members and set up realtime subscription
  useEffect(() => {
    console.log("useMapUsers effect running, attempt:", fetchAttempts);
    
    // Update the reference to track component mount status
    isMounted.current = true;
    
    // Only refetch if position has changed significantly or it's the first fetch
    if (!hasPositionChanged(currentPosition) && mapUsers.length > 0 && fetchAttempts > 0) {
      console.log("Skipping fetch because position hasn't changed significantly");
      return;
    }
    
    // Update previous position reference
    if (currentPosition) {
      previousPositionRef.current = { 
        latitude: currentPosition.latitude, 
        longitude: currentPosition.longitude 
      };
    }
    
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
          if (isMounted.current) {
            setIsLoading(false);
            setError("שגיאה באימות המשתמש");
            
            // After 3 seconds, reset the error to allow retrying
            setTimeout(() => {
              if (isMounted.current) {
                setError(null);
                setFetchAttempts(prev => prev + 1);
              }
            }, 3000);
          }
          return;
        }
        
        if (!user) {
          console.log("User not authenticated");
          if (isMounted.current) {
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
          if (isMounted.current) {
            setIsLoading(false);
            setError("שגיאה בטעינת הקבוצות");
            toast.error("שגיאה בטעינת הקבוצות");
          }
          return;
        }
        
        console.log("User groups found:", groups?.length || 0);
        
        if (!groups || groups.length === 0) {
          if (isMounted.current) {
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
          if (isMounted.current) {
            setIsLoading(false);
            setError("שגיאה בטעינת חברי הקבוצה");
            toast.error("שגיאה בטעינת חברי הקבוצה");
          }
          return;
        }
        
        console.log("Group members found:", members?.length || 0);
        
        if (!members || members.length === 0) {
          if (isMounted.current) {
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
          if (isMounted.current) {
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
            location: latestStatus?.latitude && latestStatus?.longitude ? 
              `${latestStatus.latitude.toFixed(5)}, ${latestStatus.longitude.toFixed(5)}` : "",
            group: member.groups.name,
            image: "",
            distance: distance ? Number(distance.toFixed(2)) : undefined
          };
        });
        
        console.log("Formatted members:", formattedMembers.length);
        formattedMembers.forEach(member => {
          console.log(`Member ${member.name} - lat: ${member.latitude}, lng: ${member.longitude}, time: ${member.time}, distance: ${member.distance}`);
        });
        
        if (isMounted.current) {
          setMapUsers(formattedMembers);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error in fetchGroupMembers:", error);
        if (isMounted.current) {
          setError("שגיאה בטעינת הנתונים");
          toast.error("שגיאה בטעינת הנתונים");
          setIsLoading(false);
        }
      }
    };
    
    // Initial fetch
    fetchGroupMembers();
    
    // Add a timeout to ensure loading state doesn't get stuck
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }
    
    fetchTimeoutRef.current = window.setTimeout(() => {
      if (isMounted.current && isLoading) {
        console.log("Loading timeout reached, resetting loading state");
        setIsLoading(false);
        if (mapUsers.length === 0) {
          setError("לא ניתן היה לטעון את הנתונים");
        }
      }
    }, 10000); // 10 second timeout
    
    // Setup real-time listener for safety status updates
    // Clean up any existing subscriptions first
    if (realtimeChannelRef.current) {
      console.log("Cleaning up existing realtime subscription before creating new one");
      supabase.removeChannel(realtimeChannelRef.current);
      realtimeChannelRef.current = null;
    }
    
    const safetyChannel = supabase
      .channel('member_safety_updates')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'member_safety_status' 
        },
        (payload) => {
          console.log("Safety status update received via realtime:", payload);
          const { new: updatedStatus } = payload;
          if (isMounted.current) {
            toast.success("עדכון סטטוס חדש התקבל", {
              description: `עדכון מהמשתמש ID: ${updatedStatus.member_id.substring(0, 8)}...`,
            });
            
            // Don't refetch everything, just update the specific user status
            setMapUsers(prevUsers => {
              const updatedUsers = prevUsers.map(user => {
                if (user.id === updatedStatus.member_id) {
                  // Calculate distance if both positions are available
                  let distance = user.distance;
                  if (updatedStatus.latitude && updatedStatus.longitude && currentPosition?.latitude && currentPosition?.longitude) {
                    distance = calculateDistance(
                      currentPosition.latitude,
                      currentPosition.longitude,
                      updatedStatus.latitude,
                      updatedStatus.longitude
                    );
                    distance = Number(distance.toFixed(2));
                  }
                  
                  const formattedTime = formatDistanceToNow(new Date(updatedStatus.reported_at), { addSuffix: true, locale: he });
                  
                  console.log(`Updating user ${user.name} with new status:`, {
                    status: updatedStatus.status,
                    time: formattedTime,
                    lastReported: updatedStatus.reported_at,
                    latitude: updatedStatus.latitude,
                    longitude: updatedStatus.longitude,
                    distance
                  });
                  
                  return {
                    ...user,
                    status: updatedStatus.status as "safe" | "unknown",
                    time: formattedTime,
                    lastReported: updatedStatus.reported_at,
                    latitude: updatedStatus.latitude,
                    longitude: updatedStatus.longitude,
                    location: updatedStatus.latitude && updatedStatus.longitude ?
                      `${updatedStatus.latitude.toFixed(5)}, ${updatedStatus.longitude.toFixed(5)}` : "",
                    distance
                  };
                }
                return user;
              });
              
              console.log("Updated users after realtime update:", updatedUsers.length);
              return updatedUsers;
            });
          }
        }
      )
      .subscribe((status) => {
        console.log("Realtime subscription status:", status);
        
        if (status === 'SUBSCRIBED') {
          console.log("✅ Successfully subscribed to realtime updates");
          toast.success("מחובר לעדכונים בזמן אמת");
        } else if (status === 'CHANNEL_ERROR') {
          console.error("❌ Error subscribing to realtime updates");
          toast.error("שגיאה בחיבור לעדכונים בזמן אמת");
        } else if (status === 'TIMED_OUT') {
          console.error("⏱️ Realtime subscription timed out");
          toast.error("פסק זמן בחיבור לעדכונים בזמן אמת");
        }
      });
    
    // Store the channel reference so we can clean it up later
    realtimeChannelRef.current = safetyChannel;
      
    return () => {
      isMounted.current = false;
      console.log("Cleaning up realtime subscription");
      
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
        fetchTimeoutRef.current = null;
      }
      
      if (realtimeChannelRef.current) {
        console.log("Removing realtime channel on unmount");
        supabase.removeChannel(realtimeChannelRef.current);
        realtimeChannelRef.current = null;
      }
    };
  }, [currentPosition, fetchAttempts]);

  return { mapUsers, isLoading, error };
}
