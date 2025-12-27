import { useState } from "react";
import { Link } from "react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
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
import { ArrowLeft, Save } from "lucide-react";

interface AssessmentCriteria {
  id: string;
  category: string;
  score: number;
  maxScore: number;
  description: string;
}

export default function PenilaianPage() {
  const [selectedMentee, setSelectedMentee] = useState("");
  const [feedback, setFeedback] = useState("");
  const [assessments, setAssessments] = useState<AssessmentCriteria[]>([
    {
      id: "1",
      category: "Kedisiplinan",
      score: 0,
      maxScore: 100,
      description: "Kehadiran dan ketepatan waktu",
    },
    {
      id: "2",
      category: "Kerjasama",
      score: 0,
      maxScore: 100,
      description: "Kemampuan bekerja dalam tim",
    },
    {
      id: "3",
      category: "Inisiatif",
      score: 0,
      maxScore: 100,
      description: "Kemampuan mengambil inisiatif dalam pekerjaan",
    },
    {
      id: "4",
      category: "Kualitas Kerja",
      score: 0,
      maxScore: 100,
      description: "Hasil kerja sesuai standar yang ditetapkan",
    },
    {
      id: "5",
      category: "Komunikasi",
      score: 0,
      maxScore: 100,
      description: "Kemampuan berkomunikasi dengan baik",
    },
  ]);

  const menteeList = [
    { id: "1", name: "Ahmad Fauzi", nim: "12250111001" },
    { id: "2", name: "Siti Aminah", nim: "12250111002" },
    { id: "3", name: "Budi Santoso", nim: "12250111003" },
  ];

  function handleScoreChange(id: string, value: string) {
    const numValue = parseInt(value) || 0;
    const clampedValue = Math.max(0, Math.min(100, numValue));

    setAssessments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, score: clampedValue } : a))
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedMentee) {
      alert("Mohon pilih mentee terlebih dahulu");
      return;
    }

    const totalScore =
      assessments.reduce((sum, a) => sum + a.score, 0) / assessments.length;

    alert(
      `Penilaian berhasil disimpan!\nMentee: ${menteeList.find((m) => m.id === selectedMentee)?.name}\nNilai Rata-rata: ${totalScore.toFixed(1)}`
    );

    setSelectedMentee("");
    setFeedback("");
    setAssessments((prev) => prev.map((a) => ({ ...a, score: 0 })));
  }

  const totalScore =
    assessments.reduce((sum, a) => sum + a.score, 0) / assessments.length;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Penilaian Mentee</h1>
        <p className="text-muted-foreground">
          Berikan penilaian untuk mahasiswa bimbingan Anda
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Pilih Mentee</CardTitle>
            <CardDescription>Pilih mahasiswa yang akan dinilai</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="mentee">Mahasiswa</Label>
              <Select value={selectedMentee} onValueChange={setSelectedMentee}>
                <SelectTrigger id="mentee">
                  <SelectValue placeholder="Pilih mentee" />
                </SelectTrigger>
                <SelectContent>
                  {menteeList.map((mentee) => (
                    <SelectItem key={mentee.id} value={mentee.id}>
                      {mentee.name} - {mentee.nim}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {selectedMentee && (
          <>
            <Card className="mb-6 bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-muted-foreground mb-2">
                    Nilai Rata-rata Sementara
                  </p>
                  <p className="text-5xl font-bold text-primary">
                    {totalScore.toFixed(1)}
                  </p>
                  <p className="text-muted-foreground mt-2">dari 100</p>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {assessments.map((assessment) => (
                <Card key={assessment.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      {assessment.category}
                    </CardTitle>
                    <CardDescription>{assessment.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Label htmlFor={`score-${assessment.id}`}>
                        Nilai (0-{assessment.maxScore})
                      </Label>
                      <Input
                        id={`score-${assessment.id}`}
                        type="number"
                        min="0"
                        max={assessment.maxScore}
                        value={assessment.score || ""}
                        onChange={(e) =>
                          handleScoreChange(assessment.id, e.target.value)
                        }
                        placeholder="0"
                      />
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{
                            width: `${(assessment.score / assessment.maxScore) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Catatan & Feedback</CardTitle>
                <CardDescription>
                  Berikan catatan atau saran untuk mentee (opsional)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Tulis catatan atau feedback untuk mentee..."
                  rows={5}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                />
              </CardContent>
            </Card>

            <div className="flex justify-center mb-6">
              <Button type="submit" size="lg" className="px-8">
                <Save className="mr-2 h-4 w-4" />
                Simpan Penilaian
              </Button>
            </div>
          </>
        )}

        <div className="flex justify-start">
          <Button variant="secondary" asChild type="button">
            <Link to="/mentor">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Dashboard
            </Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
