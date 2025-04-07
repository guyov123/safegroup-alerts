
import { useState, useEffect, useRef } from 'react';
import { MapUser } from '@/components/map/types';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';
import { calculateDistance, hasPositionChanged } from './map/mapUtils';
import { useRealtimeUpdates } from './map/useRealtimeUpdates';
import { UseMapUsersOptions, UseMapUsersResult, GroupMember } from './map/useMapUsersTypes';

export function useMapUsers(
  currentPosition?: { latitude: number, longitude: number } | null,
  onRealtimeStatusChange?: (status: string) => void
): UseMapUsersResult {
  const [mapUsers, setMapUsers] = useState<MapUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchAttempts, setFetchAttempts] = useState(0);
  
  // Refs for tracking component state and cleanup
  const isMounted = useRef(true);
  const fetchTimeoutRef = useRef<number | null>(null);
  const previousPositionRef = useRef<{ latitude: number, longitude: number } | null>(null);
  const realtimeChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const lastUpdateToast = useRef<string | null>(null);

  // Set up realtime updates
  useRealtimeUpdates(
    { isMounted, fetchTimeoutRef, realtimeChannelRef, lastUpdateToast },
    setMapUsers,
    currentPosition,
    onRealtimeStatusChange
  );
  
  // Fetch group members and set up realtime subscription
  useEffect(() => {
    console.log("useMapUsers effect running, attempt:", fetchAttempts);
    
    // Update the reference to track component mount status
    isMounted.current = true;
    
    // Only refetch if position has changed significantly or it's the first fetch
    if (!hasPositionChanged(currentPosition, previousPositionRef.current) && mapUsers.length > 0 && fetchAttempts > 0) {
      console.log("Skipping fetch because position hasn't changed significantly");
      setIsLoading(false); // Ensure we're not stuck in loading state
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
      // Set loading only on initial fetch or when we have no data
      if (fetchAttempts === 0 || mapUsers.length === 0) {
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
            toast.error("שגיאה בטעינת הקבוצות", { duration: 3000 });
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
            toast.error("שגיאה בטעינת חברי הקבוצה", { duration: 3000 });
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
        
        // Enhanced logging for debugging member data
        console.log("Group members details:", (members as GroupMember[]).map(m => ({ 
          id: m.id, 
          email: m.email, 
          name: m.name,
          authId: m.auth_id 
        })));
        
        // Fetch the latest safety status for each member
        const memberIds = members.map(member => member.id);
        console.log("Fetching safety statuses for member IDs:", memberIds);
        
        const { data: allSafetyStatuses, error: safetyError } = await supabase
          .from('member_safety_status')
          .select('*')
          .in('member_id', memberIds);
          
        if (safetyError) {
          console.error("Error fetching safety statuses:", safetyError);
          if (isMounted.current) {
            setIsLoading(false);
            setError("שגיאה בטעינת נתוני בטיחות");
            toast.error("שגיאה בטעינת נתוני בטיחות", { duration: 3000 });
          }
          return;
        }
        
        console.log("Safety statuses found:", allSafetyStatuses?.length || 0);
        console.log("All safety statuses by member:", allSafetyStatuses);
        
        // Get the latest status for each member by sorting by reported_at and taking first by member_id
        const latestStatusByMember = allSafetyStatuses ? 
          allSafetyStatuses.reduce((acc, status) => {
            // Debug log for specific email
            const relatedMember = members.find(m => m.id === status.member_id);
            if (relatedMember) {
              console.log(`Found status for ${relatedMember.email}:`, status);
                
              // Special debug for Sharon
              if (relatedMember.email.toLowerCase() === 'mrshapron@gmail.com') {
                console.log("Found status record for Sharon:", status);
              }
            }
            
            if (!acc[status.member_id] || new Date(status.reported_at) > new Date(acc[status.member_id].reported_at)) {
              acc[status.member_id] = status;
            }
            return acc;
          }, {} as Record<string, any>) : {};
          
        console.log("Latest statuses by member:", Object.keys(latestStatusByMember).length);
        
        // Transform the data to match the MapUser interface
        const formattedMembers = (members as GroupMember[]).map(member => {
          const latestStatus = latestStatusByMember[member.id];
          
          // Debug information for mrshapron@gmail.com
          if (member.email.toLowerCase() === 'mrshapron@gmail.com') {
            console.log("Formatting member Sharon:", member);
            console.log("Latest status for Sharon:", latestStatus || "No status found");
          }
          
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
            email: member.email,
            status: latestStatus?.status || "unknown" as "safe" | "unknown",
            time: formattedTime,
            lastReported: latestStatus?.reported_at,
            latitude: latestStatus?.latitude,
            longitude: latestStatus?.longitude,
            location: latestStatus?.latitude && latestStatus?.longitude ? 
              `${latestStatus.latitude.toFixed(5)}, ${latestStatus.longitude.toFixed(5)}` : "",
            group: member.groups.name,
            image: "",
            distance: distance ? Number(distance.toFixed(2)) : undefined,
            authId: member.auth_id
          };
        });
        
        console.log("Formatted members:", formattedMembers.length);
        console.log("Formatted members data:", formattedMembers.map(m => 
          ({ id: m.id, name: m.name, email: m.email, status: m.status, hasLocation: Boolean(m.latitude && m.longitude), authId: m.authId })));
        
        if (isMounted.current) {
          setMapUsers(formattedMembers);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error in fetchGroupMembers:", error);
        if (isMounted.current) {
          setError("שגיאה בטעינת הנתונים");
          toast.error("שגיאה בטעינת הנתונים", { duration: 3000 });
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
    
    return () => {
      isMounted.current = false;
      console.log("Cleaning up useMapUsers effect");
      
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
        fetchTimeoutRef.current = null;
      }
    };
  }, [currentPosition, fetchAttempts, mapUsers.length]);

  return { mapUsers, isLoading, error };
}
