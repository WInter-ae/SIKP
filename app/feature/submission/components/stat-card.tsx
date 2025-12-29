import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "~/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconBgColor: string;
}

function StatCard({ title, value, icon: Icon, iconBgColor }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6 flex items-center">
        <div
          className={`w-14 h-14 rounded-full flex items-center justify-center text-white mr-4 ${iconBgColor}`}
        >
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-foreground">{value}</h3>
          <p className="text-muted-foreground text-md">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default StatCard;
