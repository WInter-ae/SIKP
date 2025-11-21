export interface Member {
  id: number;
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
  onAccept?: (memberId: number) => void;
  onReject?: (memberId: number) => void;
  onRemove?: (memberId: number) => void;
  onCancel?: (memberId: number) => void;
}

export interface Team {
  id: string;
  name: string;
  code: string;
  leaderId: number;
  members: Member[];
  maxMembers: number;
}

export interface SearchResult {
  id: number;
  name: string;
  nim: string;
  email: string;
}
