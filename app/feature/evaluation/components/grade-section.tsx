import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import type { GradeSectionProps } from "../types";

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
                  <div className="font-medium">
                    <span
                      className={
                        component.score >= component.maxScore * 0.8
                          ? "text-green-600 dark:text-green-400"
                          : component.score >= component.maxScore * 0.6
                            ? "text-yellow-600 dark:text-yellow-400"
                            : "text-red-600 dark:text-red-400"
                      }
                    >
                      {component.score}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {" "}
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
