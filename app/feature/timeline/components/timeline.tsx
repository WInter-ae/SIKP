import { Link } from "react-router";

import { Card, CardContent } from "~/components/ui/card";
import { cn } from "~/lib/utils";

import { useTimeline, TimelineStep } from "../context/timeline-context";
import { Lock } from "lucide-react";

// Mapping dari TimelineStep ke route path
const TIMELINE_ROUTES: Record<TimelineStep, string> = {
  [TimelineStep.BUAT_TIM]: "/mahasiswa/kp/buat-tim",
  [TimelineStep.PENGAJUAN]: "/mahasiswa/kp/pengajuan",
  [TimelineStep.SURAT_PENGANTAR]: "/mahasiswa/kp/surat-pengantar",
  [TimelineStep.SURAT_BALASAN]: "/mahasiswa/kp/surat-balasan",
  [TimelineStep.SAAT_MAGANG]: "/mahasiswa/kp/saat-magang",
  [TimelineStep.PASCA_MAGANG]: "/mahasiswa/kp/pasca-magang",
};

function Timeline() {
  const { timelineItems } = useTimeline();

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="flex justify-between relative">
          {/* Progress line */}
          <div className="absolute top-5 left-0 right-0 h-1 bg-muted z-0"></div>

          {timelineItems.map((item) => (
            <Link
              key={item.id}
              to={TIMELINE_ROUTES[item.step]}
              className="relative z-10 flex flex-col items-center w-1/6 group cursor-pointer transition-all"
            >
              <div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all",
                  item.active
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground group-hover:bg-primary/80 group-hover:text-primary-foreground"
                )}
              >
                <Lock className="h-4 w-4" />
              </div>
              <div
                className={cn(
                  "text-sm font-medium text-center transition-colors",
                  item.active
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-primary"
                )}
              >
                {item.title}
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default Timeline;
