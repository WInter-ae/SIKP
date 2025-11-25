import { Link } from "react-router";
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

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex justify-between relative">
        {/* Progress line */}
        <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 z-0"></div>

        {timelineItems.map((item) => (
          <Link
            key={item.id}
            to={TIMELINE_ROUTES[item.step]}
            className="relative z-10 flex flex-col items-center w-1/6 group cursor-pointer transition-all"
          >
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                item.active
                  ? "bg-green-700 text-white"
                  : "bg-gray-200 text-gray-500 group-hover:bg-green-600 group-hover:text-white"
              }`}
            >
              <i className="fa fa-lock"></i>
            </div>
            <div
              className={`text-sm font-medium text-center transition-colors ${
                item.active
                  ? "text-green-700"
                  : "text-gray-500 group-hover:text-green-600"
              }`}
            >
              {item.title}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Timeline;
