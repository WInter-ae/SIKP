import { useEffect } from "react";
import AssessmentPage from "~/feature/during-intern/pages/assessment-page";
import {
  useTimeline,
  TimelineStep,
} from "~/feature/timeline/context/timeline-context";

export default function Page() {
  const { setActiveStep } = useTimeline();

  useEffect(() => {
    setActiveStep(TimelineStep.SAAT_MAGANG);
  }, [setActiveStep]);

  return <AssessmentPage />;
}
