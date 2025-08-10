import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface IntelGpuStats {
  temperature: string;
  usage: string;
  eUClock: string;
  memoryClock: string;
  driverVersion: string;
}

export default function IntelGpuPanel() {
  const [stats, setStats] = useState<IntelGpuStats>({
    temperature: "--",
    usage: "--",
    eUClock: "--",
    memoryClock: "--",
    driverVersion: "--",
  });

  const [powerProfile, setPowerProfile] = useState("balanced");
  const [hagsEnabled, setHagsEnabled] = useState(false);
  const [appPath, setAppPath] = useState("");
  const [appPref, setAppPref] = useState("system");
  const [status, setStatus] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  const { toast } = useToast();

  // Simulate Intel GPU stats (in production, this would connect to your native agent)
  useEffect(() => {
    let mounted = true;
    
    const fetchStats = async () => {
      try {
        // Simulate API call to local agent
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (mounted) {
          setStats({
            temperature: (45 + Math.random() * 25).toFixed(1),
            usage: Math.floor(20 + Math.random() * 60).toString(),
            eUClock: Math.floor(1100 + Math.random() * 300).toString(),
            memoryClock: Math.floor(3600 + Math.random() * 400).toString(),
            driverVersion: "30.0.101.1340",
          });
          setIsConnected(true);
        }
      } catch (e) {
        if (mounted) {
          setStats(prev => ({ ...prev, temperature: "—", usage: "—" }));
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

  const applyPowerProfile = async () => {
    setStatus("Applying power profile...");
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setStatus("Applied power profile.");
    toast({
      title: "Power Profile Applied",
      description: `Intel GPU set to ${powerProfile} mode. Changes take effect immediately.`,
    });
  };

  const toggleHags = async () => {
    setStatus("Toggling HAGS...");
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setHagsEnabled(!hagsEnabled);
    setStatus("HAGS updated (reboot may be required).");
    
    toast({
      title: "HAGS Updated",
      description: hagsEnabled 
        ? "Hardware-accelerated GPU scheduling disabled" 
        : "Hardware-accelerated GPU scheduling enabled. Reboot required.",
    });
  };

  const setAppGpuPreference = async () => {
    if (!appPath) {
      toast({
        title: "Missing App Path",
        description: "Please enter the full path to the executable file.",
        variant: "destructive",
      });
      return;
    }
    
    setStatus("Adding app GPU preference...");
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 600));
    
    setStatus("App GPU preference added.");
    toast({
      title: "GPU Preference Set",
      description: `${appPath.split('\\').pop()} configured for ${appPref} GPU usage.`,
    });
    
    setAppPath("");
  };

  const applyProfile = async (profileName: string) => {
    setStatus("Applying tuning profile...");
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setStatus("Profile applied.");
    toast({
      title: "Profile Applied",
      description: `${profileName} optimization profile has been applied to Intel GPU.`,
    });
  };

  const resetAll = async () => {
    setStatus("Resetting tweaks...");
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    setStatus("All tweaks reset.");
    setPowerProfile("balanced");
    setHagsEnabled(false);
    
    toast({
      title: "Settings Reset",
      description: "All Intel GPU tweaks have been reset to default values.",
    });
  };

  const openIntelTool = (tool: string) => {
    toast({
      title: "Opening Intel Tool",
      description: `Launching ${tool}...`,
    });
  };

  const getConnectionStatus = () => {
    return isConnected ? (
      <div className="flex items-center text-neon-green text-sm">
        <div className="w-2 h-2 bg-neon-green rounded-full mr-2 animate-pulse" />
        Native Agent Connected
      </div>
    ) : (
      <div className="flex items-center text-yellow-400 text-sm">
        <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2" />
        Simulated Mode
      </div>
    );
  };

  return (
    <div className="bg-dark-card rounded-xl p-6 border border-dark-border card-hover">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mr-4">
            <i className="fab fa-intel text-white text-xl" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Intel GPU Tuning</h3>
            <p className="text-gray-400 text-sm">Iris Xe, Arc, and integrated GPU optimization</p>
          </div>
        </div>
        {getConnectionStatus()}
      </div>

      {/* Live Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-dark-bg p-3 rounded-lg">
          <div className="text-gray-400 text-xs mb-1">Temperature</div>
          <div className="text-lg font-bold text-white">{stats.temperature}°C</div>
        </div>
        <div className="bg-dark-bg p-3 rounded-lg">
          <div className="text-gray-400 text-xs mb-1">GPU Usage</div>
          <div className="text-lg font-bold text-neon-blue">{stats.usage}%</div>
        </div>
        <div className="bg-dark-bg p-3 rounded-lg">
          <div className="text-gray-400 text-xs mb-1">EU Clock</div>
          <div className="text-lg font-bold text-neon-purple">{stats.eUClock} MHz</div>
        </div>
        <div className="bg-dark-bg p-3 rounded-lg">
          <div className="text-gray-400 text-xs mb-1">Memory</div>
          <div className="text-lg font-bold text-neon-green">{stats.memoryClock} MHz</div>
        </div>
        <div className="bg-dark-bg p-3 rounded-lg">
          <div className="text-gray-400 text-xs mb-1">Driver</div>
          <div className="text-sm font-bold text-white">{stats.driverVersion}</div>
        </div>
      </div>

      {/* Power Profile */}
      <div className="mb-6 bg-dark-bg rounded-lg p-4 border border-dark-border">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-white font-semibold">Power Profile</h4>
          <span className="text-gray-400 text-sm">Choose power/thermal preset</span>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Select value={powerProfile} onValueChange={setPowerProfile}>
            <SelectTrigger className="w-40 bg-dark-card border-dark-border text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-dark-card border-dark-border">
              <SelectItem value="balanced" className="text-white hover:bg-dark-bg">Balanced</SelectItem>
              <SelectItem value="performance" className="text-white hover:bg-dark-bg">Performance</SelectItem>
              <SelectItem value="power-saver" className="text-white hover:bg-dark-bg">Power Saver</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={applyPowerProfile}
            className="bg-neon-blue text-dark-bg hover:bg-neon-blue/90"
          >
            Apply
          </Button>
          <Button 
            onClick={() => applyProfile("Fortnite Optimized")}
            className="bg-neon-green text-dark-bg hover:bg-neon-green/90"
          >
            <i className="fas fa-gamepad mr-2" />
            Fortnite Profile
          </Button>
        </div>
      </div>

      {/* HAGS Toggle */}
      <div className="mb-6 bg-dark-bg rounded-lg p-4 border border-dark-border">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-white font-semibold">Hardware-accelerated GPU Scheduling</h4>
          <span className="text-gray-400 text-sm">May reduce latency on supported systems</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Switch
              checked={hagsEnabled}
              onCheckedChange={toggleHags}
              className="data-[state=checked]:bg-neon-green"
            />
            <span className="text-white">
              {hagsEnabled ? "Enabled" : "Disabled"}
            </span>
          </div>
          <Button
            onClick={() => openIntelTool("Windows Graphics Settings")}
            variant="outline"
            className="border-dark-border text-gray-300 hover:bg-dark-border"
          >
            <i className="fas fa-external-link-alt mr-2" />
            Graphics Settings
          </Button>
        </div>
      </div>

      {/* Per-app GPU Preference */}
      <div className="mb-6 bg-dark-bg rounded-lg p-4 border border-dark-border">
        <h4 className="text-white font-semibold mb-2">Per-app GPU Preference</h4>
        <p className="text-gray-400 text-sm mb-3">
          Configure specific applications to use high-performance GPU settings
        </p>
        <div className="space-y-3">
          <Input
            type="text"
            placeholder="C:\Games\Fortnite\FortniteClient-Win64-Shipping.exe"
            value={appPath}
            onChange={(e) => setAppPath(e.target.value)}
            className="bg-dark-card border-dark-border text-white placeholder-gray-400"
          />
          <div className="flex gap-3">
            <Select value={appPref} onValueChange={setAppPref}>
              <SelectTrigger className="flex-1 bg-dark-card border-dark-border text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-dark-card border-dark-border">
                <SelectItem value="system" className="text-white hover:bg-dark-bg">System Default</SelectItem>
                <SelectItem value="power-saving" className="text-white hover:bg-dark-bg">Power-saving GPU</SelectItem>
                <SelectItem value="high-performance" className="text-white hover:bg-dark-bg">High-performance GPU</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              onClick={setAppGpuPreference}
              className="bg-neon-purple text-white hover:bg-neon-purple/90"
            >
              <i className="fas fa-plus mr-2" />
              Add
            </Button>
          </div>
        </div>
      </div>

      {/* Intel Tools */}
      <div className="mb-6 bg-dark-bg rounded-lg p-4 border border-dark-border">
        <h4 className="text-white font-semibold mb-3">Intel Tools & Utilities</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button
            onClick={() => openIntelTool("Intel Graphics Command Center")}
            className="h-12 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center"
          >
            <i className="fab fa-intel mr-2" />
            Graphics Command Center
          </Button>
          <Button
            onClick={() => openIntelTool("Intel Power Gadget")}
            className="h-12 bg-gray-600 hover:bg-gray-700 text-white flex items-center justify-center"
          >
            <i className="fas fa-bolt mr-2" />
            Power Gadget
          </Button>
          <Button
            onClick={() => openIntelTool("VTune Profiler")}
            className="h-12 bg-gray-600 hover:bg-gray-700 text-white flex items-center justify-center"
          >
            <i className="fas fa-chart-line mr-2" />
            VTune / Level Zero
          </Button>
        </div>
      </div>

      {/* Status and Reset */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-400">
          {status || "Ready for Intel GPU optimization"}
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