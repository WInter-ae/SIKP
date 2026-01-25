import { useState, useEffect } from "react";
import {
  Building2,
  Calendar,
  User,
  Award,
  CheckCircle2,
  Clock,
  FileCheck,
  FileX,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import type { StudentGradingInfo } from "../types";

interface StudentGradingCardProps {
  studentInfo: StudentGradingInfo;
  onGiveGrade?: (studentId: string) => void;
  onViewDetail?: (studentId: string) => void;
}

export function StudentGradingCard({
  studentInfo,
  onGiveGrade,
  onViewDetail,
}: StudentGradingCardProps) {
  const { student, gradingStatus, summary, revisionStatus } = studentInfo;
  const [hasGraded, setHasGraded] = useState(false);

  // Check if student has been graded by checking localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const nilaiKey = `nilai-kp-${student.studentId}`;
      const savedNilai = localStorage.getItem(nilaiKey);
      
      if (savedNilai) {
        try {
          const nilaiData = JSON.parse(savedNilai);
          // Check if nilai has valid data (has tanggalPenilaian)
          if (nilaiData.tanggalPenilaian) {
            setHasGraded(true);
          }
        } catch (e) {
          console.error('Error parsing nilai data:', e);
        }
      }
    }
  }, [student.studentId]);

  const getStatusBadge = () => {
    switch (gradingStatus) {
      case "graded":
        return (
          <Badge className="bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Sudah Dinilai
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-50 text-yellow-700 border border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "not-graded":
        return (
          <Badge className="bg-gray-50 text-gray-700 border border-gray-200 dark:bg-gray-900/30 dark:text-gray-400">
            <Clock className="h-3 w-3 mr-1" />
            Belum Dinilai
          </Badge>
        );
    }
  };

  const getRevisionBadge = () => {
    if (!revisionStatus) return null;
    
    switch (revisionStatus) {
      case "sudah-direvisi":
        return (
          <Badge className="bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400">
            <FileCheck className="h-3 w-3 mr-1" />
            Sudah Direvisi
          </Badge>
        );
      case "proses":
        return (
          <Badge className="bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400">
            <RefreshCw className="h-3 w-3 mr-1" />
            Proses
          </Badge>
        );
      case "belum-direvisi":
        return (
          <Badge className="bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-900/30 dark:text-orange-400">
            <FileX className="h-3 w-3 mr-1" />
            Belum Direvisi
          </Badge>
        );
    }
  };

  const getGradeBadgeColor = (grade: string) => {
    switch (grade) {
      case "A":
        return "bg-green-500 text-white dark:bg-green-600";
      case "B":
        return "bg-blue-500 text-white dark:bg-blue-600";
      case "C":
        return "bg-yellow-500 text-white dark:bg-yellow-600";
      case "D":
        return "bg-orange-500 text-white dark:bg-orange-600";
      case "E":
        return "bg-red-500 text-white dark:bg-red-600";
      default:
        return "bg-gray-500 text-white dark:bg-gray-600";
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 dark:bg-gray-800 dark:border-gray-700">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16 flex-shrink-0">
            <AvatarImage src={student.photo} alt={student.name} />
            <AvatarFallback className="bg-blue-100 text-blue-700 dark:bg-gray-700 dark:text-gray-200 text-xl font-semibold">
              {student.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg leading-tight dark:text-gray-100">{student.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{student.studentId}</p>
              </div>
              <div className="flex flex-col gap-1.5 items-end flex-shrink-0">
                {getStatusBadge()}
                {getRevisionBadge()}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        {/* Company Info */}
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            <Building2 className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Perusahaan</p>
            <p className="font-semibold text-gray-900 dark:text-gray-100">{student.company}</p>
          </div>
        </div>

        {/* Intern Period */}
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Periode Magang</p>
            <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">
              {new Date(student.internPeriod.start).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}{" "}
              -{" "}
              {new Date(student.internPeriod.end).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Field Supervisor */}
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            <User className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Pembimbing Lapangan</p>
            <p className="font-semibold text-gray-900 dark:text-gray-100">{student.fieldSupervisor}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          {gradingStatus === "not-graded" && !hasGraded ? (
            <Button
              onClick={() => onGiveGrade?.(student.id)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Beri Nilai
            </Button>
          ) : (
            <>
              <Button
                onClick={() => onViewDetail?.(student.id)}
                className="flex-1 border-gray-300 hover:bg-gray-50 text-gray-700"
                variant="outline"
              >
                Lihat Detail
              </Button>
              <Button
                onClick={() => onGiveGrade?.(student.id)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {hasGraded ? "Edit Nilai" : "Beri Nilai"}
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
