export interface Member {
  id: string; // keep invitation/team member ids as-is (may include suffixes)
  name: string;
  role: string;
  isLeader?: boolean;
  nim?: string;
  email?: string;
}

export interface MemberListProps {
  title: string;
  members: Member[];
  showActions?: boolean;
  showCancel?: boolean;
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
  members: Member[];
  maxMembers: number;
}

export interface SearchResult {
  id: string;
  name: string;
  nim: string;
  email: string;
}
