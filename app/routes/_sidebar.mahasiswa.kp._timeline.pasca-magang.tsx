import { useEffect } from "react";
import PascaMagangPage from "~/feature/evaluation/pages/pasca-magang-page";
import {
  useTimeline,
  TimelineStep,
} from "~/feature/timeline/context/timeline-context";

export default function Page() {
  const { setActiveStep } = useTimeline();

  useEffect(() => {
    setActiveStep(TimelineStep.PASCA_MAGANG);
  }, [setActiveStep]);

  return <PascaMagangPage />;
}
