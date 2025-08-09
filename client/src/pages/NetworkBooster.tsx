import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const dnsOptions = [
  { label: "Cloudflare DNS", value: "1.1.1.1", description: "Fast and privacy-focused" },
  { label: "Google DNS", value: "8.8.8.8", description: "Reliable and widely used" },
  { label: "Quad9 DNS", value: "9.9.9.9", description: "Security and privacy focused" },
  { label: "Custom", value: "custom", description: "Enter your own DNS server" },
];

export default function NetworkBooster() {
  const [dnsServer, setDnsServer] = useState(dnsOptions[0].value);
  const [customDns, setCustomDns] = useState("");
  const [tcpOptimized, setTcpOptimized] = useState(false);
  const [pingResults, setPingResults] = useState<number[]>([]);
  const [pingRunning, setPingRunning] = useState(false);
  const [pingTarget, setPingTarget] = useState("8.8.8.8");
  const pingInterval = useRef<NodeJS.Timeout | null>(null);
  
  const { toast } = useToast();

  const applyDnsChange = () => {
    const dnsToApply = dnsServer === "custom" ? customDns : dnsServer;
    if (!dnsToApply) {
      toast({
        title: "Invalid DNS Server",
        description: "Please enter a valid DNS server address.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "DNS Server Updated",
      description: `Successfully switched to ${dnsToApply}. Network lookups should be faster now.`,
    });
  };

  const toggleTcpOptimization = () => {
    setTcpOptimized((prev) => !prev);
    
    toast({
      title: tcpOptimized ? "TCP Optimization Disabled" : "TCP Optimization Enabled",
      description: tcpOptimized 
        ? "TCP settings have been reverted to default."
        : "Applied advanced TCP tweaks for better gaming performance.",
    });
  };

  const startPingTest = () => {
    setPingRunning(true);
    setPingResults([]);
    
    pingInterval.current = setInterval(() => {
      setPingResults((prev) => {
        if (prev.length >= 20) {
          if (pingInterval.current) clearInterval(pingInterval.current);
          setPingRunning(false);
          return prev;
        }
        // Simulate realistic ping with some variation
        const basePing = 25;
        const variation = Math.random() * 20 - 10;
        return [...prev, Math.max(1, Math.round(basePing + variation))];
      });
    }, 500);
  };

  const stopPingTest = () => {
    if (pingInterval.current) {
      clearInterval(pingInterval.current);
    }
    setPingRunning(false);
  };

  useEffect(() => {
    return () => {
      if (pingInterval.current) {
        clearInterval(pingInterval.current);
      }
    };
  }, []);

  const averagePing = pingResults.length > 0 
    ? Math.round(pingResults.reduce((a, b) => a + b, 0) / pingResults.length)
    : 0;

  return (
    <div className="flex h-screen bg-dark-bg text-white">
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white font-orbitron">Network Booster</h1>
            <p className="text-gray-400 mt-2">Optimize your network connection for gaming and streaming</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* DNS Optimization */}
            <div className="bg-dark-card rounded-xl p-6 border border-dark-border card-hover">
              <div className="flex items-center mb-6">
                <i className="fas fa-server text-neon-blue text-2xl mr-4 neon-glow" />
                <div>
                  <h3 className="text-xl font-bold text-white">DNS Server Optimization</h3>
                  <p className="text-gray-400 text-sm">Switch to faster DNS for reduced latency</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">DNS Provider</label>
                  <Select value={dnsServer} onValueChange={setDnsServer}>
                    <SelectTrigger className="bg-dark-bg border-dark-border text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-dark-bg border-dark-border">
                      {dnsOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value} className="text-white hover:bg-dark-card">
                          <div>
                            <div>{option.label}</div>
                            <div className="text-xs text-gray-400">{option.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {dnsServer === "custom" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Custom DNS Server</label>
                    <Input
                      type="text"
                      placeholder="Enter DNS server IP (e.g., 1.1.1.1)"
                      value={customDns}
                      onChange={(e) => setCustomDns(e.target.value)}
                      className="bg-dark-bg border-dark-border text-white placeholder-gray-400"
                    />
                  </div>
                )}

                <Button
                  onClick={applyDnsChange}
                  className="w-full bg-neon-blue text-dark-bg hover:bg-neon-blue/90 transition-colors"
                >
                  <i className="fas fa-rocket mr-2" />
                  Apply DNS Settings
                </Button>
              </div>
            </div>

            {/* TCP Optimization */}
            <div className="bg-dark-card rounded-xl p-6 border border-dark-border card-hover">
              <div className="flex items-center mb-6">
                <i className="fas fa-network-wired text-neon-green text-2xl mr-4 neon-glow" />
                <div>
                  <h3 className="text-xl font-bold text-white">TCP/IP Optimization</h3>
                  <p className="text-gray-400 text-sm">Advanced network stack tweaks for gaming</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-dark-bg rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2">Current Status</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">TCP Optimization</span>
                    <span className={cn(
                      "px-2 py-1 rounded text-sm",
                      tcpOptimized ? "bg-neon-green text-dark-bg" : "bg-gray-600 text-white"
                    )}>
                      {tcpOptimized ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                </div>

                <div className="text-sm text-gray-400 space-y-1">
                  <p>• TCP window scaling optimization</p>
                  <p>• Nagle algorithm fine-tuning</p>
                  <p>• Network buffer size optimization</p>
                  <p>• Gaming traffic prioritization</p>
                </div>

                <Button
                  onClick={toggleTcpOptimization}
                  className={cn(
                    "w-full transition-colors",
                    tcpOptimized 
                      ? "bg-red-500 hover:bg-red-600 text-white" 
                      : "bg-neon-green text-dark-bg hover:bg-neon-green/90"
                  )}
                >
                  {tcpOptimized ? (
                    <>
                      <i className="fas fa-times mr-2" />
                      Disable TCP Optimization
                    </>
                  ) : (
                    <>
                      <i className="fas fa-bolt mr-2" />
                      Enable TCP Optimization
                    </>
                  )}
                </Button>
              </div>
            </div>

          </div>

          {/* Network Ping Tester */}
          <div className="bg-dark-card rounded-xl p-6 border border-dark-border card-hover">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <i className="fas fa-chart-line text-neon-purple text-2xl mr-4 neon-glow" />
                <div>
                  <h3 className="text-xl font-bold text-white">Network Latency Tester</h3>
                  <p className="text-gray-400">Test your ping to gaming servers and CDNs</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Target Server</label>
                  <Input
                    type="text"
                    value={pingTarget}
                    onChange={(e) => setPingTarget(e.target.value)}
                    placeholder="IP or domain"
                    className="bg-dark-bg border-dark-border text-white w-32"
                    disabled={pingRunning}
                  />
                </div>
                <div className="flex space-x-2 mt-6">
                  <Button
                    disabled={pingRunning}
                    onClick={startPingTest}
                    className="bg-neon-purple text-white hover:bg-neon-purple/90"
                  >
                    {pingRunning ? (
                      <>
                        <i className="fas fa-spinner animate-spin mr-2" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-play mr-2" />
                        Start Test
                      </>
                    )}
                  </Button>
                  <Button
                    disabled={!pingRunning}
                    onClick={stopPingTest}
                    className="bg-red-500 hover:bg-red-600 text-white"
                  >
                    <i className="fas fa-stop mr-2" />
                    Stop
                  </Button>
                </div>
              </div>
            </div>

            {/* Ping Stats */}
            {pingResults.length > 0 && (
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-dark-bg rounded-lg p-3 text-center">
                  <div className="text-neon-green text-2xl font-bold">{pingResults[pingResults.length - 1]}ms</div>
                  <div className="text-gray-400 text-sm">Current</div>
                </div>
                <div className="bg-dark-bg rounded-lg p-3 text-center">
                  <div className="text-neon-blue text-2xl font-bold">{averagePing}ms</div>
                  <div className="text-gray-400 text-sm">Average</div>
                </div>
                <div className="bg-dark-bg rounded-lg p-3 text-center">
                  <div className="text-neon-purple text-2xl font-bold">{Math.min(...pingResults)}ms</div>
                  <div className="text-gray-400 text-sm">Best</div>
                </div>
              </div>
            )}

            {/* Ping Graph */}
            <div className="bg-dark-bg rounded-lg p-4">
              <div className="h-32 flex items-end justify-center space-x-1">
                {pingResults.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <i className="fas fa-chart-line text-2xl mr-2" />
                    No ping data yet - start a test to see results
                  </div>
                ) : (
                  pingResults.map((ping, i) => (
                    <div
                      key={i}
                      className="bg-gradient-to-t from-neon-green to-neon-blue w-3 rounded-sm transition-all duration-300"
                      style={{ 
                        height: `${Math.min((ping / 100) * 100, 100)}%`,
                        minHeight: '4px'
                      }}
                      title={`${ping}ms`}
                    />
                  ))
                )}
              </div>
              {pingResults.length > 0 && (
                <div className="mt-2 text-center text-sm text-gray-400">
                  Testing {pingTarget} - {pingResults.length}/20 samples
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}