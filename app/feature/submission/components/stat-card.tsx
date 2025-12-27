import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconBgColor: string;
}

function StatCard({ title, value, icon: Icon, iconBgColor }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6 flex items-center">
      <div
        className={`w-14 h-14 rounded-full flex items-center justify-center text-white text-2xl mr-4 ${iconBgColor}`}
      >
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
        <p className="text-gray-600">{title}</p>
      </div>
    </div>
  );
}

export default StatCard;
