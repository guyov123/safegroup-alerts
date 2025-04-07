
import { useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';
import { MapUser } from "@/components/map/types";
import { RealtimeRefs } from './useMapUsersTypes';
import { calculateDistance } from './mapUtils';

export function useRealtimeUpdates(
  realtimeRefs: RealtimeRefs,
  setMapUsers: React.Dispatch<React.SetStateAction<MapUser[]>>,
  currentPosition?: { latitude: number, longitude: number } | null,
  onRealtimeStatusChange?: (status: string) => void
) {
  useEffect(() => {
    // Clean up any existing subscriptions first
    if (realtimeRefs.realtimeChannelRef.current) {
      console.log("Cleaning up existing realtime subscription before creating new one");
      supabase.removeChannel(realtimeRefs.realtimeChannelRef.current);
      realtimeRefs.realtimeChannelRef.current = null;
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
          
          if (realtimeRefs.isMounted.current) {
            // Find the member this update is for
            const updatedMemberId = updatedStatus.member_id;
            
            // Only show update toast if we haven't shown one for this member in the last 5 seconds
            const now = Date.now();
            const memberId = updatedMemberId.substring(0, 8);
            
            if (!realtimeRefs.lastUpdateToast.current || now - parseInt(realtimeRefs.lastUpdateToast.current.split('-')[1] || '0') > 5000) {
              toast.success("עדכון סטטוס חדש התקבל", {
                description: `עדכון מהמשתמש ID: ${memberId}...`,
                duration: 3000
              });
              realtimeRefs.lastUpdateToast.current = `${memberId}-${now}`;
            }
            
            // Find the member in our existing list
            setMapUsers(prevUsers => {
              // Find the user this update is for
              const userIndex = prevUsers.findIndex(user => user.id === updatedMemberId);
              
              if (userIndex === -1) {
                console.log(`User with ID ${updatedMemberId} not found in current list`);
                return prevUsers;
              }
              
              // Calculate distance if both positions are available
              let distance = prevUsers[userIndex].distance;
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
              
              // Deep debug for Sharon's updates
              if (prevUsers[userIndex].email?.toLowerCase() === 'mrshapron@gmail.com' || prevUsers[userIndex].name.includes('שרון')) {
                console.log("Realtime update for Sharon:", {
                  before: prevUsers[userIndex],
                  newStatus: updatedStatus
                });
              }
              
              console.log(`Updating user ${prevUsers[userIndex].name} with new status:`, {
                status: updatedStatus.status,
                time: formattedTime,
                lastReported: updatedStatus.reported_at,
                latitude: updatedStatus.latitude,
                longitude: updatedStatus.longitude,
                distance
              });
              
              const updatedUsers = [...prevUsers];
              updatedUsers[userIndex] = {
                ...updatedUsers[userIndex],
                status: updatedStatus.status as "safe" | "unknown",
                time: formattedTime,
                lastReported: updatedStatus.reported_at,
                latitude: updatedStatus.latitude,
                longitude: updatedStatus.longitude,
                location: updatedStatus.latitude && updatedStatus.longitude ?
                  `${updatedStatus.latitude.toFixed(5)}, ${updatedStatus.longitude.toFixed(5)}` : "",
                distance
              };
              
              return updatedUsers;
            });
          }
        }
      )
      .subscribe((status) => {
        console.log("Realtime subscription status:", status);
        
        // Provide status to parent component
        if (onRealtimeStatusChange) {
          onRealtimeStatusChange(status);
        }
      });
    
    // Store the channel reference so we can clean it up later
    realtimeRefs.realtimeChannelRef.current = safetyChannel;
    
    return () => {
      if (realtimeRefs.realtimeChannelRef.current) {
        console.log("Removing realtime channel on unmount");
        supabase.removeChannel(realtimeRefs.realtimeChannelRef.current);
        realtimeRefs.realtimeChannelRef.current = null;
      }
    };
  }, [currentPosition, setMapUsers, onRealtimeStatusChange, realtimeRefs]);
}
