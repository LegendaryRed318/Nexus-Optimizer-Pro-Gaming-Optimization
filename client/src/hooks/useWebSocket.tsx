import { useState, useEffect, useRef } from 'react';
import type { SystemStats } from '@/types/system';

interface WebSocketMessage {
  type: string;
  data: any;
}

export function useWebSocket() {
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log('Connected to WebSocket');
      setIsConnected(true);
    };

    ws.current.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        
        if (message.type === 'systemStats') {
          setSystemStats(message.data);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.current.onclose = () => {
      console.log('Disconnected from WebSocket');
      setIsConnected(false);
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  return { systemStats, isConnected };
}
