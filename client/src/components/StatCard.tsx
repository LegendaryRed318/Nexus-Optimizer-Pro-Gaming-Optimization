import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  icon: string;
  value: string | number;
  percentage?: number;
  subtitle?: string;
  color: string;
  glowColor: string;
}

export function StatCard({ title, icon, value, percentage, subtitle, color, glowColor }: StatCardProps) {
  return (
    <div className="bg-dark-card rounded-xl p-6 border border-dark-border card-hover">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <i className={cn("text-2xl mr-3 neon-glow", icon, color)} />
          <span className="font-medium text-white">{title}</span>
        </div>
        <span className={cn("text-2xl font-bold", color)}>{value}</span>
      </div>
      
      {percentage !== undefined && (
        <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
          <div
            className={cn("h-2 rounded-full", glowColor)}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
      
      {subtitle && (
        <p className="text-sm text-gray-400">
          {subtitle.includes(':') ? (
            <>
              {subtitle.split(':')[0]}: <span className={color}>{subtitle.split(':')[1]}</span>
            </>
          ) : (
            subtitle
          )}
        </p>
      )}
    </div>
  );
}
