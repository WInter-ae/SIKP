import { Link } from "react-router";

import { Card, CardContent } from "~/components/ui/card";
import { cn } from "~/lib/utils";

import { useTimeline, TimelineStep } from "../context/timeline-context";

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
  const activeStepIndex = timelineItems.findIndex((item) => item.active);

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="flex justify-between relative">
          {/* Progress line */}
          <div className="absolute top-5 left-0 right-0 h-1 bg-muted z-0"></div>

          {timelineItems.map((item, index) => (
            <div
              key={item.id}
              className="relative z-10 flex flex-col items-center w-1/6 transition-all"
            >
              <div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all",
                  index <= activeStepIndex
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                <span className="text-lg font-semibold">{index + 1}</span>
              </div>
              <div
                className={cn(
                  "text-sm font-medium text-center transition-colors",
                  index <= activeStepIndex
                    ? "text-primary"
                    : "text-muted-foreground",
                )}
              >
                {item.title}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default Timeline;
