import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { History, FileText, Upload, Eye, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import type { HistoryRevisi } from "../types";

interface RevisiHistoryProps {
  history: HistoryRevisi[];
}

export function RevisiHistory({ history }: RevisiHistoryProps) {
  const getActionIcon = (action: string) => {
    switch (action) {
      case "dibuat":
        return <FileText className="h-4 w-4" />;
      case "diupload":
        return <Upload className="h-4 w-4" />;
      case "direview":
        return <Eye className="h-4 w-4" />;
      case "disetujui":
        return <CheckCircle className="h-4 w-4" />;
      case "ditolak":
        return <XCircle className="h-4 w-4" />;
      case "direvisi":
        return <RefreshCw className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "dibuat":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "diupload":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "direview":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "disetujui":
        return "bg-green-100 text-green-700 border-green-200";
      case "ditolak":
        return "bg-red-100 text-red-700 border-red-200";
      case "direvisi":
        return "bg-orange-100 text-orange-700 border-orange-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "mahasiswa":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "dosen":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "sistem":
        return "bg-gray-50 text-gray-700 border-gray-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Riwayat Revisi
          </CardTitle>
          <CardDescription>Belum ada riwayat aktivitas</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Riwayat Revisi
        </CardTitle>
        <CardDescription>
          Timeline aktivitas revisi kerja praktik
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-4">
          {/* Timeline Line */}
          <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-border" />

          {/* History Items */}
          {history.map((item, index) => (
            <div key={item.id} className="relative flex gap-4 group">
              {/* Timeline Dot */}
              <div className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 ${getActionColor(item.action)}`}>
                {getActionIcon(item.action)}
              </div>

              {/* Content */}
              <div className="flex-1 pb-4">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium capitalize">
                        {item.action.replace(/_/g, " ")}
                      </p>
                      <Badge variant="outline" className={`text-xs ${getRoleColor(item.actor.role)}`}>
                        {item.actor.role}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {item.deskripsi}
                    </p>
                    {item.details && Object.keys(item.details).length > 0 && (
                      <div className="mt-2 p-3 bg-muted rounded-md">
                        <p className="text-xs font-medium mb-2">Detail:</p>
                        <div className="space-y-1">
                          {Object.entries(item.details).map(([key, value]) => (
                            <div key={key} className="flex gap-2 text-xs">
                              <span className="text-muted-foreground capitalize">
                                {key.replace(/_/g, " ")}:
                              </span>
                              <span className="font-medium">{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{formatDateTime(item.timestamp)}</p>
                    <p className="text-xs font-medium mt-1">{item.actor.nama}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
