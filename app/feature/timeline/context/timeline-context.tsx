import { createContext, useContext, useState, type ReactNode } from "react";

export const TimelineStep = {
  BUAT_TIM: "pembuatan-tim",
  PENGAJUAN: "pengajuan",
  SURAT_PENGANTAR: "surat-pengantar",
  SURAT_BALASAN: "surat-balasan",
  SAAT_MAGANG: "saat-magang",
  PASCA_MAGANG: "pasca-magang",
} as const;

export type TimelineStep = (typeof TimelineStep)[keyof typeof TimelineStep];

interface TimelineItem {
  id: number;
  step: TimelineStep;
  title: string;
  active: boolean;
}

interface TimelineContextType {
  activeStep: TimelineStep;
  setActiveStep: (step: TimelineStep) => void;
  timelineItems: TimelineItem[];
}

const TimelineContext = createContext<TimelineContextType | undefined>(
  undefined,
);

export function TimelineProvider({ children }: { children: ReactNode }) {
  const [activeStep, setActiveStep] = useState<TimelineStep>(
    TimelineStep.BUAT_TIM,
  );

  const timelineItems: TimelineItem[] = [
    {
      id: 1,
      step: TimelineStep.BUAT_TIM,
      title: "Pembuatan Tim",
      active: false,
    },
    { id: 2, step: TimelineStep.PENGAJUAN, title: "Pengajuan", active: false },
    {
      id: 3,
      step: TimelineStep.SURAT_PENGANTAR,
      title: "Surat Pengantar",
      active: false,
    },
    {
      id: 4,
      step: TimelineStep.SURAT_BALASAN,
      title: "Surat Balasan",
      active: false,
    },
    {
      id: 5,
      step: TimelineStep.SAAT_MAGANG,
      title: "Saat Magang",
      active: false,
    },
    {
      id: 6,
      step: TimelineStep.PASCA_MAGANG,
      title: "Pasca Magang",
      active: false,
    },
  ].map((item) => ({
    ...item,
    active: item.step === activeStep,
  }));

  return (
    <TimelineContext.Provider
      value={{ activeStep, setActiveStep, timelineItems }}
    >
      {children}
    </TimelineContext.Provider>
  );
}

export function useTimeline() {
  const context = useContext(TimelineContext);
  if (context === undefined) {
    throw new Error("useTimeline must be used within a TimelineProvider");
  }
  return context;
}
