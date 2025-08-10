import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface AmdGpuStats {
  name: string;
  temperature: number;
  usage: number;
  memoryUsage: number;
  coreClock: number;
  memoryClock: number;
  fanRpm: number;
  driverVersion: string;
  powerConsumption: number;
}

export default function AmdGpuPanel() {
  const [stats, setStats] = useState<AmdGpuStats>({
    name: "AMD Radeon RX 7800 XT",
    temperature: 68,
    usage: 45,
    memoryUsage: 4200,
    coreClock: 2100,
    memoryClock: 1950,
    fanRpm: 1850,
    driverVersion: "Adrenalin 24.1.1",
    powerConsumption: 180,
  });

  const [settings, setSettings] = useState({
    fpsCapEnabled: false,
    fpsCap: 144,
    fanSpeed: 50,
    powerLimit: 100,
    antiLagEnabled: false,
    imageSharpeningEnabled: false,
  });

  const [status, setStatus] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  const { toast } = useToast();

  // Simulate real-time AMD GPU stats
  useEffect(() => {
    let mounted = true;
    
    const fetchStats = async () => {
      try {
        // Simulate API call to AMD agent
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (mounted) {
          setStats(prev => ({
            ...prev,
            temperature: Math.max(45, Math.min(85, prev.temperature + (Math.random() - 0.5) * 3)),
            usage: Math.max(0, Math.min(100, prev.usage + (Math.random() - 0.5) * 12)),
            memoryUsage: Math.max(1000, Math.min(8000, prev.memoryUsage + (Math.random() - 0.5) * 200)),
            fanRpm: Math.max(800, Math.min(3000, prev.fanRpm + (Math.random() - 0.5) * 100)),
            powerConsumption: Math.max(50, Math.min(300, prev.powerConsumption + (Math.random() - 0.5) * 20)),
          }));
          setIsConnected(true);
        }
      } catch (e) {
        if (mounted) {
          setIsConnected(false);
        }
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 2000);
    
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const applyFpsCap = async () => {
    setStatus("Applying FRTC settings...");
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setStatus("FRTC applied successfully.");
    toast({
      title: "Frame Rate Target Control Applied",
      description: `FPS cap set to ${settings.fpsCap} using AMD FRTC technology.`,
    });
  };

  const setFanCurve = async () => {
    setStatus("Configuring fan curve...");
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setStatus("Fan curve updated.");
    toast({
      title: "Fan Speed Applied",
      description: `Fan speed set to ${settings.fanSpeed}% using AMD WattMan.`,
    });
  };

  const setPowerLimit = async () => {
    setStatus("Adjusting power limit...");
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    setStatus("Power limit configured.");
    toast({
      title: "Power Limit Applied",
      description: `GPU power limit set to ${settings.powerLimit}% for optimal performance.`,
    });
  };

  const toggleAntiLag = async () => {
    setStatus("Configuring Radeon Anti-Lag...");
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 600));
    
    setSettings(prev => ({ ...prev, antiLagEnabled: !prev.antiLagEnabled }));
    setStatus("Anti-Lag updated.");
    
    toast({
      title: "Radeon Anti-Lag",
      description: settings.antiLagEnabled 
        ? "Anti-Lag disabled" 
        : "Anti-Lag enabled for reduced input latency",
    });
  };

  const toggleImageSharpening = async () => {
    setStatus("Configuring Radeon Image Sharpening...");
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 600));
    
    setSettings(prev => ({ ...prev, imageSharpeningEnabled: !prev.imageSharpeningEnabled }));
    setStatus("Image Sharpening updated.");
    
    toast({
      title: "Radeon Image Sharpening",
      description: settings.imageSharpeningEnabled 
        ? "Image Sharpening disabled" 
        : "Image Sharpening enabled for enhanced visuals",
    });
  };

  const applyPreset = async (presetName: string) => {
    setStatus(`Applying ${presetName} preset...`);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Apply preset-specific settings
    switch (presetName) {
      case "Gaming":
        setSettings(prev => ({
          ...prev,
          fpsCapEnabled: true,
          fpsCap: 144,
          fanSpeed: 70,
          powerLimit: 110,
          antiLagEnabled: true,
        }));
        break;
      case "Silent":
        setSettings(prev => ({
          ...prev,
          fpsCapEnabled: true,
          fpsCap: 60,
          fanSpeed: 30,
          powerLimit: 80,
          antiLagEnabled: false,
        }));
        break;
      case "Performance":
        setSettings(prev => ({
          ...prev,
          fpsCapEnabled: false,
          fanSpeed: 85,
          powerLimit: 120,
          antiLagEnabled: true,
        }));
        break;
    }
    
    setStatus(`${presetName} preset applied.`);
    toast({
      title: "Preset Applied",
      description: `AMD GPU configured for ${presetName.toLowerCase()} optimization.`,
    });
  };

  const resetAll = async () => {
    setStatus("Resetting to defaults...");
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setSettings({
      fpsCapEnabled: false,
      fpsCap: 144,
      fanSpeed: 50,
      powerLimit: 100,
      antiLagEnabled: false,
      imageSharpeningEnabled: false,
    });
    
    setStatus("Reset to default settings.");
    toast({
      title: "Settings Reset",
      description: "All AMD GPU settings have been restored to defaults.",
    });
  };

  const getConnectionStatus = () => {
    return isConnected ? (
      <div className="flex items-center text-neon-green text-sm">
        <div className="w-2 h-2 bg-neon-green rounded-full mr-2 animate-pulse" />
        ADLX Connected
      </div>
    ) : (
      <div className="flex items-center text-yellow-400 text-sm">
        <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2" />
        Simulated Mode
      </div>
    );
  };

  const getTemperatureColor = (temp: number) => {
    if (temp < 60) return "text-neon-blue";
    if (temp < 75) return "text-neon-green";
    if (temp < 85) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className="bg-dark-card rounded-xl p-6 border border-dark-border card-hover">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center mr-4">
            <i className="fab fa-amd text-white text-xl" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">AMD Radeon Tuning</h3>
            <p className="text-gray-400 text-sm">RDNA2/RDNA3 optimization with ADLX SDK</p>
          </div>
        </div>
        {getConnectionStatus()}
      </div>

      {/* Live Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-dark-bg p-3 rounded-lg">
          <div className="text-gray-400 text-xs mb-1">Temperature</div>
          <div className={cn("text-lg font-bold", getTemperatureColor(stats.temperature))}>
            {Math.round(stats.temperature)}°C
          </div>
        </div>
        <div className="bg-dark-bg p-3 rounded-lg">
          <div className="text-gray-400 text-xs mb-1">GPU Usage</div>
          <div className="text-lg font-bold text-neon-green">{Math.round(stats.usage)}%</div>
        </div>
        <div className="bg-dark-bg p-3 rounded-lg">
          <div className="text-gray-400 text-xs mb-1">VRAM Usage</div>
          <div className="text-lg font-bold text-neon-purple">{Math.round(stats.memoryUsage)} MB</div>
        </div>
        <div className="bg-dark-bg p-3 rounded-lg">
          <div className="text-gray-400 text-xs mb-1">Power</div>
          <div className="text-lg font-bold text-neon-yellow">{Math.round(stats.powerConsumption)}W</div>
        </div>
      </div>

      {/* Frame Rate Target Control (FRTC) */}
      <div className="mb-6 bg-dark-bg rounded-lg p-4 border border-dark-border">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-white font-semibold">Frame Rate Target Control (FRTC)</h4>
          <Switch
            checked={settings.fpsCapEnabled}
            onCheckedChange={(checked) => setSettings(prev => ({ ...prev, fpsCapEnabled: checked }))}
            className="data-[state=checked]:bg-neon-green"
          />
        </div>
        <div className="flex items-center gap-3">
          <Select 
            value={settings.fpsCap.toString()} 
            onValueChange={(value) => setSettings(prev => ({ ...prev, fpsCap: parseInt(value) }))}
          >
            <SelectTrigger className="w-32 bg-dark-card border-dark-border text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-dark-card border-dark-border">
              <SelectItem value="240" className="text-white hover:bg-dark-bg">240 FPS</SelectItem>
              <SelectItem value="180" className="text-white hover:bg-dark-bg">180 FPS</SelectItem>
              <SelectItem value="144" className="text-white hover:bg-dark-bg">144 FPS</SelectItem>
              <SelectItem value="120" className="text-white hover:bg-dark-bg">120 FPS</SelectItem>
              <SelectItem value="60" className="text-white hover:bg-dark-bg">60 FPS</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={applyFpsCap}
            className="bg-neon-green text-dark-bg hover:bg-neon-green/90"
          >
            Apply FRTC
          </Button>
        </div>
      </div>

      {/* Performance Tuning */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Fan Control */}
        <div className="bg-dark-bg rounded-lg p-4 border border-dark-border">
          <h4 className="text-white font-semibold mb-3">Fan Speed Control</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Fan Speed</span>
              <span className="text-neon-blue font-bold">{settings.fanSpeed}%</span>
            </div>
            <Slider
              value={[settings.fanSpeed]}
              onValueChange={([value]) => setSettings(prev => ({ ...prev, fanSpeed: value }))}
              min={20}
              max={100}
              step={5}
              className="w-full"
            />
            <Button 
              onClick={setFanCurve}
              size="sm" 
              className="w-full bg-neon-blue text-white hover:bg-neon-blue/90"
            >
              Apply Fan Curve
            </Button>
          </div>
        </div>

        {/* Power Limit */}
        <div className="bg-dark-bg rounded-lg p-4 border border-dark-border">
          <h4 className="text-white font-semibold mb-3">Power Limit</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Power Target</span>
              <span className="text-neon-yellow font-bold">{settings.powerLimit}%</span>
            </div>
            <Slider
              value={[settings.powerLimit]}
              onValueChange={([value]) => setSettings(prev => ({ ...prev, powerLimit: value }))}
              min={50}
              max={120}
              step={5}
              className="w-full"
            />
            <Button 
              onClick={setPowerLimit}
              size="sm" 
              className="w-full bg-neon-yellow text-dark-bg hover:bg-neon-yellow/90"
            >
              Apply Power Limit
            </Button>
          </div>
        </div>
      </div>

      {/* AMD Features */}
      <div className="mb-6 bg-dark-bg rounded-lg p-4 border border-dark-border">
        <h4 className="text-white font-semibold mb-4">AMD Technologies</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-white font-medium">Radeon Anti-Lag</span>
              <p className="text-gray-400 text-xs">Reduces input latency</p>
            </div>
            <Switch
              checked={settings.antiLagEnabled}
              onCheckedChange={toggleAntiLag}
              className="data-[state=checked]:bg-neon-green"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-white font-medium">Image Sharpening</span>
              <p className="text-gray-400 text-xs">Enhanced visual clarity</p>
            </div>
            <Switch
              checked={settings.imageSharpeningEnabled}
              onCheckedChange={toggleImageSharpening}
              className="data-[state=checked]:bg-neon-green"
            />
          </div>
        </div>
      </div>

      {/* Quick Presets */}
      <div className="mb-6 bg-dark-bg rounded-lg p-4 border border-dark-border">
        <h4 className="text-white font-semibold mb-3">Quick Presets</h4>
        <div className="grid grid-cols-3 gap-3">
          <Button
            onClick={() => applyPreset("Gaming")}
            className="h-16 bg-dark-card border border-dark-border hover:bg-neon-green hover:text-dark-bg flex flex-col items-center justify-center"
          >
            <i className="fas fa-gamepad mb-1" />
            <span className="text-sm">Gaming</span>
          </Button>
          <Button
            onClick={() => applyPreset("Silent")}
            className="h-16 bg-dark-card border border-dark-border hover:bg-neon-blue hover:text-white flex flex-col items-center justify-center"
          >
            <i className="fas fa-volume-mute mb-1" />
            <span className="text-sm">Silent</span>
          </Button>
          <Button
            onClick={() => applyPreset("Performance")}
            className="h-16 bg-dark-card border border-dark-border hover:bg-neon-purple hover:text-white flex flex-col items-center justify-center"
          >
            <i className="fas fa-rocket mb-1" />
            <span className="text-sm">Performance</span>
          </Button>
        </div>
      </div>

      {/* Status and Reset */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-400">
          {status || "Ready for AMD GPU optimization"}
        </div>
        <Button
          onClick={resetAll}
          variant="destructive"
          className="bg-red-600 hover:bg-red-700"
        >
          <i className="fas fa-undo mr-2" />
          Reset All
        </Button>
      </div>
    </div>
  );
}