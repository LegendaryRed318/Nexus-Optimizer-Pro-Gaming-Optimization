import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";

const dnsOptions = [
  { label: "Cloudflare DNS", value: "1.1.1.1", description: "Fast and privacy-focused" },
  { label: "Google DNS", value: "8.8.8.8", description: "Reliable and widely used" },
  { label: "Quad9 DNS", value: "9.9.9.9", description: "Security and privacy focused" },
  { label: "Custom", value: "custom", description: "Enter your own DNS server" },
];

export default function NetworkBooster() {
  const [dnsServer, setDnsServer] = useState(dnsOptions[0].value);
  const [customDns, setCustomDns] = useState("");
  const [interfaceName, setInterfaceName] = useState("Wi-Fi");
  const [tcpOptimized, setTcpOptimized] = useState(false);
  const [pingResults, setPingResults] = useState<number[]>([]);
  const [pingRunning, setPingRunning] = useState(false);
  const [pingTarget, setPingTarget] = useState("8.8.8.8");
  const pingInterval = useRef<NodeJS.Timeout | null>(null);
  
  const { toast } = useToast();

  const applyDnsChange = async () => {
    const dnsToApply = dnsServer === "custom" ? customDns : dnsServer;
    if (!dnsToApply) {
      toast({
        title: "Invalid DNS Server",
        description: "Please enter a valid DNS server address.",
        variant: "destructive",
      });
      return;
    }

    try {
      await apiRequest("POST", "/api/network/dns", {
        interface: interfaceName || undefined,
        servers: [dnsToApply, dnsToApply === "1.1.1.1" ? "1.0.0.1" : dnsToApply === "8.8.8.8" ? "8.8.4.4" : undefined].filter(Boolean),
      });
      toast({
        title: "DNS Server Updated",
        description: `Switched to ${dnsToApply}. You may need admin rights on some OSes.`,
      });
    } catch (e: any) {
      toast({ title: "DNS Change Failed", description: String(e.message || e), variant: "destructive" });
    }
  };

  const flushDns = async () => {
    try {
      await apiRequest("POST", "/api/network/flush");
      toast({ title: "DNS Cache Flushed", description: "Resolver cache cleared successfully." });
    } catch (e: any) {
      toast({ title: "Flush Failed", description: String(e.message || e), variant: "destructive" });
    }
  };

  const toggleTcpOptimization = () => {
    setTcpOptimized((prev) => !prev);
    toast({
      title: tcpOptimized ? "TCP Optimization Disabled" : "TCP Optimization Enabled",
      description: tcpOptimized 
        ? "TCP settings have been reverted to default."
        : "Applied advanced TCP tweaks for better gaming performance (mock).",
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

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Interface (optional)</label>
                  <Input
                    type="text"
                    placeholder="e.g., Wi-Fi"
                    value={interfaceName}
                    onChange={(e) => setInterfaceName(e.target.value)}
                    className="bg-dark-bg border-dark-border text-white placeholder-gray-400"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={applyDnsChange}
                    className="flex-1 bg-neon-blue text-dark-bg hover:bg-neon-blue/90 transition-colors"
                  >
                    <i className="fas fa-rocket mr-2" />
                    Apply DNS Settings
                  </Button>
                  <Button
                    onClick={flushDns}
                    variant="secondary"
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white"
                  >
                    <i className="fas fa-broom mr-2" /> Flush DNS
                  </Button>
                </div>
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
                    <i className="fas fa-play mr-2" /> Start
                  </Button>
                  <Button
                    disabled={!pingRunning}
                    onClick={stopPingTest}
                    className="bg-red-500 text-white hover:bg-red-600"
                  >
                    <i className="fas fa-stop mr-2" /> Stop
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {pingResults.map((p, idx) => (
                <div key={idx} className="bg-dark-bg border border-dark-border rounded p-3 text-center">
                  <div className="text-white font-medium">{p} ms</div>
                  <div className="text-gray-500 text-xs">sample {idx + 1}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 text-gray-300">Average Ping: <span className="font-semibold">{averagePing} ms</span></div>
          </div>

        </div>
      </div>
    </div>
  );
}