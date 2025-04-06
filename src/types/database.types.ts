export interface Database {
  public: {
    Tables: {
      groups: {
        Row: {
          id: string;
          created_at: string;
          name: string;
          owner_id: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          name: string;
          owner_id: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          name?: string;
          owner_id?: string;
        };
      };
      group_members: {
        Row: {
          id: string;
          created_at: string;
          name: string | null;
          email: string;
          group_id: string;
          coordinates: [number, number] | null;
          status: 'safe' | 'unknown';
          last_update: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          name?: string | null;
          email: string;
          group_id: string;
          coordinates?: [number, number] | null;
          status?: 'safe' | 'unknown';
          last_update?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          name?: string | null;
          email?: string;
          group_id?: string;
          coordinates?: [number, number] | null;
          status?: 'safe' | 'unknown';
          last_update?: string | null;
        };
      };
    };
  };
} 