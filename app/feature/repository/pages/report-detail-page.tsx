import { useParams, useNavigate } from "react-router";
import {
  ArrowLeft,
  Download,
  Eye,
  Calendar,
  Building2,
  User,
  FileText,
  Share2,
  BookOpen,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Separator } from "~/components/ui/separator";
import { MOCK_REPORTS } from "../data/mock-reports";

export default function ReportDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Find report by ID
  const report = MOCK_REPORTS.find((r) => r.id === id);

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="max-w-md w-full dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-6 text-center">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Laporan Tidak Ditemukan
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Laporan KP yang Anda cari tidak tersedia.
            </p>
            <Button onClick={() => navigate("/mahasiswa/repositori")}>
              Kembali ke Repositori
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
      case "review":
        return "bg-yellow-200 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "approved":
        return "bg-blue-200 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "published":
        return "bg-green-200 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      default:
        return "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const handleDownload = () => {
    if (report.fileUrl) {
      window.open(report.fileUrl, "_blank");
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: report.title,
        text: report.abstract,
        url: window.location.href,
      });
    }
  };

  const handleViewReport = () => {
    if (report.fileUrl) {
      window.open(report.fileUrl, "_blank");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/mahasiswa/repositori")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali ke Repositori
        </Button>

        {/* Header Card */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <Badge className={`mb-3 ${getStatusBadgeColor(report.status)}`}>
                  {report.status}
                </Badge>
                <CardTitle className="text-3xl mb-4 dark:text-gray-100">{report.title}</CardTitle>
                <div className="flex flex-wrap gap-2">
                  {report.tags?.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              {report.thumbnailUrl && (
                <div className="w-48 h-32 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={report.thumbnailUrl}
                    alt={report.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Stats */}
            <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400 pb-4 border-b dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <span>{report.viewCount} views</span>
              </div>
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                <span>{report.downloadCount} downloads</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  {new Date(report.uploadDate).toLocaleDateString("id-ID", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {report.fileUrl && (
                <>
                  <Button onClick={handleViewReport} className="flex-1">
                    <Eye className="h-4 w-4 mr-2" />
                    Lihat Laporan
                  </Button>
                  <Button onClick={handleDownload} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </>
              )}
              <Button variant="outline" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Bagikan
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Abstract */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                  <BookOpen className="h-5 w-5" />
                  Abstrak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-justify">
                  {report.abstract}
                </p>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-gray-100">Informasi Detail</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Tahun & Periode
                  </h4>
                  <p className="text-gray-900 dark:text-gray-100">
                    {report.year} - Semester {report.semester}
                  </p>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Kategori
                  </h4>
                  <p className="text-gray-900 dark:text-gray-100">{report.category}</p>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Tanggal Upload
                  </h4>
                  <p className="text-gray-900 dark:text-gray-100">
                    {new Date(report.uploadDate).toLocaleDateString("id-ID", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>

                {report.publishDate && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Tanggal Publish
                      </h4>
                      <p className="text-gray-900 dark:text-gray-100">
                        {new Date(report.publishDate).toLocaleDateString(
                          "id-ID",
                          {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          },
                        )}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Student */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg dark:text-gray-100">Mahasiswa</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={report.student.photo}
                      alt={report.student.name}
                    />
                    <AvatarFallback className="dark:bg-gray-700 dark:text-gray-200">
                      {report.student.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {report.student.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {report.student.studentId}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Company */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 dark:text-gray-100">
                  <Building2 className="h-5 w-5" />
                  Perusahaan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-900 dark:text-gray-100 font-medium">{report.company}</p>
              </CardContent>
            </Card>

            {/* Supervisor */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 dark:text-gray-100">
                  <User className="h-5 w-5" />
                  Dosen Pembimbing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-900 dark:text-gray-100 font-medium">
                  {report.supervisor.name}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  NIDN: {report.supervisor.nidn}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
