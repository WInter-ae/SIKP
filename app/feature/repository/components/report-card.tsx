import {
  Calendar,
  Building2,
  User,
  Eye,
  Download,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import type { ReportCardProps } from "../types";

export function ReportCard({ report, onClick }: ReportCardProps) {
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-200 text-gray-700";
      case "review":
        return "bg-yellow-200 text-yellow-800";
      case "approved":
        return "bg-blue-200 text-blue-800";
      case "published":
        return "bg-green-200 text-green-800";
      default:
        return "bg-gray-200 text-gray-700";
    }
  };

  return (
    <Card
      className="hover:shadow-lg transition-shadow cursor-pointer group"
      onClick={() => onClick(report.id)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-gray-900 group-hover:text-green-700 transition-colors line-clamp-2">
              {report.title}
            </h3>
            <Badge className={`mt-2 ${getStatusBadgeColor(report.status)}`}>
              {report.status}
            </Badge>
          </div>
          {report.thumbnailUrl && (
            <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
              <img
                src={report.thumbnailUrl}
                alt={report.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Student */}
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={report.student.photo} alt={report.student.name} />
            <AvatarFallback className="text-xs">
              {report.student.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {report.student.name}
            </p>
            <p className="text-xs text-gray-500">{report.student.studentId}</p>
          </div>
        </div>

        {/* Company */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Building2 className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">{report.company}</span>
        </div>

        {/* Supervisor */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">{report.supervisor.name}</span>
        </div>

        {/* Year & Semester */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4 flex-shrink-0" />
          <span>
            {report.year} - {report.semester}
          </span>
        </div>

        {/* Category */}
        <div className="flex flex-wrap gap-1">
          <Badge variant="outline" className="text-xs">
            {report.category}
          </Badge>
          {report.tags?.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {report.tags && report.tags.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{report.tags.length - 2}
            </Badge>
          )}
        </div>

        {/* Abstract */}
        <p className="text-sm text-gray-600 line-clamp-2">{report.abstract}</p>

        {/* Stats */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              <span>{report.viewCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <Download className="h-3.5 w-3.5" />
              <span>{report.downloadCount}</span>
            </div>
          </div>
          {report.fileUrl && (
            <div className="flex items-center gap-1 text-xs text-green-700">
              <FileText className="h-3.5 w-3.5" />
              <span>PDF</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
