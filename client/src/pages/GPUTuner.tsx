import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import IntelGpuPanel from "@/components/IntelGpuPanel";

export default function GPUTuner() {
  const [gpuStats, setGpuStats] = useState({
    name: "NVIDIA GeForce RTX 4070",
    temperature: 65,
    usage: 48,
    coreClock: 1500,
    memoryClock: 7000,
    fanSpeed: 40,
    powerLimit: 100,
    vramUsed: 3.2,
    vramTotal: 12.0,
  });

  const [settings, setSettings] = useState({
    coreClock: 1500,
    memoryClock: 7000,
    fanSpeed: 40,
    powerLimit: 100,
  });

  const [status, setStatus] = useState<"idle" | "applying" | "applied">("idle");
  const [autoTuningEnabled, setAutoTuningEnabled] = useState(false);

  const { toast } = useToast();

  // Simulate real-time GPU stats updates
  useEffect(() => {
    const interval = setInterval(() => {
      setGpuStats(prev => ({
        ...prev,
        temperature: Math.max(45, Math.min(85, prev.temperature + (Math.random() - 0.5) * 4)),
        usage: Math.max(0, Math.min(100, prev.usage + (Math.random() - 0.5) * 10)),
        vramUsed: Math.max(1, Math.min(prev.vramTotal, prev.vramUsed + (Math.random() - 0.5) * 0.5)),
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const applyTweaks = async () => {
    setStatus("applying");
    
    // Simulate applying GPU tweaks
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setGpuStats(prev => ({
      ...prev,
      coreClock: settings.coreClock,
      memoryClock: settings.memoryClock,
      fanSpeed: settings.fanSpeed,
      powerLimit: settings.powerLimit,
    }));
    
    setStatus("applied");
    
    toast({
      title: "GPU Tweaks Applied",
      description: "Your graphics card has been optimized for better gaming performance.",
    });
    
    // Reset status after 3 seconds
    setTimeout(() => setStatus("idle"), 3000);
  };

  const resetTweaks = () => {
    setSettings({
      coreClock: gpuStats.coreClock,
      memoryClock: gpuStats.memoryClock,
      fanSpeed: gpuStats.fanSpeed,
      powerLimit: gpuStats.powerLimit,
    });
    setStatus("idle");
    
    toast({
      title: "Settings Reset",
      description: "GPU settings have been reset to default values.",
    });
  };

  const runAutoTuning = async () => {
    setAutoTuningEnabled(true);
    
    toast({
      title: "Auto-Tuning Started",
      description: "AI is analyzing your GPU and finding optimal settings...",
    });

    // Simulate auto-tuning process
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Set optimal values
    const optimalSettings = {
      coreClock: gpuStats.coreClock + 150,
      memoryClock: gpuStats.memoryClock + 500,
      fanSpeed: Math.min(80, gpuStats.fanSpeed + 20),
      powerLimit: Math.min(120, gpuStats.powerLimit + 10),
    };
    
    setSettings(optimalSettings);
    setAutoTuningEnabled(false);
    
    toast({
      title: "Auto-Tuning Complete",
      description: "Optimal GPU settings have been found and applied automatically.",
    });
  };

  const getTemperatureColor = (temp: number) => {
    if (temp < 60) return "text-neon-blue";
    if (temp < 75) return "text-neon-green";
    if (temp < 85) return "text-yellow-400";
    return "text-red-400";
  };

  const getUsageColor = (usage: number) => {
    if (usage < 30) return "text-gray-400";
    if (usage < 70) return "text-neon-green";
    return "text-neon-purple";
  };

  return (
    <div className="flex h-screen bg-dark-bg text-white">
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white font-orbitron">GPU Tuner</h1>
            <p className="text-gray-400 mt-2">Fine-tune your graphics card for maximum gaming performance</p>
          </div>

          <Tabs defaultValue="nvidia" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-dark-card border border-dark-border">
              <TabsTrigger 
                value="nvidia" 
                className="data-[state=active]:bg-neon-green data-[state=active]:text-dark-bg"
              >
                <i className="fab fa-nvidia mr-2" />
                NVIDIA GPU
              </TabsTrigger>
              <TabsTrigger 
                value="intel" 
                className="data-[state=active]:bg-neon-blue data-[state=active]:text-white"
              >
                <i className="fab fa-intel mr-2" />
                Intel GPU
              </TabsTrigger>
            </TabsList>

            <TabsContent value="nvidia" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* GPU Statistics */}
            <div className="bg-dark-card rounded-xl p-6 border border-dark-border card-hover">
              <div className="flex items-center mb-6">
                <i className="fas fa-display text-neon-green text-2xl mr-4 neon-glow" />
                <div>
                  <h3 className="text-xl font-bold text-white">GPU Statistics</h3>
                  <p className="text-gray-400 text-sm">{gpuStats.name}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Temperature</span>
                  <span className={cn("font-bold text-lg", getTemperatureColor(gpuStats.temperature))}>
                    {Math.round(gpuStats.temperature)}°C
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-300">GPU Usage</span>
                  <span className={cn("font-bold text-lg", getUsageColor(gpuStats.usage))}>
                    {Math.round(gpuStats.usage)}%
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Core Clock</span>
                  <span className="text-neon-blue font-bold">
                    {Math.round(gpuStats.coreClock)} MHz
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Memory Clock</span>
                  <span className="text-neon-purple font-bold">
                    {Math.round(gpuStats.memoryClock)} MHz
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Fan Speed</span>
                  <span className="text-neon-green font-bold">
                    {Math.round(gpuStats.fanSpeed)}%
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-300">VRAM Usage</span>
                  <span className="text-white font-bold">
                    {gpuStats.vramUsed.toFixed(1)}GB / {gpuStats.vramTotal}GB
                  </span>
                </div>

                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-neon-green to-neon-blue h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(gpuStats.vramUsed / gpuStats.vramTotal) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Tuning Controls */}
            <div className="lg:col-span-2 bg-dark-card rounded-xl p-6 border border-dark-border card-hover">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <i className="fas fa-sliders-h text-neon-purple text-2xl mr-4 neon-glow" />
                  <div>
                    <h3 className="text-xl font-bold text-white">Manual Tuning</h3>
                    <p className="text-gray-400 text-sm">Adjust GPU settings for optimal performance</p>
                  </div>
                </div>
                <Button
                  onClick={runAutoTuning}
                  disabled={autoTuningEnabled}
                  className="bg-gradient-to-r from-neon-purple to-neon-blue text-white hover:opacity-90"
                >
                  {autoTuningEnabled ? (
                    <>
                      <i className="fas fa-spinner animate-spin mr-2" />
                      Auto-Tuning...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-magic mr-2" />
                      Auto-Tune
                    </>
                  )}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Core Clock */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="font-medium text-white">Core Clock</label>
                    <span className="text-neon-blue font-bold">{settings.coreClock} MHz</span>
                  </div>
                  <Slider
                    value={[settings.coreClock]}
                    onValueChange={([value]) => setSettings(prev => ({ ...prev, coreClock: value }))}
                    min={gpuStats.coreClock - 300}
                    max={gpuStats.coreClock + 300}
                    step={25}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>{gpuStats.coreClock - 300} MHz</span>
                    <span>{gpuStats.coreClock + 300} MHz</span>
                  </div>
                </div>

                {/* Memory Clock */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="font-medium text-white">Memory Clock</label>
                    <span className="text-neon-purple font-bold">{settings.memoryClock} MHz</span>
                  </div>
                  <Slider
                    value={[settings.memoryClock]}
                    onValueChange={([value]) => setSettings(prev => ({ ...prev, memoryClock: value }))}
                    min={gpuStats.memoryClock - 1000}
                    max={gpuStats.memoryClock + 1000}
                    step={100}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>{gpuStats.memoryClock - 1000} MHz</span>
                    <span>{gpuStats.memoryClock + 1000} MHz</span>
                  </div>
                </div>

                {/* Fan Speed */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="font-medium text-white">Fan Speed</label>
                    <span className="text-neon-green font-bold">{settings.fanSpeed}%</span>
                  </div>
                  <Slider
                    value={[settings.fanSpeed]}
                    onValueChange={([value]) => setSettings(prev => ({ ...prev, fanSpeed: value }))}
                    min={0}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Auto</span>
                    <span>Max</span>
                  </div>
                </div>

                {/* Power Limit */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="font-medium text-white">Power Limit</label>
                    <span className="text-yellow-400 font-bold">{settings.powerLimit}%</span>
                  </div>
                  <Slider
                    value={[settings.powerLimit]}
                    onValueChange={([value]) => setSettings(prev => ({ ...prev, powerLimit: value }))}
                    min={50}
                    max={120}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>50%</span>
                    <span>120%</span>
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center mt-8">
                <div className="flex space-x-4">
                  <Button
                    onClick={applyTweaks}
                    disabled={status === "applying" || autoTuningEnabled}
                    className="bg-neon-green text-dark-bg hover:bg-neon-green/90 transition-colors px-8"
                  >
                    {status === "applying" ? (
                      <>
                        <i className="fas fa-spinner animate-spin mr-2" />
                        Applying...
                      </>
                    ) : status === "applied" ? (
                      <>
                        <i className="fas fa-check mr-2" />
                        Applied
                      </>
                    ) : (
                      <>
                        <i className="fas fa-play mr-2" />
                        Apply Tweaks
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={resetTweaks}
                    disabled={status === "applying" || autoTuningEnabled}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-8"
                  >
                    <i className="fas fa-undo mr-2" />
                    Reset
                  </Button>
                </div>

                {status === "applied" && (
                  <div className="flex items-center text-neon-green">
                    <i className="fas fa-check-circle mr-2" />
                    <span className="font-medium">Tweaks Applied Successfully!</span>
                  </div>
                )}
              </div>

              {/* Warning Notice */}
              <div className="mt-6 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <div className="flex items-start">
                  <i className="fas fa-exclamation-triangle text-yellow-400 mr-3 mt-0.5" />
                  <div className="text-sm">
                    <p className="text-yellow-400 font-medium mb-1">Overclocking Warning</p>
                    <p className="text-gray-300">
                      Overclocking can increase performance but may cause instability or hardware damage. 
                      Monitor temperatures and start with small increments. Use at your own risk.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* GPU Profiles */}
          <div className="bg-dark-card rounded-xl p-6 border border-dark-border card-hover">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <i className="fas fa-bookmark text-neon-blue text-2xl mr-4 neon-glow" />
                <div>
                  <h3 className="text-xl font-bold text-white">GPU Profiles</h3>
                  <p className="text-gray-400">Pre-configured settings for different use cases</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button className="bg-dark-bg border border-dark-border hover:bg-dark-border h-16 flex flex-col items-center justify-center">
                <i className="fas fa-leaf text-neon-green mb-1" />
                <span>Power Saver</span>
              </Button>
              
              <Button className="bg-dark-bg border border-dark-border hover:bg-dark-border h-16 flex flex-col items-center justify-center">
                <i className="fas fa-balance-scale text-neon-blue mb-1" />
                <span>Balanced</span>
              </Button>
              
              <Button className="bg-dark-bg border border-dark-border hover:bg-dark-border h-16 flex flex-col items-center justify-center">
                <i className="fas fa-fire text-neon-purple mb-1" />
                <span>Performance</span>
              </Button>
            </div>
              </div>
            </TabsContent>

            <TabsContent value="intel" className="space-y-8">
              <IntelGpuPanel />
            </TabsContent>
          </Tabs>

        </div>
      </div>
    </div>
  );
}