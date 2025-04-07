
import { MapUser } from "@/components/map/types";
import { type RealtimeChannel } from "@supabase/supabase-js";

export interface GroupMember {
  id: string;
  group_id: string;
  email: string;
  name: string | null;
  created_at: string;
  auth_id: string | null;
  groups: {
    name: string;
  };
}

export interface UseMapUsersResult {
  mapUsers: MapUser[];
  isLoading: boolean;
  error: string | null;
}

export interface UseMapUsersOptions {
  currentPosition?: { latitude: number, longitude: number } | null;
  onRealtimeStatusChange?: (status: string) => void;
}

export interface RealtimeRefs {
  isMounted: React.MutableRefObject<boolean>;
  fetchTimeoutRef: React.MutableRefObject<number | null>;
  realtimeChannelRef: React.MutableRefObject<RealtimeChannel | null>;
  lastUpdateToast: React.MutableRefObject<string | null>;
}
