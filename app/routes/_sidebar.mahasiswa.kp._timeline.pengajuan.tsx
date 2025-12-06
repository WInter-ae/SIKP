import { useEffect } from "react";
import SubmissionPage from "~/feature/submission/pages/submission-page";
import {
  useTimeline,
  TimelineStep,
} from "~/feature/timeline/context/timeline-context";

export default function Page() {
  const { setActiveStep } = useTimeline();

  useEffect(() => {
    setActiveStep(TimelineStep.PENGAJUAN);
  }, [setActiveStep]);

  return <SubmissionPage />;
}
