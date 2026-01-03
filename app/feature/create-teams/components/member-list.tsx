import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

import type { MemberListProps } from "../types";
import { Users, Check, X, LogOut, XCircle } from "lucide-react";

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
  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {members.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
            <p>Tidak ada anggota</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {members.map((member) => (
              <li
                key={member.id}
                className="flex justify-between items-center py-3 border-b last:border-b-0"
              >
                <div className="flex items-center">
                  <Avatar className="h-10 w-10 mr-4">
                    <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                      {member.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-foreground">{member.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {member.role}
                      {member.nim && ` • ${member.nim}`}
                    </div>
                  </div>
                </div>

                {showActions && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
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
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export default MemberList;
