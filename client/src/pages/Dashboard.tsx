import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sidebar } from "@/components/Sidebar";
import { StatCard } from "@/components/StatCard";
import { OptimizationCard } from "@/components/OptimizationCard";
import { AIAssistant } from "@/components/AIAssistant";
import FPSOverlay from "@/components/FPSOverlay";
import OptimizationChatbot from "@/components/OptimizationChatbot";
import { PremiumTiers } from "@/components/PremiumTiers";
import { Settings } from "@/components/Settings";
import { Button } from "@/components/ui/button";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { GameProfile } from "@/types/system";

export default function Dashboard() {
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { systemStats, isConnected } = useWebSocket();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: gameProfiles = [] } = useQuery<GameProfile[]>({
    queryKey: ['/api/game-profiles'],
  });

  const updateProfileMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<GameProfile> }) => {
      const response = await apiRequest('PUT', `/api/game-profiles/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/game-profiles'] });
      toast({
        title: "Profile Updated",
        description: "Game profile has been successfully updated.",
      });
    },
  });

  const handleOptimizeSystem = () => {
    toast({
      title: "System Optimization Started",
      description: "Running comprehensive system optimization...",
    });
  };

  const handleCreateProfile = () => {
    toast({
      title: "Profile Creator",
      description: "Game profile creation wizard will be available in the full version.",
    });
  };

  const handleGameProfileClick = (profileId: string) => {
    updateProfileMutation.mutate({
      id: profileId,
      updates: { isActive: true }
    });
  };

  return (
    <div className="flex h-screen bg-dark-bg text-white font-inter overflow-hidden">
      <Sidebar onOpenSettings={() => setShowSettings(true)} />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-dark-card border-b border-dark-border p-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Gaming Dashboard</h2>
            <p className="text-gray-400 flex items-center">
              Real-time system optimization and monitoring
              {isConnected ? (
                <i className="fas fa-circle text-neon-green text-xs ml-2" title="Connected" />
              ) : (
                <i className="fas fa-circle text-red-500 text-xs ml-2" title="Disconnected" />
              )}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => setShowAIAssistant(true)}
              className="bg-neon-green text-dark-bg hover:bg-neon-green/90 transition-colors"
            >
              <i className="fas fa-robot mr-2" />
              AI Assistant
            </Button>
            <div className="w-10 h-10 bg-gradient-to-r from-neon-green to-neon-blue rounded-full flex items-center justify-center">
              <i className="fas fa-user text-dark-bg" />
            </div>
          </div>
        </header>

        {/* Main Dashboard */}
        <main className="flex-1 p-6 overflow-y-auto">
          {/* Performance Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="CPU Usage"
              icon="fas fa-microchip"
              value={`${systemStats?.cpuUsage || 0}%`}
              percentage={systemStats?.cpuUsage || 0}
              subtitle={`Temperature: ${systemStats?.cpuTemp || 0}°C`}
              color="text-neon-blue"
              glowColor="bg-gradient-to-r from-neon-green to-neon-blue"
            />

            <StatCard
              title="GPU Usage"
              icon="fas fa-display"
              value={`${systemStats?.gpuUsage || 0}%`}
              percentage={systemStats?.gpuUsage || 0}
              subtitle={`Temperature: ${systemStats?.gpuTemp || 0}°C`}
              color="text-neon-green"
              glowColor="bg-gradient-to-r from-neon-green to-neon-blue"
            />

            <StatCard
              title="RAM Usage"
              icon="fas fa-memory"
              value={`${systemStats?.ramUsed || '0.0'}GB`}
              percentage={systemStats ? Math.round((parseFloat(systemStats.ramUsed) / 16) * 100) : 0}
              subtitle={`Available: ${systemStats?.ramAvailable || '0.0'}GB`}
              color="text-neon-purple"
              glowColor="bg-gradient-to-r from-neon-green to-neon-blue"
            />

            <StatCard
              title="Network"
              icon="fas fa-wifi"
              value={`${systemStats?.networkPing || 0}ms`}
              subtitle={`↑ ${systemStats?.networkUpload || 0} Mbps ↓ ${systemStats?.networkDownload || 0} Mbps`}
              color="text-neon-blue"
              glowColor="bg-gradient-to-r from-neon-green to-neon-blue"
            />
          </div>

          {/* Optimization Modules */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <OptimizationCard
              title="System Optimizer"
              description="Clean and boost system performance"
              icon="fas fa-cogs"
              color="text-neon-green"
              buttonText="Optimize Now"
              buttonColor="bg-neon-green text-dark-bg hover:bg-neon-green/90"
              onOptimize={handleOptimizeSystem}
              settings={[
                { label: "Temporary Files Cleanup", enabled: true },
                { label: "Registry Optimization", enabled: true },
                { label: "Startup Manager", enabled: false },
              ]}
            />

            <div className="bg-dark-card rounded-xl p-6 border border-dark-border card-hover">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <i className="fas fa-gamepad text-neon-purple text-2xl mr-4 neon-glow" />
                  <div>
                    <h3 className="text-xl font-bold text-white">Gaming Profiles</h3>
                    <p className="text-gray-400">Game-specific optimizations</p>
                  </div>
                </div>
                <Button
                  onClick={handleCreateProfile}
                  className="bg-neon-purple text-white hover:bg-neon-purple/90 transition-colors"
                >
                  Create Profile
                </Button>
              </div>
              
              <div className="space-y-3">
                {gameProfiles.map((profile: GameProfile) => (
                  <div
                    key={profile.id}
                    onClick={() => handleGameProfileClick(profile.id)}
                    className="flex items-center justify-between p-3 bg-dark-bg rounded-lg hover:bg-dark-border transition-colors cursor-pointer"
                  >
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded mr-3 flex items-center justify-center ${
                        profile.name === 'Valorant' ? 'bg-gradient-to-r from-blue-500 to-purple-600' :
                        profile.name === 'Fortnite' ? 'bg-gradient-to-r from-yellow-500 to-orange-600' :
                        'bg-gradient-to-r from-green-500 to-teal-600'
                      }`}>
                        <i className={`text-white text-sm ${profile.icon}`} />
                      </div>
                      <span className="text-white">{profile.name}</span>
                    </div>
                    <span className={`text-sm ${
                      profile.isActive ? 'text-neon-green' : 'text-gray-400'
                    }`}>
                      {profile.isActive ? 'Active' : 'Ready'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Gaming Tools */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <FPSOverlay />
            <OptimizationChatbot />
          </div>

          {/* Premium Tiers */}
          <PremiumTiers />
        </main>
      </div>

      {/* Modals */}
      <AIAssistant
        isOpen={showAIAssistant}
        onClose={() => setShowAIAssistant(false)}
      />
      
      <Settings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
}
