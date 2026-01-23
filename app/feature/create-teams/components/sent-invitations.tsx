import { useState } from "react";
import { cancelInvitation } from "../services/team-api";
import type { Member } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { XCircle, Mail, Loader2 } from "lucide-react";

interface SentInvitationsProps {
  members?: Member[];
  onRefresh?: () => void;
}

export function SentInvitations({ members = [], onRefresh }: SentInvitationsProps) {
  const [cancelingId, setCancelingId] = useState<string | null>(null);

  // Debug log
  console.log("SentInvitations - members:", members);

  const handleCancelInvitation = async (memberId: string, memberName: string) => {
    // Show confirmation dialog
    if (!window.confirm(`Yakin ingin membatalkan undangan untuk ${memberName}?`)) {
      return;
    }

    console.log("🚫 Canceling invitation:", { memberId, memberName });

    try {
      setCancelingId(memberId);

      const response = await cancelInvitation(memberId);

      console.log("📡 Cancel invitation response:", response);

      if (response.success) {
        alert(`✅ Undangan untuk ${memberName} berhasil dibatalkan`);

        // Trigger refresh callback
        if (onRefresh) {
          console.log("🔄 Refreshing team data...");
          onRefresh();
        }
      } else {
        alert(`❌ Gagal membatalkan undangan: ${response.message}`);
        console.error("Cancel failed:", response);
      }
    } catch (error: any) {
      alert(
        `❌ Error: ${error?.message || "Terjadi kesalahan saat membatalkan undangan"}`
      );
      console.error("Cancel invitation error:", error);
    } finally {
      setCancelingId(null);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base font-semibold">
            Undangan yang Dikirim
          </CardTitle>
          <Badge variant="outline" className="ml-2">
            {members.length}/3
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {members.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Mail className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
            <p>Belum ada undangan yang dikirim</p>
          </div>
        ) : (
          <div className="space-y-3">
            {members.map((invitation, index) => (
              <div
                key={invitation.id}
                className="flex justify-between items-center p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  {/* Member Number Badge */}
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-muted font-semibold text-sm">
                    {index + 1}
                  </div>

                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                      {invitation.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-foreground">
                        {invitation.name}
                      </div>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        PENDING
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <span>{invitation.nim}</span>
                      {invitation.email && <span> • {invitation.email}</span>}
                    </div>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() =>
                    handleCancelInvitation(invitation.id, invitation.name)
                  }
                  disabled={cancelingId === invitation.id}
                >
                  {cancelingId === invitation.id ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      Membatalkan...
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 mr-1" />
                      Batalkan
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
