import { useState } from "react";

import { Card, CardContent } from "~/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";

import { useTimeline } from "../context/timeline-context";

// Mapping dari TimelineStep ke route path
function Timeline() {
  const { timelineItems } = useTimeline();
  const activeStepIndex = timelineItems.findIndex((item) => item.active);
  const [openTooltipId, setOpenTooltipId] = useState<number | null>(null);

  return (
    <Card className="mb-4 sm:mb-8">
      <CardContent className="px-3 py-2 sm:px-6 sm:py-3">
        <TooltipProvider delayDuration={0}>
          <div className="relative flex justify-between gap-0">
            <div className="absolute left-0 right-0 top-3.5 h-1 bg-muted sm:top-4.5" />

            {timelineItems.map((item, index) => {
              const isCompletedOrActive = index <= activeStepIndex;
              const isOpen = openTooltipId === item.id;

              return (
                <Tooltip
                  key={item.id}
                  open={isOpen}
                  onOpenChange={(open) => {
                    setOpenTooltipId(open ? item.id : null);
                  }}
                >
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="relative z-10 flex w-1/6 min-w-0 flex-col items-center px-0.5 transition-all"
                      aria-current={item.active ? "step" : undefined}
                      aria-label={item.title}
                      onClick={() => setOpenTooltipId(item.id)}
                    >
                      <div
                        className={cn(
                          "mb-0.5 flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold transition-all sm:mb-1.5 sm:h-11 sm:w-11 sm:text-base",
                          isCompletedOrActive
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        <span>{index + 1}</span>
                      </div>
                      <div
                        className={cn(
                          "hidden max-w-28 text-center text-xs font-medium leading-tight transition-colors sm:block sm:text-sm",
                          isCompletedOrActive
                            ? "text-primary"
                            : "text-muted-foreground",
                        )}
                      >
                        {item.title}
                      </div>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="bottom"
                    sideOffset={6}
                    className="sm:hidden"
                  >
                    {item.title}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}

export default Timeline;
