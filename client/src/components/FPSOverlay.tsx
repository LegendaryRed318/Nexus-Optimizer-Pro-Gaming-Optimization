import { useState } from "react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { SystemStats } from "@/types/system";

interface FPSOverlayProps {
  systemStats: SystemStats | null;
}

const overlayThemes = [
  { value: "minimal", label: "Minimal Theme" },
  { value: "full", label: "Full Detail" },
  { value: "retro", label: "Retro" },
  { value: "neon", label: "Neon" },
];

const positions = [
  { value: "top-left", label: "Top Left" },
  { value: "top-right", label: "Top Right" },
  { value: "bottom-left", label: "Bottom Left" },
  { value: "bottom-right", label: "Bottom Right" },
];

export function FPSOverlay({ systemStats }: FPSOverlayProps) {
  const [selectedTheme, setSelectedTheme] = useState("minimal");
  const [selectedPosition, setSelectedPosition] = useState("top-right");
  const [isEnabled, setIsEnabled] = useState(false);

  const getPositionClasses = (position: string) => {
    switch (position) {
      case "top-left":
        return "top-4 left-4";
      case "top-right":
        return "top-4 right-4";
      case "bottom-left":
        return "bottom-4 left-4";
      case "bottom-right":
        return "bottom-4 right-4";
      default:
        return "top-4 right-4";
    }
  };

  const renderOverlay = () => {
    if (!systemStats) return null;

    const overlayData = {
      fps: systemStats.fps,
      cpu: systemStats.cpuUsage,
      cpuTemp: systemStats.cpuTemp,
      gpu: systemStats.gpuUsage,
      gpuTemp: systemStats.gpuTemp,
      ram: systemStats.ramUsed,
      ping: systemStats.networkPing,
    };

    switch (selectedTheme) {
      case "minimal":
        return (
          <div className={cn(
            "absolute bg-black/60 backdrop-blur-sm rounded-lg p-2 font-mono text-sm border border-neon-green/20",
            getPositionClasses(selectedPosition)
          )}>
            <div className="text-neon-green">
              FPS: <span className="text-white font-bold">{overlayData.fps}</span> | 
              Ping: <span className="text-white">{overlayData.ping}ms</span>
            </div>
          </div>
        );
      
      case "full":
        return (
          <div className={cn(
            "absolute bg-black/70 backdrop-blur-sm rounded-lg p-3 font-mono text-sm border border-neon-green/20",
            getPositionClasses(selectedPosition)
          )}>
            <div className="text-neon-green">FPS: <span className="text-white font-bold">{overlayData.fps}</span></div>
            <div className="text-neon-blue">CPU: <span className="text-white">{overlayData.cpu}%</span> @ <span className="text-orange-400">{overlayData.cpuTemp}°C</span></div>
            <div className="text-neon-purple">GPU: <span className="text-white">{overlayData.gpu}%</span> @ <span className="text-orange-400">{overlayData.gpuTemp}°C</span></div>
            <div className="text-neon-blue">RAM: <span className="text-white">{overlayData.ram}GB</span> / 16GB</div>
            <div className="text-neon-green">Ping: <span className="text-white">{overlayData.ping}ms</span></div>
          </div>
        );
      
      case "retro":
        return (
          <div className={cn(
            "absolute bg-green-900/80 backdrop-blur-sm rounded border-2 border-green-400 p-3 font-mono text-green-400 text-sm",
            getPositionClasses(selectedPosition)
          )}>
            <div>&gt; FPS: {overlayData.fps}</div>
            <div>&gt; CPU: {overlayData.cpu}% [{overlayData.cpuTemp}°C]</div>
            <div>&gt; GPU: {overlayData.gpu}% [{overlayData.gpuTemp}°C]</div>
            <div>&gt; MEM: {overlayData.ram}GB</div>
            <div>&gt; NET: {overlayData.ping}ms</div>
          </div>
        );
      
      case "neon":
        return (
          <div className={cn(
            "absolute bg-black/80 backdrop-blur-sm rounded-lg p-3 font-mono text-sm border-2 border-neon-green shadow-lg",
            "shadow-neon-green/50",
            getPositionClasses(selectedPosition)
          )} style={{ boxShadow: '0 0 20px rgba(0, 255, 136, 0.3)' }}>
            <div className="text-neon-green font-bold text-center mb-1">⚡ NEXUS ⚡</div>
            <div className="text-neon-green">FPS <span className="text-white font-bold">{overlayData.fps}</span></div>
            <div className="text-neon-blue">CPU <span className="text-white">{overlayData.cpu}%</span> <span className="text-orange-400">{overlayData.cpuTemp}°</span></div>
            <div className="text-neon-purple">GPU <span className="text-white">{overlayData.gpu}%</span> <span className="text-orange-400">{overlayData.gpuTemp}°</span></div>
            <div className="text-neon-blue">RAM <span className="text-white">{overlayData.ram}</span></div>
            <div className="text-neon-green">PNG <span className="text-white">{overlayData.ping}</span></div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="bg-dark-card rounded-xl p-6 border border-dark-border card-hover mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <i className="fas fa-chart-line text-neon-blue text-2xl mr-4 neon-glow" />
          <div>
            <h3 className="text-xl font-bold text-white">FPS Overlay</h3>
            <p className="text-gray-400">Real-time performance monitoring in games</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={selectedTheme} onValueChange={setSelectedTheme}>
            <SelectTrigger className="w-40 bg-dark-bg border-dark-border text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-dark-bg border-dark-border">
              {overlayThemes.map((theme) => (
                <SelectItem key={theme.value} value={theme.value} className="text-white hover:bg-dark-card">
                  {theme.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedPosition} onValueChange={setSelectedPosition}>
            <SelectTrigger className="w-32 bg-dark-bg border-dark-border text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-dark-bg border-dark-border">
              {positions.map((position) => (
                <SelectItem key={position.value} value={position.value} className="text-white hover:bg-dark-card">
                  {position.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button
            onClick={() => setIsEnabled(!isEnabled)}
            className={cn(
              "transition-all duration-300",
              isEnabled
                ? "bg-neon-green text-dark-bg hover:bg-neon-green/90"
                : "bg-neon-blue text-dark-bg hover:bg-neon-blue/90"
            )}
          >
            {isEnabled ? "Disable Overlay" : "Enable Overlay"}
          </Button>
        </div>
      </div>

      {/* Overlay Preview */}
      <div className="bg-dark-bg rounded-lg p-6 relative overflow-hidden min-h-[300px]">
        {/* Gaming background simulation */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 to-blue-900/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        
        {/* Overlay */}
        {renderOverlay()}
        
        <div className="relative z-10 text-center py-16 text-gray-400">
          <i className="fas fa-gamepad text-6xl mb-4 text-neon-purple/50" />
          <p className="text-lg">Overlay Preview - Position: {positions.find(p => p.value === selectedPosition)?.label}</p>
          <p className="text-sm">Hotkey: CTRL+SHIFT+O to toggle</p>
          {isEnabled && (
            <p className="text-neon-green text-sm mt-2">
              <i className="fas fa-circle animate-pulse mr-1" />
              Overlay Active
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
