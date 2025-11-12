import { Outlet } from "react-router";
import { TimelineProvider } from "~/feature/timeline/context/timeline-context";
import Timeline from "~/feature/timeline/components/timeline";

export default function TimelineLayout() {
  return (
    <TimelineProvider>
      <div className="min-h-screen bg-gray-100">
        <main className="max-w-6xl mx-auto p-6">
          <Timeline />
          <Outlet />
        </main>
      </div>
    </TimelineProvider>
  );
}
