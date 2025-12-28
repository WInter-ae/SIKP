import { Button } from "~/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Eye, Download, FileText, Calendar, User } from "lucide-react";
import type { ArchivedDocument } from "../types";

interface DocumentCardProps {
  document: ArchivedDocument;
  onView: (doc: ArchivedDocument) => void;
  onDownload: (doc: ArchivedDocument) => void;
}

function getTypeLabel(type: string) {
  switch (type) {
    case "penilaian":
      return "Penilaian";
    case "logbook":
      return "Logbook";
    case "laporan":
      return "Laporan";
    default:
      return type;
  }
}

function getTypeBadgeColor(type: string) {
  switch (type) {
    case "penilaian":
      return "bg-blue-100 text-blue-800";
    case "logbook":
      return "bg-green-100 text-green-800";
    case "laporan":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function DocumentCard({ document, onView, onDownload }: DocumentCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">{document.title}</CardTitle>
              <span
                className={`px-2 py-1 text-xs rounded-full ${getTypeBadgeColor(document.type)}`}
              >
                {getTypeLabel(document.type)}
              </span>
            </div>
            <CardDescription>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <User className="h-3 w-3" />
                  <span>{document.mentee}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {new Date(document.date).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                  <span className="mx-2">•</span>
                  <span>{document.semester}</span>
                </div>
              </div>
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onView(document)}
            >
              <Eye className="h-4 w-4 mr-2" />
              Lihat
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDownload(document)}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}

export default DocumentCard;
