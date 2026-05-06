import { Outlet } from "react-router";
import { TimelineProvider } from "~/feature/timeline/context/timeline-context";
import Timeline from "~/feature/timeline/components/timeline";

export default function TimelineLayout() {
  return (
    <TimelineProvider>
      <div className="min-h-screen">
        <main className="mx-auto max-w-6xl p-3 sm:p-6">
          <Timeline />
          <Outlet />
        </main>
      </div>
    </TimelineProvider>
  );
}
