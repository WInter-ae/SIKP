export interface Member {
  id: string; // keep invitation/team member ids as-is (may include suffixes)
  userId?: string; // actual user id (needed for self-actions and comparisons)
  name: string;
  role: string;
  isLeader?: boolean;
  nim?: string;
  email?: string;
  status?: string;
  memberId?: string; // Member ID untuk respond
  teamId?: string; // Team ID untuk tracking
  invitedAt?: string;
}

export interface MemberListProps {
  title: string;
  members: Member[];
  showActions?: boolean;
  showCancel?: boolean;
  isLeader?: boolean;
  currentUserId?: string;
  onAccept?: (memberId: string) => void;
  onReject?: (memberId: string) => void;
  onRemove?: (memberId: string) => void;
  onCancel?: (memberId: string) => void;
}

export interface Team {
  id: string;
  name: string;
  code: string;
  leaderId: string;
  isLeader?: boolean;
  status?: string;
  members: Member[];
  maxMembers: number;
}

export interface SearchResult {
  id: string;
  name: string;
  nim: string;
  email: string;
}
