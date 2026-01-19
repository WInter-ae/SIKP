import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

import type { MemberListProps } from "../types";
import { Users, Check, X, LogOut, XCircle, Crown } from "lucide-react";

function MemberList({
  title,
  members,
  showActions = false,
  showCancel = false,
  onAccept,
  onReject,
  onRemove,
  onCancel,
}: MemberListProps) {
  console.log("🔄 MemberList rendering:", {
    title,
    memberCount: members.length,
    members: members.map(m => ({ name: m.name, role: m.role }))
  });

  // Sort members: leader first, then by index
  const sortedMembers = [...members].sort((a, b) => {
    if (a.isLeader) return -1;
    if (b.isLeader) return 1;
    return 0;
  });

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          <Badge variant="outline" className="ml-2">
            {members.length}/3
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {members.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
            <p>Tidak ada anggota</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedMembers.map((member, index) => (
              <div
                key={member.id}
                className="flex justify-between items-center p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  {/* Member Number Badge */}
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-muted font-semibold text-sm">
                    {index + 1}/3
                  </div>

                  <Avatar className="h-10 w-10">
                    <AvatarFallback
                      className={`font-bold ${
                        member.isLeader
                          ? "bg-yellow-500 text-white"
                          : "bg-primary text-primary-foreground"
                      }`}
                    >
                      {member.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-foreground">
                        {member.name}
                      </div>
                      {member.isLeader && (
                        <Crown className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <span>{member.role}</span>
                      {member.nim && <span> • {member.nim}</span>}
                      {member.email && <span> • {member.email}</span>}
                    </div>
                  </div>
                </div>

                {showActions && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => onAccept?.(member.id)}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Terima
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onReject?.(member.id)}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Tolak
                    </Button>
                  </div>
                )}

                {showCancel && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onCancel?.(member.id)}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Batalkan
                  </Button>
                )}

                {!showActions && !showCancel && !member.isLeader && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onRemove?.(member.id)}
                  >
                    <LogOut className="h-4 w-4 mr-1" />
                    Keluarkan
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default MemberList;
