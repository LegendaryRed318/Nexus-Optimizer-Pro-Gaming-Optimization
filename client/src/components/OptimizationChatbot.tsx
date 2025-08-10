import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Message {
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
  suggestions?: string[];
}

export default function OptimizationChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "bot",
      text: "Welcome to your AI Optimization Assistant! I can help you optimize your system for gaming. Try asking me about improving FPS, reducing latency, or optimizing specific games.",
      timestamp: new Date(),
      suggestions: [
        "Optimize my system for Valorant",
        "How can I reduce input lag?",
        "Improve my GPU performance",
        "What's causing high CPU usage?"
      ]
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getAIResponse = (userInput: string): { response: string; suggestions?: string[] } => {
    const input = userInput.toLowerCase();
    
    if (input.includes("valorant") || input.includes("fps") || input.includes("frame")) {
      return {
        response: "For Valorant optimization: I recommend setting your GPU to Performance mode, closing Discord hardware acceleration, and switching to Cloudflare DNS (1.1.1.1). This typically increases FPS by 15-25%. Would you like me to apply these changes automatically?",
        suggestions: [
          "Apply Valorant optimizations",
          "Show me GPU tuning options",
          "Optimize network settings"
        ]
      };
    }
    
    if (input.includes("lag") || input.includes("latency") || input.includes("ping")) {
      return {
        response: "To reduce input lag and latency: Enable TCP optimization, switch to gaming DNS servers, disable Windows Game Mode, and set your mouse polling rate to 1000Hz. I can also help optimize your network adapter settings.",
        suggestions: [
          "Apply network optimizations",
          "Configure TCP settings",
          "Test ping to game servers"
        ]
      };
    }
    
    if (input.includes("gpu") || input.includes("graphics")) {
      return {
        response: "GPU optimization suggestions: Increase power limit to 120%, apply a +150MHz core clock boost, set fan curve to aggressive, and enable GPU scheduling in Windows. Current GPU usage is moderate - there's room for improvement.",
        suggestions: [
          "Auto-tune my GPU",
          "Set performance profile",
          "Monitor GPU temperatures"
        ]
      };
    }
    
    if (input.includes("cpu") || input.includes("processor")) {
      return {
        response: "CPU optimization: I detect high background usage. Disable unnecessary startup programs, set Windows to High Performance mode, and prioritize gaming processes. This should free up 20-30% CPU resources.",
        suggestions: [
          "Clean startup programs",
          "Set CPU priority",
          "Show process manager"
        ]
      };
    }
    
    if (input.includes("memory") || input.includes("ram")) {
      return {
        response: "Memory optimization: Clear 1.8GB of cached data, disable memory compression, and set virtual memory to fixed size. Your system will feel more responsive and games will load faster.",
        suggestions: [
          "Clean RAM now",
          "Set virtual memory",
          "Show memory usage"
        ]
      };
    }

    if (input.includes("temperature") || input.includes("temp") || input.includes("hot")) {
      return {
        response: "Temperature management: Your GPU is running at 72°C which is acceptable but could be better. I recommend setting a custom fan curve, improving case airflow, and undervolting slightly for better efficiency.",
        suggestions: [
          "Set custom fan curve",
          "Check thermal throttling",
          "Monitor all temperatures"
        ]
      };
    }
    
    // Default response
    return {
      response: "I can help optimize your gaming performance! I analyze your system in real-time and provide personalized recommendations. Ask me about specific games, performance issues, or let me run a comprehensive system analysis.",
      suggestions: [
        "Run full system analysis",
        "Optimize for specific game",
        "Show current bottlenecks",
        "Apply quick fixes"
      ]
    };
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      sender: "user",
      text: input,
      timestamp: new Date()
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate AI thinking time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1500));

    const { response, suggestions } = getAIResponse(input);
    
    const botMessage: Message = {
      sender: "bot",
      text: response,
      timestamp: new Date(),
      suggestions
    };

    setMessages((prev) => [...prev, botMessage]);
    setIsTyping(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const executeOptimization = (action: string) => {
    toast({
      title: "Optimization Applied",
      description: `${action} has been executed successfully. Monitor your performance for improvements.`,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="bg-dark-card rounded-xl border border-dark-border card-hover h-[600px] flex flex-col">
      <div className="flex items-center p-4 border-b border-dark-border">
        <i className="fas fa-robot text-neon-green text-xl mr-3 neon-glow" />
        <div>
          <h3 className="text-lg font-bold text-white">AI Optimization Assistant</h3>
          <p className="text-gray-400 text-sm">Real-time system analysis and recommendations</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div key={index} className={cn(
            "flex",
            message.sender === "user" ? "justify-end" : "justify-start"
          )}>
            <div className={cn(
              "max-w-[80%] p-3 rounded-lg",
              message.sender === "user" 
                ? "bg-neon-blue text-dark-bg ml-8" 
                : "bg-dark-bg text-white mr-8"
            )}>
              <div className="flex items-start space-x-2">
                {message.sender === "bot" && (
                  <i className="fas fa-robot text-neon-green mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="text-sm leading-relaxed">{message.text}</p>
                  <p className={cn(
                    "text-xs mt-2 opacity-70",
                    message.sender === "user" ? "text-dark-bg" : "text-gray-400"
                  )}>
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
              
              {/* Suggestions */}
              {message.suggestions && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs text-gray-400 font-medium">Quick Actions:</p>
                  <div className="grid grid-cols-1 gap-2">
                    {message.suggestions.map((suggestion, idx) => (
                      <Button
                        key={idx}
                        onClick={() => {
                          if (suggestion.startsWith("Apply") || suggestion.startsWith("Clean") || suggestion.startsWith("Set")) {
                            executeOptimization(suggestion);
                          } else {
                            handleSuggestionClick(suggestion);
                          }
                        }}
                        className="text-xs h-8 bg-dark-border hover:bg-neon-green hover:text-dark-bg transition-colors text-left justify-start"
                      >
                        <i className="fas fa-chevron-right text-xs mr-2" />
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-dark-bg text-white p-3 rounded-lg mr-8 max-w-[80%]">
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
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-dark-border">
        <div className="flex space-x-2">
          <Input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about system optimization, FPS issues, or specific games..."
            className="flex-1 bg-dark-bg border-dark-border text-white placeholder-gray-400"
            disabled={isTyping}
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || isTyping}
            className="bg-neon-green text-dark-bg hover:bg-neon-green/90 px-4"
          >
            <i className="fas fa-paper-plane" />
          </Button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Pro tip: Ask specific questions for better optimization recommendations
        </p>
      </div>
    </div>
  );
}