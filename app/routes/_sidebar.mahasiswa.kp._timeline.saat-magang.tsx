import { useEffect } from "react";
import DuringInternPage from "~/feature/during-intern/pages/during-intern-page";
import { useTimeline, TimelineStep } from "~/feature/timeline/context/timeline-context";

export default function Page() {
  const { setActiveStep } = useTimeline();

  useEffect(() => {
    setActiveStep(TimelineStep.SAAT_MAGANG);
  }, [setActiveStep]);

  return <DuringInternPage />;
}
