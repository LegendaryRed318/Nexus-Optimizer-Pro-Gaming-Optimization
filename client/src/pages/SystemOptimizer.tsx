import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function SystemOptimizer() {
  const [status, setStatus] = useState({
    tempCleanup: "idle",
    registryTweaks: "idle",
    startupManager: "idle",
    ramCleaner: "idle",
    cpuGpuTweaks: "idle",
    bgProcessMgmt: "idle",
  });

  const [backupCreated, setBackupCreated] = useState(false);
  const [selectedProcesses, setSelectedProcesses] = useState<number[]>([]);
  const [processList] = useState([
    { pid: 1234, name: "Discord.exe", cpu: 5.2, memory: "245MB" },
    { pid: 5678, name: "Chrome.exe", cpu: 12.8, memory: "1.2GB" },
    { pid: 9012, name: "GameOverlay.exe", cpu: 2.1, memory: "89MB" },
    { pid: 3456, name: "Spotify.exe", cpu: 3.7, memory: "156MB" },
    { pid: 7890, name: "TeamViewer.exe", cpu: 1.4, memory: "67MB" },
  ]);

  const { toast } = useToast();

  const handleCreateBackup = () => {
    setBackupCreated(true);
    toast({
      title: "System Backup Created",
      description: "All system settings have been backed up. You can now safely apply optimizations.",
    });
  };

  const runOptimization = async (feature: keyof typeof status) => {
    setStatus((prev) => ({ ...prev, [feature]: "running" }));
    
    // Simulate optimization process
    await new Promise((resolve) => setTimeout(resolve, 2000 + Math.random() * 1000));
    
    setStatus((prev) => ({ ...prev, [feature]: "done" }));
    
    const messages = {
      tempCleanup: "Cleaned 2.3GB of temporary files and cache data",
      registryTweaks: "Applied 15 registry optimizations for better performance",
      startupManager: "Disabled 8 unnecessary startup programs",
      ramCleaner: "Freed 1.2GB of RAM and optimized memory allocation",
      cpuGpuTweaks: "Applied CPU priority tweaks and GPU performance settings",
      bgProcessMgmt: "Optimized background process priorities",
    };

    toast({
      title: "Optimization Complete",
      description: messages[feature],
    });
  };

  const toggleProcessSelection = (pid: number) => {
    setSelectedProcesses((prev) =>
      prev.includes(pid) ? prev.filter((id) => id !== pid) : [...prev, pid]
    );
  };

  const killSelectedProcesses = () => {
    if (selectedProcesses.length === 0) {
      toast({
        title: "No Processes Selected",
        description: "Please select processes to terminate before proceeding.",
        variant: "destructive",
      });
      return;
    }
    
    const processNames = processList
      .filter(p => selectedProcesses.includes(p.pid))
      .map(p => p.name)
      .join(", ");
    
    toast({
      title: "Processes Terminated",
      description: `Successfully terminated: ${processNames}`,
    });
    
    setSelectedProcesses([]);
  };

  return (
    <div className="flex h-screen bg-dark-bg text-white">
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white font-orbitron">System Optimizer</h1>
              <p className="text-gray-400 mt-2">Comprehensive system optimization and cleanup tools</p>
            </div>
            <Button
              onClick={handleCreateBackup}
              className={cn(
                "px-6 py-3 font-medium transition-all duration-300",
                backupCreated 
                  ? "bg-neon-green text-dark-bg hover:bg-neon-green/90" 
                  : "bg-neon-blue text-dark-bg hover:bg-neon-blue/90"
              )}
            >
              {backupCreated ? "✓ Backup Created" : "Create System Backup"}
            </Button>
          </div>

          {/* Optimization Modules Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Temporary File Cleanup */}
            <div className="bg-dark-card rounded-xl p-6 border border-dark-border card-hover">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <i className="fas fa-trash-alt text-neon-green text-2xl mr-4 neon-glow" />
                  <div>
                    <h3 className="text-xl font-bold text-white">Temporary File Cleanup</h3>
                    <p className="text-gray-400 text-sm">Remove temporary files and cache data</p>
                  </div>
                </div>
                <Button
                  disabled={!backupCreated || status.tempCleanup === "running"}
                  onClick={() => runOptimization("tempCleanup")}
                  className={cn(
                    "transition-all duration-300",
                    status.tempCleanup === "done" 
                      ? "bg-neon-green text-dark-bg" 
                      : "bg-neon-blue text-dark-bg hover:bg-neon-blue/90",
                    "disabled:bg-gray-600 disabled:text-gray-400"
                  )}
                >
                  {status.tempCleanup === "running" ? (
                    <>
                      <i className="fas fa-spinner animate-spin mr-2" />
                      Cleaning...
                    </>
                  ) : status.tempCleanup === "done" ? (
                    <>✓ Cleaned</>
                  ) : (
                    "Clean Files"
                  )}
                </Button>
              </div>
              <div className="text-sm text-gray-400">
                <p>• Windows temp folders</p>
                <p>• Browser cache files</p>
                <p>• Application logs</p>
              </div>
            </div>

            {/* Registry Tweaks */}
            <div className="bg-dark-card rounded-xl p-6 border border-dark-border card-hover">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <i className="fas fa-cogs text-neon-purple text-2xl mr-4 neon-glow" />
                  <div>
                    <h3 className="text-xl font-bold text-white">Registry Optimization</h3>
                    <p className="text-gray-400 text-sm">Apply performance registry tweaks</p>
                  </div>
                </div>
                <Button
                  disabled={!backupCreated || status.registryTweaks === "running"}
                  onClick={() => runOptimization("registryTweaks")}
                  className={cn(
                    "transition-all duration-300",
                    status.registryTweaks === "done" 
                      ? "bg-neon-green text-dark-bg" 
                      : "bg-neon-purple text-white hover:bg-neon-purple/90",
                    "disabled:bg-gray-600 disabled:text-gray-400"
                  )}
                >
                  {status.registryTweaks === "running" ? (
                    <>
                      <i className="fas fa-spinner animate-spin mr-2" />
                      Applying...
                    </>
                  ) : status.registryTweaks === "done" ? (
                    <>✓ Applied</>
                  ) : (
                    "Apply Tweaks"
                  )}
                </Button>
              </div>
              <div className="text-sm text-gray-400">
                <p>• Visual effects optimization</p>
                <p>• Memory management tweaks</p>
                <p>• Gaming performance settings</p>
              </div>
            </div>

            {/* Startup Manager */}
            <div className="bg-dark-card rounded-xl p-6 border border-dark-border card-hover">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <i className="fas fa-rocket text-neon-blue text-2xl mr-4 neon-glow" />
                  <div>
                    <h3 className="text-xl font-bold text-white">Startup Manager</h3>
                    <p className="text-gray-400 text-sm">Optimize boot time and startup programs</p>
                  </div>
                </div>
                <Button
                  disabled={!backupCreated || status.startupManager === "running"}
                  onClick={() => runOptimization("startupManager")}
                  className={cn(
                    "transition-all duration-300",
                    status.startupManager === "done" 
                      ? "bg-neon-green text-dark-bg" 
                      : "bg-neon-blue text-dark-bg hover:bg-neon-blue/90",
                    "disabled:bg-gray-600 disabled:text-gray-400"
                  )}
                >
                  {status.startupManager === "running" ? (
                    <>
                      <i className="fas fa-spinner animate-spin mr-2" />
                      Optimizing...
                    </>
                  ) : status.startupManager === "done" ? (
                    <>✓ Optimized</>
                  ) : (
                    "Optimize Startup"
                  )}
                </Button>
              </div>
              <div className="text-sm text-gray-400">
                <p>• Disable unnecessary programs</p>
                <p>• Prioritize gaming applications</p>
                <p>• Reduce boot time</p>
              </div>
            </div>

            {/* RAM Cleaner */}
            <div className="bg-dark-card rounded-xl p-6 border border-dark-border card-hover">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <i className="fas fa-memory text-neon-green text-2xl mr-4 neon-glow" />
                  <div>
                    <h3 className="text-xl font-bold text-white">RAM Optimizer</h3>
                    <p className="text-gray-400 text-sm">Free up and optimize memory usage</p>
                  </div>
                </div>
                <Button
                  disabled={!backupCreated || status.ramCleaner === "running"}
                  onClick={() => runOptimization("ramCleaner")}
                  className={cn(
                    "transition-all duration-300",
                    status.ramCleaner === "done" 
                      ? "bg-neon-green text-dark-bg" 
                      : "bg-neon-green text-dark-bg hover:bg-neon-green/90",
                    "disabled:bg-gray-600 disabled:text-gray-400"
                  )}
                >
                  {status.ramCleaner === "running" ? (
                    <>
                      <i className="fas fa-spinner animate-spin mr-2" />
                      Cleaning...
                    </>
                  ) : status.ramCleaner === "done" ? (
                    <>✓ Optimized</>
                  ) : (
                    "Optimize RAM"
                  )}
                </Button>
              </div>
              <div className="text-sm text-gray-400">
                <p>• Clear inactive memory</p>
                <p>• Optimize memory allocation</p>
                <p>• Defragment system memory</p>
              </div>
            </div>

          </div>

          {/* Background Process Management */}
          <div className="bg-dark-card rounded-xl p-6 border border-dark-border card-hover">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <i className="fas fa-tasks text-neon-purple text-2xl mr-4 neon-glow" />
                <div>
                  <h3 className="text-xl font-bold text-white">Background Process Management</h3>
                  <p className="text-gray-400">Select and terminate resource-heavy processes</p>
                </div>
              </div>
              <Button
                onClick={killSelectedProcesses}
                disabled={selectedProcesses.length === 0}
                className="bg-red-500 text-white hover:bg-red-600 disabled:bg-gray-600 disabled:text-gray-400"
              >
                <i className="fas fa-times mr-2" />
                Terminate Selected
              </Button>
            </div>

            <div className="bg-dark-bg rounded-lg p-4 max-h-64 overflow-auto">
              <div className="grid grid-cols-1 gap-2">
                {processList.map(({ pid, name, cpu, memory }) => (
                  <label
                    key={pid}
                    className="flex items-center justify-between p-3 bg-dark-card rounded-lg cursor-pointer hover:bg-dark-border transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <Switch
                        checked={selectedProcesses.includes(pid)}
                        onCheckedChange={() => toggleProcessSelection(pid)}
                      />
                      <div>
                        <span className="text-white font-medium">{name}</span>
                        <div className="text-sm text-gray-400">
                          PID: {pid} | CPU: {cpu}% | Memory: {memory}
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}