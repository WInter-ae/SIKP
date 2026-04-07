import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import { Badge } from "~/components/ui/badge";
import type { GradeSectionProps } from "../types";

function getScoreBadgeClass(score: number, maxScore: number): string {
  const ratio = maxScore > 0 ? score / maxScore : 0;

  if (ratio >= 0.85) {
    return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300";
  }
  if (ratio >= 0.7) {
    return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300";
  }
  return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300";
}

export function GradeSection({
  title,
  grades,
  totalScore,
  maxScore,
}: GradeSectionProps) {
  const percentage = (totalScore / maxScore) * 100;

  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl dark:text-gray-100">{title}</CardTitle>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-700 dark:text-green-400">
              {totalScore.toFixed(1)}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">dari {maxScore}</div>
          </div>
        </div>
        <Progress value={percentage} className="mt-2" />
      </CardHeader>

      <CardContent className="space-y-4">
        {grades.map((gradeCategory, idx) => (
          <div key={idx} className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                {gradeCategory.category}
              </h4>
              <div className="text-sm font-medium">
                <span className="text-green-700 dark:text-green-400">
                  {gradeCategory.totalScore.toFixed(1)}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  {" "}
                  / {gradeCategory.maxScore}
                </span>
              </div>
            </div>

            <div className="space-y-2 pl-4">
              {gradeCategory.components.map((component, compIdx) => (
                <div
                  key={compIdx}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                    <span className="text-gray-700 dark:text-gray-300">{component.name}</span>
                    {component.weight && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        (Bobot: {component.weight}%)
                      </span>
                    )}
                  </div>
                  <div className="font-medium flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`${getScoreBadgeClass(component.score, component.maxScore)} font-bold min-w-10 justify-center`}
                    >
                      {component.score}
                    </Badge>
                    <span className="text-gray-500 dark:text-gray-400">
                      / {component.maxScore}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {idx < grades.length - 1 && (
              <div className="border-b border-gray-200 dark:border-gray-700 mt-3"></div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
