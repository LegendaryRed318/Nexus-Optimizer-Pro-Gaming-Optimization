import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface FpsCapControlProps {
  className?: string;
}

export default function FpsCapControl({ className }: FpsCapControlProps) {
  const [selectedFps, setSelectedFps] = useState("144");
  const [globalCap, setGlobalCap] = useState(false);
  const [fortniteCapEnabled, setFortniteCapEnabled] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  
  const { toast } = useToast();

  const fpsOptions = [
    { value: "240", label: "240 FPS", description: "Maximum performance" },
    { value: "180", label: "180 FPS", description: "High refresh rate" },
    { value: "144", label: "144 FPS", description: "144Hz displays" },
    { value: "120", label: "120 FPS", description: "Console matching" },
    { value: "100", label: "100 FPS", description: "Stable performance" },
    { value: "60", label: "60 FPS", description: "Standard gaming" },
    { value: "30", label: "30 FPS", description: "Battery saving" },
  ];

  const applyFpsCap = async (scope: "fortnite" | "global") => {
    setIsApplying(true);
    
    try {
      // Simulate API call to native agent
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 500));
      
      if (scope === "fortnite") {
        setFortniteCapEnabled(true);
        toast({
          title: "Fortnite FPS Cap Applied",
          description: `Fortnite will now run at maximum ${selectedFps} FPS. Restart the game to apply changes.`,
        });
      } else {
        setGlobalCap(true);
        toast({
          title: "Global FPS Cap Applied",
          description: `System-wide FPS limit set to ${selectedFps} FPS for all DirectX games.`,
        });
      }
    } catch (error) {
      toast({
        title: "Failed to Apply FPS Cap",
        description: "Could not modify game configuration. Please check file permissions.",
        variant: "destructive",
      });
    } finally {
      setIsApplying(false);
    }
  };

  const removeFpsCap = async (scope: "fortnite" | "global") => {
    setIsApplying(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (scope === "fortnite") {
        setFortniteCapEnabled(false);
        toast({
          title: "Fortnite FPS Cap Removed",
          description: "Fortnite will now use unlimited FPS (based on hardware capability).",
        });
      } else {
        setGlobalCap(false);
        toast({
          title: "Global FPS Cap Removed",
          description: "System-wide FPS limit has been disabled.",
        });
      }
    } catch (error) {
      toast({
        title: "Failed to Remove FPS Cap",
        description: "Could not modify configuration files.",
        variant: "destructive",
      });
    } finally {
      setIsApplying(false);
    }
  };

  const getRecommendedFps = () => {
    const fps = parseInt(selectedFps);
    if (fps >= 240) return { color: "text-neon-purple", text: "High-end gaming" };
    if (fps >= 144) return { color: "text-neon-green", text: "Competitive gaming" };
    if (fps >= 100) return { color: "text-neon-blue", text: "Smooth performance" };
    if (fps >= 60) return { color: "text-yellow-400", text: "Standard gaming" };
    return { color: "text-gray-400", text: "Power saving" };
  };

  const recommendation = getRecommendedFps();

  return (
    <div className={cn("bg-dark-card rounded-xl p-6 border border-dark-border card-hover", className)}>
      <div className="flex items-center mb-6">
        <i className="fas fa-tachometer-alt text-neon-yellow text-2xl mr-4 neon-glow" />
        <div>
          <h3 className="text-xl font-bold text-white">FPS Cap Control</h3>
          <p className="text-gray-400 text-sm">Limit frame rates for better stability and temperature control</p>
        </div>
      </div>

      {/* FPS Selection */}
      <div className="mb-6">
        <label className="block text-white font-medium mb-3">Target FPS Limit</label>
        <div className="flex items-center gap-4">
          <Select value={selectedFps} onValueChange={setSelectedFps}>
            <SelectTrigger className="w-48 bg-dark-bg border-dark-border text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-dark-bg border-dark-border">
              {fpsOptions.map((option) => (
                <SelectItem 
                  key={option.value} 
                  value={option.value}
                  className="text-white hover:bg-dark-card"
                >
                  <div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs text-gray-400">{option.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center space-x-2">
            <div className={cn("text-sm font-medium", recommendation.color)}>
              {recommendation.text}
            </div>
          </div>
        </div>
      </div>

      {/* Fortnite Specific */}
      <div className="mb-6 bg-dark-bg rounded-lg p-4 border border-dark-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <i className="fas fa-gamepad text-blue-400 mr-3" />
            <div>
              <h4 className="text-white font-semibold">Fortnite Configuration</h4>
              <p className="text-gray-400 text-sm">Edit GameUserSettings.ini directly</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={cn("text-sm", fortniteCapEnabled ? "text-neon-green" : "text-gray-400")}>
              {fortniteCapEnabled ? "Active" : "Disabled"}
            </span>
            <Switch
              checked={fortniteCapEnabled}
              onCheckedChange={(checked) => {
                if (checked) {
                  applyFpsCap("fortnite");
                } else {
                  removeFpsCap("fortnite");
                }
              }}
              disabled={isApplying}
              className="data-[state=checked]:bg-neon-green"
            />
          </div>
        </div>
        <div className="text-xs text-gray-400">
          Path: %localappdata%\FortniteGame\Saved\Config\WindowsClient\GameUserSettings.ini
        </div>
      </div>

      {/* Global System-wide */}
      <div className="mb-6 bg-dark-bg rounded-lg p-4 border border-dark-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <i className="fas fa-globe text-neon-purple mr-3" />
            <div>
              <h4 className="text-white font-semibold">Global FPS Limit</h4>
              <p className="text-gray-400 text-sm">System-wide DirectX frame rate cap</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={cn("text-sm", globalCap ? "text-neon-green" : "text-gray-400")}>
              {globalCap ? "Active" : "Disabled"}
            </span>
            <Switch
              checked={globalCap}
              onCheckedChange={(checked) => {
                if (checked) {
                  applyFpsCap("global");
                } else {
                  removeFpsCap("global");
                }
              }}
              disabled={isApplying}
              className="data-[state=checked]:bg-neon-green"
            />
          </div>
        </div>
        <div className="text-xs text-gray-400">
          Applies to: All DirectX games via GPU driver settings
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Button
          onClick={() => {
            setSelectedFps("240");
            applyFpsCap("fortnite");
          }}
          disabled={isApplying}
          className="h-12 bg-dark-bg border border-dark-border hover:bg-neon-purple hover:text-white flex flex-col items-center justify-center"
        >
          <span className="text-xs">240 FPS</span>
          <span className="text-xs opacity-70">Maximum</span>
        </Button>
        
        <Button
          onClick={() => {
            setSelectedFps("144");
            applyFpsCap("fortnite");
          }}
          disabled={isApplying}
          className="h-12 bg-dark-bg border border-dark-border hover:bg-neon-green hover:text-dark-bg flex flex-col items-center justify-center"
        >
          <span className="text-xs">144 FPS</span>
          <span className="text-xs opacity-70">Competitive</span>
        </Button>
        
        <Button
          onClick={() => {
            setSelectedFps("60");
            applyFpsCap("fortnite");
          }}
          disabled={isApplying}
          className="h-12 bg-dark-bg border border-dark-border hover:bg-neon-blue hover:text-white flex flex-col items-center justify-center"
        >
          <span className="text-xs">60 FPS</span>
          <span className="text-xs opacity-70">Stable</span>
        </Button>
        
        <Button
          onClick={() => {
            removeFpsCap("fortnite");
            removeFpsCap("global");
          }}
          disabled={isApplying}
          className="h-12 bg-dark-bg border border-red-500 text-red-400 hover:bg-red-500 hover:text-white flex flex-col items-center justify-center"
        >
          <span className="text-xs">Remove</span>
          <span className="text-xs opacity-70">All Caps</span>
        </Button>
      </div>

      {isApplying && (
        <div className="mt-4 flex items-center justify-center text-neon-blue">
          <i className="fas fa-spinner animate-spin mr-2" />
          <span className="text-sm">Applying FPS configuration...</span>
        </div>
      )}
    </div>
  );
}