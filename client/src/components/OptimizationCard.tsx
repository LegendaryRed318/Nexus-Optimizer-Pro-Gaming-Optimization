import { useState } from "react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";

interface OptimizationSetting {
  label: string;
  enabled: boolean;
}

interface OptimizationCardProps {
  title: string;
  description: string;
  icon: string;
  color: string;
  buttonText: string;
  buttonColor: string;
  settings?: OptimizationSetting[];
  onOptimize?: () => void;
}

export function OptimizationCard({
  title,
  description,
  icon,
  color,
  buttonText,
  buttonColor,
  settings = [],
  onOptimize
}: OptimizationCardProps) {
  const [settingsState, setSettingsState] = useState(
    settings.reduce((acc, setting, index) => ({
      ...acc,
      [index]: setting.enabled
    }), {} as Record<number, boolean>)
  );

  const toggleSetting = (index: number) => {
    setSettingsState(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className="bg-dark-card rounded-xl p-6 border border-dark-border card-hover">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <i className={cn("text-2xl mr-4 neon-glow", icon, color)} />
          <div>
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <p className="text-gray-400">{description}</p>
          </div>
        </div>
        <button
          onClick={onOptimize}
          className={cn(
            "px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105",
            buttonColor
          )}
        >
          {buttonText}
        </button>
      </div>

      {settings.length > 0 && (
        <div className="space-y-4">
          {settings.map((setting, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-white">{setting.label}</span>
              <Switch
                checked={settingsState[index]}
                onCheckedChange={() => toggleSetting(index)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
