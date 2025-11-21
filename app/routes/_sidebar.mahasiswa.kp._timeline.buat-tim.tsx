import { useEffect } from "react";
import TeamCreationPage from "~/feature/create-teams/pages/team-creation-page";
import { useTimeline, TimelineStep } from "~/feature/timeline/context/timeline-context";

export default function Page() {
  const { setActiveStep } = useTimeline();

  useEffect(() => {
    setActiveStep(TimelineStep.BUAT_TIM);
  }, [setActiveStep]);

  return <TeamCreationPage />;
}
