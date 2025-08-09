import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertChatMessageSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // API Routes
  app.get("/api/system-stats", async (req, res) => {
    try {
      const stats = await storage.getLatestSystemStats();
      res.json(stats || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to get system stats" });
    }
  });

  app.get("/api/game-profiles", async (req, res) => {
    try {
      const profiles = await storage.getGameProfiles();
      res.json(profiles);
    } catch (error) {
      res.status(500).json({ error: "Failed to get game profiles" });
    }
  });

  app.put("/api/game-profiles/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      // Set all other profiles to inactive if this one is being activated
      if (updates.isActive) {
        const profiles = await storage.getGameProfiles();
        for (const profile of profiles) {
          if (profile.id !== id) {
            await storage.updateGameProfile(profile.id, { isActive: false });
          }
        }
      }
      
      const updatedProfile = await storage.updateGameProfile(id, updates);
      if (!updatedProfile) {
        return res.status(404).json({ error: "Game profile not found" });
      }
      
      res.json(updatedProfile);
    } catch (error) {
      res.status(500).json({ error: "Failed to update game profile" });
    }
  });

  app.get("/api/chat-messages", async (req, res) => {
    try {
      const messages = await storage.getChatMessages();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to get chat messages" });
    }
  });

  app.post("/api/chat-messages", async (req, res) => {
    try {
      const validatedMessage = insertChatMessageSchema.parse(req.body);
      const message = await storage.createChatMessage(validatedMessage);
      
      // Generate AI response for user messages
      if (validatedMessage.isUser) {
        setTimeout(async () => {
          const aiResponse = generateAIResponse(validatedMessage.content);
          await storage.createChatMessage({
            content: aiResponse,
            isUser: false
          });
        }, 1000);
      }
      
      res.json(message);
    } catch (error) {
      res.status(500).json({ error: "Failed to create chat message" });
    }
  });

  // WebSocket Server for real-time data
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    console.log('Client connected to WebSocket');

    // Send initial system stats
    sendSystemStats(ws);

    // Send periodic updates
    const interval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        sendSystemStats(ws);
      }
    }, 3000);

    ws.on('close', () => {
      console.log('Client disconnected from WebSocket');
      clearInterval(interval);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clearInterval(interval);
    });
  });

  async function sendSystemStats(ws: WebSocket) {
    try {
      // Generate realistic mock data
      const mockStats = {
        cpuUsage: Math.floor(Math.random() * 20) + 35, // 35-55%
        cpuTemp: Math.floor(Math.random() * 15) + 55, // 55-70°C
        gpuUsage: Math.floor(Math.random() * 30) + 60, // 60-90%
        gpuTemp: Math.floor(Math.random() * 20) + 65, // 65-85°C
        ramUsed: (Math.random() * 2 + 7).toFixed(1), // 7-9GB
        ramAvailable: (Math.random() * 2 + 6).toFixed(1), // 6-8GB
        networkPing: Math.floor(Math.random() * 10) + 15, // 15-25ms
        networkUpload: Math.floor(Math.random() * 50) + 100, // 100-150 Mbps
        networkDownload: Math.floor(Math.random() * 100) + 200, // 200-300 Mbps
        fps: Math.floor(Math.random() * 30) + 120, // 120-150 fps
      };

      // Store in memory
      await storage.createSystemStats(mockStats);

      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'systemStats', data: mockStats }));
      }
    } catch (error) {
      console.error('Error sending system stats:', error);
    }
  }

  return httpServer;
}

function generateAIResponse(userMessage: string): string {
  const message = userMessage.toLowerCase();
  
  if (message.includes('valorant') || message.includes('optimize for valorant')) {
    return "🎯 Optimizing for Valorant! I've applied high-performance settings: disabled Windows Game Bar, set CPU priority to High, optimized network settings for competitive play, and enabled Game Mode. Your system is now configured for maximum FPS and minimal input lag.";
  }
  
  if (message.includes('fortnite')) {
    return "🏗️ Fortnite optimization complete! Applied balanced graphics settings, optimized memory allocation, enabled DirectX 12, and configured network settings for stable connection. You should see improved performance and reduced stuttering.";
  }
  
  if (message.includes('ping') || message.includes('network')) {
    return "🌐 Network optimization in progress! Changed DNS to Cloudflare (1.1.1.1), optimized TCP settings, disabled network throttling, and prioritized gaming traffic. Your ping should improve within 30 seconds.";
  }
  
  if (message.includes('ram') || message.includes('memory')) {
    return "🧠 Memory optimization complete! Cleared temporary files (2.3GB freed), optimized virtual memory settings, disabled unnecessary background processes, and defragmented RAM allocation. Available memory increased by 15%.";
  }
  
  if (message.includes('fps') || message.includes('frame')) {
    return "📈 FPS boost applied! Optimized graphics driver settings, disabled Windows visual effects, set power plan to High Performance, and applied game-specific optimizations. Expected FPS increase: 10-25%.";
  }
  
  if (message.includes('scan') || message.includes('diagnostic')) {
    return "🔍 System scan complete! Found 3 optimization opportunities: outdated GPU drivers, 12 unnecessary startup programs, and suboptimal power settings. Would you like me to fix these issues automatically?";
  }
  
  if (message.includes('temperature') || message.includes('heat')) {
    return "🌡️ Temperature monitoring active. CPU: 62°C (Optimal), GPU: 70°C (Good). Recommendations: Ensure case fans are clean, consider undervolting if temperatures exceed 80°C, and monitor during extended gaming sessions.";
  }
  
  return "🤖 I understand you want to optimize your system! I can help with game-specific optimizations, network improvements, RAM cleanup, FPS boosting, and system diagnostics. Try commands like 'optimize for [game name]', 'improve network', or 'scan system'.";
}
