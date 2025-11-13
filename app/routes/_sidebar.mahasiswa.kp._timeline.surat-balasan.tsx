import { useEffect } from "react";
import ResponseLetterPage from "~/feature/response-letter/pages/response-letter-page";
import { useTimeline, TimelineStep } from "~/feature/timeline/context/timeline-context";

export default function Page() {
  const { setActiveStep } = useTimeline();

  useEffect(() => {
    setActiveStep(TimelineStep.SURAT_BALASAN);
  }, [setActiveStep]);

  return <ResponseLetterPage />;
}
