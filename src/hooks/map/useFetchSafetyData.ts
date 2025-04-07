
import { useState, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Hook to fetch safety data for a specific member
 * This hook can be used in the future to fetch individual member data
 */
export function useFetchSafetyData() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSafetyStatusByMember = useCallback(async (memberId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: safetyStatuses, error: fetchError } = await supabase
        .from('member_safety_status')
        .select('*')
        .eq('member_id', memberId)
        .order('reported_at', { ascending: false })
        .limit(1);
        
      if (fetchError) {
        console.error("Error fetching safety status:", fetchError);
        setError("שגיאה בטעינת נתוני בטיחות");
        toast.error("שגיאה בטעינת נתוני בטיחות", { duration: 3000 });
        return null;
      }
      
      return safetyStatuses?.[0] || null;
    } catch (error) {
      console.error("Error in fetchSafetyStatusByMember:", error);
      setError("שגיאה בטעינת הנתונים");
      toast.error("שגיאה בטעינת הנתונים", { duration: 3000 });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    fetchSafetyStatusByMember,
    isLoading,
    error
  };
}
