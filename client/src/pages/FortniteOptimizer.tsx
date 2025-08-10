import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Message {
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
  actions?: string[];
}

interface FortniteMetrics {
  fps: number;
  ping: number;
  packetLoss: number;
  cpu: number;
  gpu: number;
  gpuTemp: number;
  memoryUsage: number;
  diskUsage: number;
}

export default function FortniteOptimizer() {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "bot",
      text: "Ready to optimize your system for Fortnite! I can help you achieve 240+ FPS and reduce input lag. What's your current setup?",
      timestamp: new Date(),
      actions: ["Optimize for 240 FPS", "Reduce input lag", "Fix frame drops", "Improve loading times"]
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  // Overlay Controls
  const [overlayEnabled, setOverlayEnabled] = useState(false);
  const [overlayTransparency, setOverlayTransparency] = useState([70]);
  const [overlayPosition, setOverlayPosition] = useState("top-left");
  const [selectedMetrics, setSelectedMetrics] = useState({
    fps: true,
    ping: true,
    packetLoss: true,
    cpu: true,
    gpu: true,
    gpuTemp: true,
  });

  // Real-time metrics simulation
  const [metrics, setMetrics] = useState<FortniteMetrics>({
    fps: 144,
    ping: 25,
    packetLoss: 0.1,
    cpu: 45,
    gpu: 67,
    gpuTemp: 72,
    memoryUsage: 68,
    diskUsage: 23,
  });

  const { toast } = useToast();

  // Simulate real-time metrics updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        fps: Math.max(60, Math.min(240, prev.fps + (Math.random() - 0.5) * 10)),
        ping: Math.max(5, Math.min(80, prev.ping + (Math.random() - 0.5) * 8)),
        packetLoss: Math.max(0, Math.min(5, prev.packetLoss + (Math.random() - 0.5) * 0.3)),
        cpu: Math.max(20, Math.min(90, prev.cpu + (Math.random() - 0.5) * 8)),
        gpu: Math.max(30, Math.min(95, prev.gpu + (Math.random() - 0.5) * 10)),
        gpuTemp: Math.max(45, Math.min(85, prev.gpuTemp + (Math.random() - 0.5) * 3)),
        memoryUsage: Math.max(40, Math.min(90, prev.memoryUsage + (Math.random() - 0.5) * 5)),
        diskUsage: Math.max(10, Math.min(60, prev.diskUsage + (Math.random() - 0.5) * 4)),
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getFortniteOptimizationResponse = (userInput: string): { response: string; actions?: string[] } => {
    const input = userInput.toLowerCase();
    
    if (input.includes("240") || input.includes("fps") || input.includes("frame")) {
      return {
        response: "For 240+ FPS in Fortnite: Set all graphics to Low/Off except View Distance (Epic), disable V-Sync, enable Performance Mode, set GPU to Prefer Maximum Performance, and close Epic Games Launcher after starting Fortnite. This typically increases FPS by 40-60%.",
        actions: ["Apply 240 FPS settings", "Set Performance Mode", "Optimize GPU settings", "Close background apps"]
      };
    }
    
    if (input.includes("lag") || input.includes("input") || input.includes("delay")) {
      return {
        response: "To eliminate input lag: Disable Windows Fullscreen Optimization, set Fortnite to Exclusive Fullscreen, enable NVIDIA Reflex/AMD Anti-Lag, set mouse polling to 1000Hz, and use Direct Memory Access (DMA) if available. Expected improvement: 15-25ms less input delay.",
        actions: ["Enable NVIDIA Reflex", "Set Exclusive Fullscreen", "Optimize mouse settings", "Disable Windows optimizations"]
      };
    }
    
    if (input.includes("drop") || input.includes("stutter") || input.includes("freeze")) {
      return {
        response: "Frame drops fix: Increase virtual memory to 16GB, disable Windows Game DVR, set Fortnite process priority to High, enable GPU scheduling, and cap FPS to 237 (3 below your monitor's refresh rate). This should eliminate micro-stutters.",
        actions: ["Set process priority", "Configure virtual memory", "Cap FPS properly", "Disable Game DVR"]
      };
    }
    
    if (input.includes("loading") || input.includes("slow") || input.includes("startup")) {
      return {
        response: "Faster loading: Move Fortnite to SSD, increase shader cache size, preload textures in lobby, disable texture streaming, and allocate more VRAM. Loading times typically improve by 50-70%.",
        actions: ["Move to SSD", "Optimize texture settings", "Increase cache size", "Preload assets"]
      };
    }

    if (input.includes("competitive") || input.includes("arena") || input.includes("ranked")) {
      return {
        response: "Competitive setup: Use stretched resolution (1600x900), disable all visual effects, enable Performance Mode, set render distance to minimum, cap FPS at 240, and use exclusive fullscreen. Perfect for Arena and tournaments.",
        actions: ["Set competitive graphics", "Configure stretched res", "Optimize for tournaments", "Enable Performance Mode"]
      };
    }
    
    return {
      response: "I can optimize every aspect of your Fortnite experience! Tell me what you're struggling with - low FPS, input lag, frame drops, or slow loading. I'll provide specific settings and tweaks for your hardware.",
      actions: ["Run comprehensive scan", "Optimize graphics settings", "Fix common issues", "Apply pro player config"]
    };
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      sender: "user",
      text: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1200 + Math.random() * 1000));

    const { response, actions } = getFortniteOptimizationResponse(input);
    
    const botMessage: Message = {
      sender: "bot",
      text: response,
      timestamp: new Date(),
      actions
    };

    setMessages(prev => [...prev, botMessage]);
    setIsTyping(false);
  };

  const executeAction = (action: string) => {
    toast({
      title: "Optimization Applied",
      description: `${action} has been executed successfully. Monitor your Fortnite performance for improvements.`,
    });
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const toggleOverlay = () => {
    setOverlayEnabled(!overlayEnabled);
    toast({
      title: overlayEnabled ? "Overlay Disabled" : "Overlay Enabled",
      description: overlayEnabled 
        ? "In-game overlay has been disabled" 
        : "In-game overlay is now active and will appear in Fortnite",
    });
  };

  const getMetricColor = (metric: string, value: number) => {
    switch (metric) {
      case 'fps':
        return value >= 200 ? 'text-neon-green' : value >= 144 ? 'text-neon-blue' : value >= 60 ? 'text-yellow-400' : 'text-red-400';
      case 'ping':
        return value <= 20 ? 'text-neon-green' : value <= 40 ? 'text-neon-blue' : value <= 60 ? 'text-yellow-400' : 'text-red-400';
      case 'packetLoss':
        return value <= 0.5 ? 'text-neon-green' : value <= 1 ? 'text-yellow-400' : 'text-red-400';
      case 'cpu':
      case 'gpu':
      case 'memory':
        return value <= 60 ? 'text-neon-green' : value <= 80 ? 'text-yellow-400' : 'text-red-400';
      case 'temp':
        return value <= 70 ? 'text-neon-green' : value <= 80 ? 'text-yellow-400' : 'text-red-400';
      default:
        return 'text-white';
    }
  };

  return (
    <div className="flex h-screen bg-dark-bg text-white">
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-4">
                <i className="fas fa-gamepad text-white text-xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white font-orbitron">Fortnite Optimizer</h1>
                <p className="text-gray-400 mt-1">AI-powered optimization for 240+ FPS and zero input lag</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* AI Optimization Assistant */}
            <div className="bg-dark-card rounded-xl border border-dark-border card-hover">
              <div className="flex items-center p-4 border-b border-dark-border">
                <i className="fas fa-robot text-neon-green text-xl mr-3 neon-glow" />
                <div>
                  <h3 className="text-lg font-bold text-white">Fortnite AI Assistant</h3>
                  <p className="text-gray-400 text-sm">Get personalized optimization advice</p>
                </div>
              </div>

              {/* Messages */}
              <div className="h-80 overflow-y-auto p-4 space-y-4">
                {messages.map((message, index) => (
                  <div key={index} className={cn(
                    "flex",
                    message.sender === "user" ? "justify-end" : "justify-start"
                  )}>
                    <div className={cn(
                      "max-w-[85%] p-3 rounded-lg",
                      message.sender === "user" 
                        ? "bg-neon-blue text-dark-bg" 
                        : "bg-dark-bg text-white border border-dark-border"
                    )}>
                      <p className="text-sm leading-relaxed">{message.text}</p>
                      <p className={cn(
                        "text-xs mt-2 opacity-70",
                        message.sender === "user" ? "text-dark-bg" : "text-gray-400"
                      )}>
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                      
                      {message.actions && (
                        <div className="mt-3 space-y-2">
                          <p className="text-xs text-gray-400 font-medium">Quick Actions:</p>
                          <div className="grid grid-cols-1 gap-2">
                            {message.actions.map((action, idx) => (
                              <Button
                                key={idx}
                                onClick={() => {
                                  if (action.startsWith("Apply") || action.startsWith("Set") || action.startsWith("Enable") || action.startsWith("Configure")) {
                                    executeAction(action);
                                  } else {
                                    handleSuggestionClick(action);
                                  }
                                }}
                                className="text-xs h-8 bg-dark-border hover:bg-neon-green hover:text-dark-bg transition-colors text-left justify-start"
                              >
                                <i className="fas fa-play text-xs mr-2" />
                                {action}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-dark-bg text-white p-3 rounded-lg border border-dark-border max-w-[85%]">
                      <div className="flex items-center space-x-2">
                        <i className="fas fa-robot text-neon-green" />
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-neon-green rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-neon-green rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                          <div className="w-2 h-2 bg-neon-green rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-dark-border">
                <div className="flex space-x-2">
                  <Input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Ask about FPS, input lag, settings..."
                    className="flex-1 bg-dark-bg border-dark-border text-white placeholder-gray-400"
                    disabled={isTyping}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!input.trim() || isTyping}
                    className="bg-neon-green text-dark-bg hover:bg-neon-green/90"
                  >
                    <i className="fas fa-paper-plane" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Overlay Controls & Live Metrics */}
            <div className="space-y-6">
              
              {/* Overlay Controls */}
              <div className="bg-dark-card rounded-xl p-6 border border-dark-border card-hover">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <i className="fas fa-layer-group text-neon-purple text-2xl mr-4 neon-glow" />
                    <div>
                      <h3 className="text-xl font-bold text-white">In-Game Overlay</h3>
                      <p className="text-gray-400 text-sm">DirectX hook overlay for Fortnite</p>
                    </div>
                  </div>
                  <Switch
                    checked={overlayEnabled}
                    onCheckedChange={toggleOverlay}
                    className="data-[state=checked]:bg-neon-green"
                  />
                </div>

                <div className="space-y-4">
                  {/* Overlay Position */}
                  <div>
                    <label className="block text-white font-medium mb-2">Position</label>
                    <Select value={overlayPosition} onValueChange={setOverlayPosition}>
                      <SelectTrigger className="bg-dark-bg border-dark-border text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-dark-bg border-dark-border">
                        <SelectItem value="top-left" className="text-white hover:bg-dark-card">Top Left</SelectItem>
                        <SelectItem value="top-right" className="text-white hover:bg-dark-card">Top Right</SelectItem>
                        <SelectItem value="bottom-left" className="text-white hover:bg-dark-card">Bottom Left</SelectItem>
                        <SelectItem value="bottom-right" className="text-white hover:bg-dark-card">Bottom Right</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Transparency */}
                  <div>
                    <label className="block text-white font-medium mb-2">
                      Transparency: {overlayTransparency[0]}%
                    </label>
                    <Slider
                      value={overlayTransparency}
                      onValueChange={setOverlayTransparency}
                      min={0}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                  </div>

                  {/* Metrics Selection */}
                  <div>
                    <label className="block text-white font-medium mb-2">Display Metrics</label>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(selectedMetrics).map(([key, value]) => (
                        <label key={key} className="flex items-center space-x-2 text-sm">
                          <Switch
                            checked={value}
                            onCheckedChange={(checked) => 
                              setSelectedMetrics(prev => ({ ...prev, [key]: checked }))
                            }
                            className="data-[state=checked]:bg-neon-green scale-75"
                          />
                          <span className="text-gray-300 capitalize">{key}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Metrics */}
              <div className="bg-dark-card rounded-xl p-6 border border-dark-border card-hover">
                <div className="flex items-center mb-4">
                  <i className="fas fa-chart-line text-neon-blue text-xl mr-3 neon-glow" />
                  <h3 className="text-lg font-bold text-white">Live Performance</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-dark-bg p-3 rounded-lg">
                    <div className="text-gray-400 text-xs mb-1">FPS</div>
                    <div className={cn("text-2xl font-bold", getMetricColor('fps', metrics.fps))}>
                      {Math.round(metrics.fps)}
                    </div>
                  </div>
                  
                  <div className="bg-dark-bg p-3 rounded-lg">
                    <div className="text-gray-400 text-xs mb-1">PING</div>
                    <div className={cn("text-2xl font-bold", getMetricColor('ping', metrics.ping))}>
                      {Math.round(metrics.ping)}ms
                    </div>
                  </div>
                  
                  <div className="bg-dark-bg p-3 rounded-lg">
                    <div className="text-gray-400 text-xs mb-1">PACKET LOSS</div>
                    <div className={cn("text-2xl font-bold", getMetricColor('packetLoss', metrics.packetLoss))}>
                      {metrics.packetLoss.toFixed(1)}%
                    </div>
                  </div>
                  
                  <div className="bg-dark-bg p-3 rounded-lg">
                    <div className="text-gray-400 text-xs mb-1">GPU TEMP</div>
                    <div className={cn("text-2xl font-bold", getMetricColor('temp', metrics.gpuTemp))}>
                      {Math.round(metrics.gpuTemp)}°C
                    </div>
                  </div>
                </div>

                {/* Overlay Preview */}
                {overlayEnabled && (
                  <div className="mt-4 p-3 bg-dark-bg rounded border border-neon-green/30">
                    <div className="text-xs text-gray-400 mb-2">Overlay Preview ({overlayPosition})</div>
                    <div className="text-xs font-mono space-y-1" style={{ opacity: overlayTransparency[0] / 100 }}>
                      {selectedMetrics.fps && <div className="text-neon-green">FPS: {Math.round(metrics.fps)}</div>}
                      {selectedMetrics.ping && <div className="text-yellow-400">Ping: {Math.round(metrics.ping)}ms</div>}
                      {selectedMetrics.packetLoss && <div className="text-white">Loss: {metrics.packetLoss.toFixed(1)}%</div>}
                      {selectedMetrics.cpu && <div className="text-neon-blue">CPU: {Math.round(metrics.cpu)}%</div>}
                      {selectedMetrics.gpu && <div className="text-neon-purple">GPU: {Math.round(metrics.gpu)}%</div>}
                      {selectedMetrics.gpuTemp && <div className="text-orange-400">Temp: {Math.round(metrics.gpuTemp)}°C</div>}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-dark-card rounded-xl p-6 border border-dark-border card-hover">
            <h3 className="text-xl font-bold text-white mb-4">
              <i className="fas fa-bolt text-neon-yellow mr-3 neon-glow" />
              Quick Fortnite Optimizations
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                onClick={() => executeAction("Apply 240 FPS settings")}
                className="h-16 flex flex-col items-center justify-center bg-dark-bg hover:bg-neon-green hover:text-dark-bg transition-colors"
              >
                <i className="fas fa-tachometer-alt mb-1" />
                <span className="text-sm">240 FPS Mode</span>
              </Button>
              
              <Button
                onClick={() => executeAction("Enable Performance Mode")}
                className="h-16 flex flex-col items-center justify-center bg-dark-bg hover:bg-neon-blue hover:text-dark-bg transition-colors"
              >
                <i className="fas fa-rocket mb-1" />
                <span className="text-sm">Performance Mode</span>
              </Button>
              
              <Button
                onClick={() => executeAction("Optimize for competitive")}
                className="h-16 flex flex-col items-center justify-center bg-dark-bg hover:bg-neon-purple hover:text-white transition-colors"
              >
                <i className="fas fa-trophy mb-1" />
                <span className="text-sm">Competitive</span>
              </Button>
              
              <Button
                onClick={() => executeAction("Fix input lag")}
                className="h-16 flex flex-col items-center justify-center bg-dark-bg hover:bg-neon-yellow hover:text-dark-bg transition-colors"
              >
                <i className="fas fa-mouse mb-1" />
                <span className="text-sm">Fix Input Lag</span>
              </Button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}