import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Alert, AlertDescription } from "~/components/ui/alert";
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  FileCheck,
} from "lucide-react";
import { toast } from "sonner";
import { getPendingDosenApprovals } from "../services/approval-api";
import ApprovalDialog from "../components/approval-dialog";
import type { CombinedGradeWithApproval } from "../types/approval.d";

export default function DosenApprovalPage() {
  const [pendingGrades, setPendingGrades] = useState<
    CombinedGradeWithApproval[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [selectedGrade, setSelectedGrade] =
    useState<CombinedGradeWithApproval | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchPendingGrades = async () => {
    setLoading(true);
    const response = await getPendingDosenApprovals();
    if (response.success && response.data) {
      setPendingGrades(response.data);
    } else {
      toast.error(response.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPendingGrades();
  }, []);

  const handleOpenDialog = (grade: CombinedGradeWithApproval) => {
    setSelectedGrade(grade);
    setDialogOpen(true);
  };

  const handleDialogSuccess = () => {
    fetchPendingGrades(); // Refresh list
    setSelectedGrade(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <ClipboardCheck className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Approval Nilai KP
              </h1>
              <p className="text-gray-600">
                Daftar nilai KP yang menunggu approval dari Dosen Pembimbing
              </p>
            </div>
          </div>
          <Card>
            <CardContent className="p-8">
              <div className="text-center text-gray-500">Loading...</div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <ClipboardCheck className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Approval Nilai KP
            </h1>
            <p className="text-gray-600">
              Daftar nilai KP yang menunggu approval dari Dosen Pembimbing
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div>
                  <p className="text-sm text-gray-600">Pending Approval</p>
                  <p className="text-2xl font-bold">{pendingGrades.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Grades List */}
        {pendingGrades.length === 0 ? (
          <Card>
            <CardContent className="p-8">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Tidak ada nilai KP yang menunggu approval saat ini.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {pendingGrades.map((grade) => (
              <Card key={grade.id} className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">
                        {grade.studentName}
                      </CardTitle>
                      <p className="text-sm text-gray-600">NIM: {grade.nim}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="bg-yellow-100 text-yellow-800"
                      >
                        <Clock className="mr-1 h-3 w-3" />
                        Pending Approval
                      </Badge>
                      <Badge
                        className={
                          grade.grade === "A"
                            ? "bg-green-600"
                            : grade.grade === "B"
                            ? "bg-blue-600"
                            : "bg-gray-600"
                        }
                      >
                        Grade: {grade.grade}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Score Breakdown */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600">
                          Mentor Lapangan (30%)
                        </p>
                        <p className="text-lg font-bold text-blue-700">
                          {grade.fieldMentorScore.toFixed(2)}
                        </p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600">
                          Dosen Pembimbing (70%)
                        </p>
                        <p className="text-lg font-bold text-green-700">
                          {grade.academicSupervisorScore.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Total Score */}
                    <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-600">Total Nilai</p>
                          <p className="text-xl font-bold text-purple-700">
                            {grade.totalScore.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Status</p>
                          <p
                            className={`text-lg font-semibold ${
                              grade.status === "lulus"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {grade.status.toUpperCase()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={() => handleOpenDialog(grade)}
                    >
                      <FileCheck className="mr-2 h-4 w-4" />
                      Review & Approve
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Approval Dialog */}
        {selectedGrade && (
          <ApprovalDialog
            grade={selectedGrade}
            role="DOSEN"
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            onSuccess={handleDialogSuccess}
          />
        )}
      </div>
    </div>
  );
}
