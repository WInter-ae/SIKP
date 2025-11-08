export interface Member {
  id: number;
  name: string;
  role: string;
  isLeader?: boolean;
}

export interface MemberListProps {
  title: string;
  members: Member[];
  showActions?: boolean;
}
