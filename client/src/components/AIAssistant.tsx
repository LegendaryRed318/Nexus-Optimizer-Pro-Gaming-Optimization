import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest } from "@/lib/queryClient";
import type { ChatMessage } from "@/types/system";

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AIAssistant({ isOpen, onClose }: AIAssistantProps) {
  const [input, setInput] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery<ChatMessage[]>({
    queryKey: ['/api/chat-messages'],
    enabled: isOpen,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest('POST', '/api/chat-messages', {
        content,
        isUser: true,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chat-messages'] });
      setInput("");
      
      // Poll for AI response
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['/api/chat-messages'] });
      }, 1500);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !sendMessageMutation.isPending) {
      sendMessageMutation.mutate(input.trim());
    }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-dark-card border-dark-border">
        <DialogHeader>
          <DialogTitle className="flex items-center text-white">
            <i className="fas fa-robot text-neon-blue text-2xl mr-3 neon-glow" />
            AI Gaming Assistant
          </DialogTitle>
        </DialogHeader>

        <ScrollArea
          ref={scrollAreaRef}
          className="h-64 bg-dark-bg rounded-lg p-4 mb-4"
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <i className="fas fa-spinner animate-spin text-neon-blue text-xl" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-start">
              <div className="w-8 h-8 bg-neon-blue rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <i className="fas fa-robot text-dark-bg text-sm" />
              </div>
              <div className="bg-dark-card rounded-lg p-3 flex-1">
                <p className="text-white mb-2">Hello! I'm your AI optimization assistant. Try commands like:</p>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• "Optimize for Valorant"</li>
                  <li>• "Reduce ping for online gaming"</li>
                  <li>• "Free up RAM"</li>
                  <li>• "Scan my system for issues"</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message: ChatMessage) => (
                <div key={message.id} className="flex items-start">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0 ${
                    message.isUser ? 'bg-neon-green' : 'bg-neon-blue'
                  }`}>
                    <i className={`text-dark-bg text-sm ${
                      message.isUser ? 'fas fa-user' : 'fas fa-robot'
                    }`} />
                  </div>
                  <div className="bg-dark-card rounded-lg p-3 flex-1">
                    <p className="text-white whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              
              {sendMessageMutation.isPending && (
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-neon-blue rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <i className="fas fa-spinner animate-spin text-dark-bg text-sm" />
                  </div>
                  <div className="bg-dark-card rounded-lg p-3 flex-1">
                    <p className="text-gray-400">AI is thinking...</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        <form onSubmit={handleSubmit} className="flex items-center space-x-3">
          <Input
            type="text"
            placeholder="Type your optimization command..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-dark-bg border-dark-border text-white placeholder-gray-400 focus:border-neon-blue"
            disabled={sendMessageMutation.isPending}
          />
          <Button
            type="submit"
            disabled={!input.trim() || sendMessageMutation.isPending}
            className="bg-neon-blue text-dark-bg hover:bg-neon-blue/90 transition-colors"
          >
            <i className="fas fa-paper-plane mr-2" />
            Send
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
