import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/Dashboard";
import SystemOptimizer from "@/pages/SystemOptimizer";
import NetworkBooster from "@/pages/NetworkBooster";
import GPUTuner from "@/pages/GPUTuner";
import FortniteOptimizer from "@/pages/FortniteOptimizer";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/system" component={SystemOptimizer} />
      <Route path="/network" component={NetworkBooster} />
      <Route path="/gpu" component={GPUTuner} />
      <Route path="/fortnite" component={FortniteOptimizer} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
