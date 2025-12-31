import { useState } from "react";
import { useNavigate } from "react-router";
import { StudentList } from "../components/student-list";
import { MOCK_EVALUATIONS } from "../data/mock-evaluations";
import { Card, CardContent } from "~/components/ui/card";
import { Award, TrendingUp, Users, CheckCircle2 } from "lucide-react";

export default function EvaluationPage() {
  const navigate = useNavigate();
  const [evaluations] = useState(MOCK_EVALUATIONS);

  const handleStudentClick = (id: string) => {
    navigate(`/admin/penilaian/${id}`);
  };

  // Calculate statistics
  const totalStudents = evaluations.length;
  const passedStudents = evaluations.filter(
    (e) => e.summary.status === "passed",
  ).length;
  const averageScore =
    evaluations.reduce((acc, e) => acc + e.summary.finalScore, 0) /
    totalStudents;
  const highestScore = Math.max(
    ...evaluations.map((e) => e.summary.finalScore),
  );

  const stats = [
    {
      title: "Total Mahasiswa",
      value: totalStudents,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Mahasiswa Lulus",
      value: passedStudents,
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Rata-rata Nilai",
      value: averageScore.toFixed(2),
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Nilai Tertinggi",
      value: highestScore.toFixed(2),
      icon: Award,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Penilaian Kerja Praktik
          </h1>
          <p className="text-gray-600">
            Kelola dan pantau penilaian mahasiswa Kerja Praktik
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <Card key={idx}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Students List */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Daftar Mahasiswa
          </h2>
          <StudentList
            evaluations={evaluations}
            onStudentClick={handleStudentClick}
          />
        </div>
      </div>
    </div>
  );
}
