
export interface Group {
  id: string;
  name: string;
  created_at: string;
  owner_id: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  email: string;
  name: string | null;
  created_at: string;
}
