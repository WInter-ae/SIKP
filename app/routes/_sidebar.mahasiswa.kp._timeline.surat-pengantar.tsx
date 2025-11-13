import { useEffect } from "react";
import CoverLetterPage from "~/feature/cover-letter/pages/cover-letter-page";
import { useTimeline, TimelineStep } from "~/feature/timeline/context/timeline-context";

export default function Page() {
  const { setActiveStep } = useTimeline();

  useEffect(() => {
    setActiveStep(TimelineStep.SURAT_PENGANTAR);
  }, [setActiveStep]);

  return <CoverLetterPage />;
}
