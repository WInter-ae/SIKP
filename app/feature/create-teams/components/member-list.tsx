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
  isLeader = false,
  currentUserId,
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
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <span>{member.role}</span>
                      {member.nim && <span>• {member.nim}</span>}
                      {member.email && <span>• {member.email}</span>}
                      {member.status && (!isLeader || member.status !== "PENDING") && (
                        <Badge
                          variant="outline"
                          className={
                            member.status === "PENDING"
                              ? "border-amber-200 text-amber-700 bg-amber-50"
                              : member.status === "REJECTED" || member.status === "DITOLAK"
                              ? "border-red-200 text-red-700 bg-red-50"
                              : member.status === "ACCEPTED" || member.status === "DITERIMA"
                              ? "border-green-200 text-green-700 bg-green-50"
                              : ""
                          }
                        >
                          {member.status}
                        </Badge>
                      )}
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

                {!showActions && !showCancel && !member.isLeader && onRemove && 
                  (isLeader || member.userId === currentUserId) && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onRemove?.(member.id)}
                  >
                    <LogOut className="h-4 w-4 mr-1" />
                    {/* Jika user adalah anggota dan melihat diri sendiri, tampilkan 'Keluar' */}
                    {/* Jika user adalah ketua dan melihat anggota lain, tampilkan 'Keluarkan' */}
                    {!isLeader && member.userId === currentUserId ? "Keluar" : "Keluarkan"}
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
