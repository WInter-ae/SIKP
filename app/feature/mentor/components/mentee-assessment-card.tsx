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

export interface MenteeGradingInfo {
  id: string;
  name: string;
  nim: string;
  photoUrl?: string | null;
  division: string;
  prodi: string;
  internshipStartDate: string;
  internshipEndDate: string;
  gradingStatus: "graded" | "not-graded" | "pending";
}

interface MenteeAssessmentCardProps {
  mentee: MenteeGradingInfo;
  onGiveGrade?: (studentId: string) => void;
  onViewDetail?: (studentId: string) => void;
}

export function MenteeAssessmentCard({
  mentee,
  onGiveGrade,
  onViewDetail,
}: MenteeAssessmentCardProps) {
  // Status badge logic
  const getStatusBadge = () => {
    switch (mentee.gradingStatus) {
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

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 dark:bg-gray-800 dark:border-gray-700">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16 flex-shrink-0">
            <AvatarImage src={mentee.photoUrl || ""} alt={mentee.name} />
            <AvatarFallback className="bg-blue-100 text-blue-700 dark:bg-gray-700 dark:text-gray-200 text-xl font-semibold">
              {mentee.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg leading-tight dark:text-gray-100">
                  {mentee.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  {mentee.nim}
                </p>
              </div>
              <div className="flex flex-col gap-1.5 items-end flex-shrink-0">
                {getStatusBadge()}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        {/* Unit/Divisi Info */}
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            <Building2 className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Unit / Divisi
            </p>
            <p className="font-semibold text-gray-900 dark:text-gray-100">
              {mentee.division || "-"}
            </p>
          </div>
        </div>

        {/* Intern Period */}
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Periode Magang
            </p>
            <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">
              {mentee.internshipStartDate ? new Date(mentee.internshipStartDate).toLocaleDateString(
                "id-ID",
                {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                },
              ) : "N/A"}{" "}
              -{" "}
              {mentee.internshipEndDate ? new Date(mentee.internshipEndDate).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              }) : "N/A"}
            </p>
          </div>
        </div>

        {/* Program Studi */}
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            <User className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Program Studi
            </p>
            <p className="font-semibold text-gray-900 dark:text-gray-100">
              {mentee.prodi || "-"}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            onClick={() => onViewDetail?.(mentee.id)}
            className="flex-1 border-gray-300 hover:bg-gray-50 text-gray-700 dark:text-gray-200"
            variant="outline"
          >
            Lihat Detail
          </Button>
          <Button
            onClick={() => onGiveGrade?.(mentee.id)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {mentee.gradingStatus === "graded" ? "Edit Nilai" : "Beri Nilai"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
