// External dependencies
import { Link } from "react-router";
import { Mail, Phone, Building2, Award, BookOpen, User } from "lucide-react";

// Components
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

// Types
import type { Mentee } from "../types";

interface MenteeCardProps {
  mentee: Mentee;
}

function MenteeCard({ mentee }: MenteeCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{mentee.name}</CardTitle>
            <CardDescription>NIM: {mentee.nim}</CardDescription>
          </div>
          <span className="px-3 py-1 text-sm rounded-full bg-green-100 text-green-800">
            {mentee.status}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{mentee.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{mentee.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-sm md:col-span-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span>{mentee.company}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress Magang</span>
            <span className="font-medium">{mentee.progress}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${mentee.progress}%` }}
            />
          </div>
        </div>

        <div className="flex gap-2 mt-4 flex-wrap">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/mentor/logbook-detail/${mentee.id}`}>
              <BookOpen className="h-4 w-4 mr-2" />
              Logbook
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to={`/mentor/mentee/${mentee.id}`}>
              <User className="h-4 w-4 mr-2" />
              Detail Mahasiswa
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to={`/mentor/penilaian?mentee=${mentee.id}`}>
              <Award className="h-4 w-4 mr-2" />
              Beri Penilaian
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default MenteeCard;
