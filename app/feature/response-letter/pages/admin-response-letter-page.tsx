import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

interface Student {
  id: number;
  name: string;
  role: string;
  tanggal: string;
  status: "Disetujui" | "Ditolak";
}

function AdminResponseLetterPage() {
  const [students] = useState<Student[]>([
    {
      id: 1,
      name: "Nama Mahasiswa",
      role: "Tim",
      tanggal: "20/07/2025",
      status: "Disetujui",
    },
    {
      id: 2,
      name: "Nama Mahasiswa",
      role: "Individu",
      tanggal: "20/07/2025",
      status: "Ditolak",
    },
    {
      id: 3,
      name: "Nama Mahasiswa",
      role: "Tim",
      tanggal: "20/07/2025",
      status: "Ditolak",
    },
    {
      id: 4,
      name: "Nama Mahasiswa",
      role: "Individu",
      tanggal: "20/07/2025",
      status: "Disetujui",
    },
  ]);

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(
    null
  );
  const [comment, setComment] = useState("");

  const handleViewDetail = (student: Student) => {
    setSelectedStudent(student);
    setShowDetailDialog(true);
  };

  const handleApprove = (student: Student) => {
    setSelectedStudent(student);
    setActionType("approve");
    setShowApproveDialog(true);
  };

  const handleReject = (student: Student) => {
    setSelectedStudent(student);
    setActionType("reject");
    setShowApproveDialog(true);
  };

  const handleSubmitAction = () => {
    if (actionType === "reject" && !comment.trim()) {
      alert("Komentar wajib diisi untuk penolakan");
      return;
    }

    const action = actionType === "approve" ? "disetujui" : "ditolak";
    alert(
      `Surat balasan ${selectedStudent?.name} berhasil ${action}!\n${comment ? `Komentar: ${comment}` : ""}`
    );
    setShowApproveDialog(false);
    setComment("");
    setActionType(null);
    setSelectedStudent(null);
  };

  return (
    <div className="bg-white min-h-screen px-[3%]">
      <div className="mb-8 mt-[10vh]">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Surat Balasan</h1>
        <p className="text-gray-600">
          Kelola dan review surat balasan dari perusahaan untuk kerja praktik
          mahasiswa
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">
                Profil
              </th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-800">
                Tanggal
              </th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-800">
                Status
              </th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-800">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {students.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center text-xl font-bold">
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {student.name}
                      </div>
                      <span
                        className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                          student.role === "Tim"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {student.role}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-center text-sm text-gray-700">
                  {student.tanggal}
                </td>
                <td className="px-6 py-4 text-center">
                  <span
                    className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                      student.status === "Disetujui"
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {student.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleViewDetail(student)}
                      className="p-2 hover:bg-gray-100 rounded-full transition"
                      title="Lihat Detail"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-600"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path
                          fillRule="evenodd"
                          d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleApprove(student)}
                      className="p-2 hover:bg-green-50 rounded-full transition"
                      title="Setujui"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-green-600"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Detail Surat Balasan</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Mahasiswa
                </label>
                <p className="text-gray-900">{selectedStudent.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipe
                </label>
                <p className="text-gray-900">{selectedStudent.role}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Upload
                </label>
                <p className="text-gray-900">{selectedStudent.tanggal}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <span
                  className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                    selectedStudent.status === "Disetujui"
                      ? "bg-green-500 text-white"
                      : "bg-red-500 text-white"
                  }`}
                >
                  {selectedStudent.status}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  File Surat Balasan
                </label>
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-red-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div>
                      <p className="font-medium text-gray-900">
                        Surat_Balasan.pdf
                      </p>
                      <p className="text-sm text-gray-500">1.2 MB</p>
                    </div>
                  </div>
                  <Button className="mt-3 w-full bg-blue-600 hover:bg-blue-700">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Download
                  </Button>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-3 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDetailDialog(false)}
              className="flex-1"
            >
              Tutup
            </Button>
            {selectedStudent && (
              <>
                <Button
                  onClick={() => {
                    setShowDetailDialog(false);
                    handleApprove(selectedStudent);
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Setujui
                </Button>
                <Button
                  onClick={() => {
                    setShowDetailDialog(false);
                    handleReject(selectedStudent);
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  Tolak
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve/Reject Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve"
                ? "Setujui Surat Balasan"
                : "Tolak Surat Balasan"}
            </DialogTitle>
            <DialogDescription className="text-gray-700">
              {selectedStudent &&
                (actionType === "approve"
                  ? `Apakah Anda yakin ingin menyetujui surat balasan dari ${selectedStudent.name}?`
                  : `Apakah Anda yakin ingin menolak surat balasan dari ${selectedStudent.name}?`)}
            </DialogDescription>
          </DialogHeader>

          {actionType === "reject" && (
            <div className="my-4">
              <Label htmlFor="comment" className="text-gray-900">
                Komentar Penolakan *
              </Label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Masukkan alasan penolakan..."
                className="mt-2"
                rows={4}
              />
            </div>
          )}

          <DialogFooter className="gap-3 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowApproveDialog(false);
                setComment("");
                setActionType(null);
              }}
              className="flex-1"
            >
              Batal
            </Button>
            <Button
              onClick={handleSubmitAction}
              className={`flex-1 ${
                actionType === "approve"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {actionType === "approve" ? "Setujui" : "Tolak"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdminResponseLetterPage;
