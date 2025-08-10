import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Dashboard from "@/pages/Dashboard";
import SystemOptimizer from "@/pages/SystemOptimizer";
import NetworkBooster from "@/pages/NetworkBooster";
import GPUTuner from "@/pages/GPUTuner";
import FortniteOptimizer from "@/pages/FortniteOptimizer";
import Settings from "@/pages/Settings";
import LoginSignup from "@/components/LoginSignup";
import NotFound from "@/pages/not-found";
import RestorePoint from "@/pages/RestorePoint";
import BiosTweaks from "@/pages/BiosTweaks";
import AudioTweaks from "@/pages/AudioTweaks";
import RamTweaks from "@/pages/RamTweaks";
import MiscTweaks from "@/pages/MiscTweaks";

function AuthenticatedRouter() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-neon-green to-neon-blue rounded-xl flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-microchip text-white text-2xl animate-pulse" />
          </div>
          <p className="text-white font-orbitron">Loading Nexus Optimizer...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginSignup />;
  }

  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/system" component={SystemOptimizer} />
      <Route path="/network" component={NetworkBooster} />
      <Route path="/gpu" component={GPUTuner} />
      <Route path="/fortnite" component={FortniteOptimizer} />
      <Route path="/settings" component={Settings} />
      <Route path="/restore" component={RestorePoint} />
      <Route path="/bios" component={BiosTweaks} />
      <Route path="/audio" component={AudioTweaks} />
      <Route path="/ram" component={RamTweaks} />
      <Route path="/misc" component={MiscTweaks} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <AuthenticatedRouter />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
