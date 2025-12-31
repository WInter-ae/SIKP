import { useEffect } from "react";
import LogbookPage from "~/feature/during-intern/pages/logbook-page";
import {
  useTimeline,
  TimelineStep,
} from "~/feature/timeline/context/timeline-context";

export default function Page() {
  const { setActiveStep } = useTimeline();

  useEffect(() => {
    setActiveStep(TimelineStep.SAAT_MAGANG);
  }, [setActiveStep]);

  return <LogbookPage />;
}
