import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function FPSOverlay() {
  const [enabled, setEnabled] = useState(false);
  const [metrics, setMetrics] = useState({
    fps: true,
    cpuUsage: true,
    gpuUsage: true,
    temps: true,
    memory: false,
    ping: false,
  });
  const [position, setPosition] = useState("top-left");
  const [refreshRate, setRefreshRate] = useState(1);
  const [overlayTheme, setOverlayTheme] = useState("neon-green");

  const { toast } = useToast();

  const toggleMetric = (key: keyof typeof metrics) => {
    setMetrics((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const applySettings = async () => {
    // Simulate applying overlay settings
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "FPS Overlay Updated",
      description: `Overlay ${enabled ? 'enabled' : 'disabled'} with ${Object.values(metrics).filter(Boolean).length} metrics`,
    });
  };

  const themes = [
    { value: "neon-green", label: "Neon Green", color: "rgb(0, 255, 127)" },
    { value: "neon-blue", label: "Cyber Blue", color: "rgb(0, 191, 255)" },
    { value: "neon-purple", label: "Purple Haze", color: "rgb(138, 43, 226)" },
    { value: "yellow", label: "Electric Yellow", color: "rgb(255, 255, 0)" },
  ];

  const positions = [
    { value: "top-left", label: "Top Left" },
    { value: "top-right", label: "Top Right" },
    { value: "bottom-left", label: "Bottom Left" },
    { value: "bottom-right", label: "Bottom Right" },
    { value: "center", label: "Center" },
  ];

  return (
    <div className="bg-dark-card rounded-xl p-6 border border-dark-border card-hover">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <i className="fas fa-layer-group text-neon-purple text-2xl mr-4 neon-glow" />
          <div>
            <h3 className="text-xl font-bold text-white">FPS Overlay Control</h3>
            <p className="text-gray-400 text-sm">In-game performance overlay configuration</p>
          </div>
        </div>
        <Switch
          checked={enabled}
          onCheckedChange={setEnabled}
          className="data-[state=checked]:bg-neon-green"
        />
      </div>

      <div className="space-y-6">
        {/* Metrics Selection */}
        <div>
          <h4 className="text-white font-medium mb-3">Display Metrics</h4>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(metrics).map(([key, value]) => (
              <label
                key={key}
                className="flex items-center justify-between p-3 bg-dark-bg rounded-lg cursor-pointer hover:bg-dark-border transition-colors"
              >
                <span className="text-gray-300 capitalize">
                  {key === "cpuUsage" ? "CPU Usage" :
                   key === "gpuUsage" ? "GPU Usage" :
                   key === "temps" ? "Temperatures" :
                   key}
                </span>
                <Switch
                  checked={value}
                  onCheckedChange={() => toggleMetric(key as keyof typeof metrics)}
                  className="data-[state=checked]:bg-neon-green"
                />
              </label>
            ))}
          </div>
        </div>

        {/* Position Selection */}
        <div>
          <label className="block text-white font-medium mb-2">Overlay Position</label>
          <Select value={position} onValueChange={setPosition}>
            <SelectTrigger className="bg-dark-bg border-dark-border text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-dark-bg border-dark-border">
              {positions.map((pos) => (
                <SelectItem key={pos.value} value={pos.value} className="text-white hover:bg-dark-card">
                  {pos.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Theme Selection */}
        <div>
          <label className="block text-white font-medium mb-2">Overlay Theme</label>
          <Select value={overlayTheme} onValueChange={setOverlayTheme}>
            <SelectTrigger className="bg-dark-bg border-dark-border text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-dark-bg border-dark-border">
              {themes.map((theme) => (
                <SelectItem key={theme.value} value={theme.value} className="text-white hover:bg-dark-card">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: theme.color }}
                    />
                    {theme.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Refresh Rate */}
        <div>
          <label className="block text-white font-medium mb-2">
            Refresh Rate: {refreshRate}s
          </label>
          <Input
            type="number"
            min="0.1"
            max="5"
            step="0.1"
            value={refreshRate}
            onChange={(e) => setRefreshRate(parseFloat(e.target.value) || 1)}
            className="bg-dark-bg border-dark-border text-white"
          />
          <p className="text-xs text-gray-400 mt-1">
            Lower values = more frequent updates (higher CPU usage)
          </p>
        </div>

        {/* Preview */}
        {enabled && (
          <div className="bg-dark-bg rounded-lg p-4">
            <h4 className="text-white font-medium mb-3">Overlay Preview</h4>
            <div className={cn(
              "inline-block p-3 rounded border-2 text-sm font-mono",
              overlayTheme === "neon-green" && "border-neon-green text-neon-green",
              overlayTheme === "neon-blue" && "border-neon-blue text-neon-blue",
              overlayTheme === "neon-purple" && "border-neon-purple text-neon-purple",
              overlayTheme === "yellow" && "border-yellow-400 text-yellow-400"
            )}>
              {metrics.fps && <div>FPS: 144</div>}
              {metrics.cpuUsage && <div>CPU: 45%</div>}
              {metrics.gpuUsage && <div>GPU: 87%</div>}
              {metrics.temps && <div>GPU Temp: 72°C</div>}
              {metrics.memory && <div>RAM: 8.2/16GB</div>}
              {metrics.ping && <div>Ping: 23ms</div>}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Button
            onClick={applySettings}
            className="flex-1 bg-neon-green text-dark-bg hover:bg-neon-green/90"
          >
            <i className="fas fa-save mr-2" />
            Apply Settings
          </Button>
          <Button
            onClick={() => {
              setMetrics({
                fps: true,
                cpuUsage: true,
                gpuUsage: true,
                temps: true,
                memory: false,
                ping: false,
              });
              setPosition("top-left");
              setRefreshRate(1);
              setOverlayTheme("neon-green");
            }}
            className="bg-gray-600 hover:bg-gray-700 text-white"
          >
            <i className="fas fa-undo mr-2" />
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}