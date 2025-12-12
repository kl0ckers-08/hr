// components/ui/StatCard.tsx
import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  color?: "purple" | "blue" | "green" | "yellow" | "orange";
}

const colorMap = {
  purple: "bg-purple-100 text-purple-700 border-purple-200",
  blue: "bg-blue-100 text-blue-700 border-blue-200",
  green: "bg-green-100 text-green-700 border-green-200",
  yellow: "bg-yellow-100 text-yellow-700 border-yellow-200",
  orange: "bg-orange-100 text-orange-700 border-orange-200",
};

export default function StatCard({ title, value, subtitle, icon, color = "purple" }: StatCardProps) {
  return (
    <div className={`p-5 rounded-2xl ${colorMap[color]} border backdrop-blur-sm`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold">{title}</p>
        {icon && <div className="w-8 h-8">{icon}</div>}
      </div>
      <h3 className="text-3xl font-bold">{value}</h3>
      {subtitle && <p className="text-xs font-medium mt-1">{subtitle}</p>}
    </div>
  );
}