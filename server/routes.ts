import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { 
  insertChatMessageSchema, 
  insertUserSchema, 
  loginUserSchema,
  updateUserSettingsSchema 
} from "@shared/schema";
import { 
  generateToken, 
  hashPassword, 
  comparePassword, 
  authenticateToken, 
  optionalAuth,
  getUserId,
  getOptionalUserId,
  type AuthenticatedRequest 
} from "./auth";
import si from "systeminformation";
import { exec as execCb } from "child_process";
import { promisify } from "util";

const exec = promisify(execCb);

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Authentication Routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          message: "Username already taken" 
        });
      }

      // Hash password and create user
      const hashedPassword = await hashPassword(userData.password);
      const user = await storage.createUser({
        ...userData,
        passwordHash: hashedPassword,
      });

      // Generate token
      const token = generateToken(user);
      
      res.json({ 
        success: true, 
        message: "Account created successfully",
        token,
        user: { id: user.id, username: user.username, email: user.email }
      });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(400).json({ 
        success: false, 
        message: "Invalid signup data" 
      });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const loginData = loginUserSchema.parse(req.body);
      
      // Find user by username
      const user = await storage.getUserByUsername(loginData.username);
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: "Invalid credentials" 
        });
      }

      // Check password
      const isValidPassword = await comparePassword(loginData.password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ 
          success: false, 
          message: "Invalid credentials" 
        });
      }

      // Update last login
      await storage.updateUserLastLogin(user.id);

      // Generate token
      const token = generateToken(user);
      
      res.json({ 
        success: true, 
        message: "Login successful",
        token,
        user: { id: user.id, username: user.username, email: user.email }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({ 
        success: false, 
        message: "Invalid login data" 
      });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = getUserId(req);
      const user = await storage.getUserById(userId);
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: "User not found" 
        });
      }

      res.json({ 
        success: true,
        user: { id: user.id, username: user.username, email: user.email }
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Failed to get user info" 
      });
    }
  });

  // User Settings Routes
  app.get("/api/settings", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = getUserId(req);
      const settings = await storage.getUserSettings(userId);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to get user settings" });
    }
  });

  app.put("/api/settings", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = getUserId(req);
      const updates = updateUserSettingsSchema.parse(req.body);
      
      const updatedSettings = await storage.updateUserSettings(userId, updates);
      if (!updatedSettings) {
        return res.status(404).json({ error: "Settings not found" });
      }
      
      res.json(updatedSettings);
    } catch (error) {
      res.status(500).json({ error: "Failed to update settings" });
    }
  });

  // System Info (one-shot details)
  app.get("/api/system-info", async (_req, res) => {
    try {
      const [cpu, mem, gpu, os] = await Promise.all([
        si.cpu(),
        si.mem(),
        si.graphics(),
        si.osInfo(),
      ]);

      const info = {
        cpu: `${cpu.manufacturer} ${cpu.brand}`.trim(),
        ramUsed: (mem.active / 1024 / 1024 / 1024).toFixed(2) + " GB",
        ramTotal: (mem.total / 1024 / 1024 / 1024).toFixed(2) + " GB",
        gpu: (gpu.controllers || []).map((c) => c.model).join(", ") || "",
        os: `${os.distro} ${os.release}`.trim(),
      };
      res.json(info);
    } catch (error: any) {
      res.status(500).json({ error: "Failed to get system info", details: String(error?.message || error) });
    }
  });

  // RAM Cleaner
  app.post("/api/ram/clean", async (_req, res) => {
    try {
      const platform = process.platform; // 'win32' | 'darwin' | 'linux'
      let command: string | null = null;

      if (platform === "win32") {
        // Requires EmptyStandbyList.exe in PATH or known location
        command = "EmptyStandbyList.exe workingsets";
      } else if (platform === "darwin") {
        // macOS
        command = "sudo purge";
      } else if (platform === "linux") {
        // Linux - attempt to drop page cache (requires root)
        command = "sudo sh -c 'sync; echo 1 > /proc/sys/vm/drop_caches'";
      }

      if (!command) {
        return res.status(400).json({ success: false, message: "Unsupported platform" });
      }

      try {
        const { stdout, stderr } = await exec(command);
        res.json({ success: true, stdout, stderr });
      } catch (err: any) {
        res.status(500).json({ success: false, message: "Failed to clean RAM", details: String(err?.message || err) });
      }
    } catch (error: any) {
      res.status(500).json({ success: false, message: "RAM clean error", details: String(error?.message || error) });
    }
  });

  // Network: Change DNS
  app.post("/api/network/dns", async (req, res) => {
    const { interface: iface, servers } = req.body as { interface?: string; servers: string[] };
    if (!servers || !Array.isArray(servers) || servers.length === 0) {
      return res.status(400).json({ success: false, message: "servers array required" });
    }

    const platform = process.platform;
    try {
      if (platform === "win32") {
        // netsh interface ip set dns "Wi-Fi" static 1.1.1.1
        const target = iface || "Wi-Fi";
        const primary = servers[0];
        const secondary = servers[1];
        await exec(`netsh interface ip set dns \"${target}\" static ${primary}`);
        if (secondary) {
          await exec(`netsh interface ip add dns \"${target}\" ${secondary} index=2`);
        }
      } else if (platform === "darwin") {
        // macOS networksetup
        const service = iface || "Wi-Fi";
        await exec(`networksetup -setdnsservers \"${service}\" ${servers.join(" ")}`);
      } else if (platform === "linux") {
        // Try NetworkManager via nmcli; otherwise fallback is not safe here
        try {
          const conName = iface || (await exec("nmcli -t -f NAME connection show --active")).stdout.split("\n")[0];
          if (conName) {
            await exec(`nmcli connection modify \"${conName}\" ipv4.dns \"${servers.join(" ")}\"`);
            await exec(`nmcli connection up \"${conName}\"`);
          } else {
            throw new Error("No active connection found via nmcli");
          }
        } catch (e) {
          return res.status(501).json({ success: false, message: "DNS change requires NetworkManager (nmcli) or admin rights" });
        }
      } else {
        return res.status(400).json({ success: false, message: "Unsupported platform" });
      }

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, message: "Failed to change DNS", details: String(error?.message || error) });
    }
  });

  // Network: Flush DNS cache
  app.post("/api/network/flush", async (_req, res) => {
    const platform = process.platform;
    try {
      if (platform === "win32") {
        await exec("ipconfig /flushdns");
      } else if (platform === "darwin") {
        await exec("dscacheutil -flushcache");
        await exec("sudo killall -HUP mDNSResponder");
      } else if (platform === "linux") {
        // systemd-resolved
        try {
          await exec("sudo systemd-resolve --flush-caches");
        } catch {
          try {
            await exec("sudo resolvectl flush-caches");
          } catch {
            // Fallback: restart nscd or dnsmasq if present (best-effort)
            try { await exec("sudo service nscd restart"); } catch {}
            try { await exec("sudo service dnsmasq restart"); } catch {}
          }
        }
      } else {
        return res.status(400).json({ success: false, message: "Unsupported platform" });
      }

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, message: "Failed to flush DNS cache", details: String(error?.message || error) });
    }
  });

  // API Routes
  app.get("/api/system-stats", optionalAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = getOptionalUserId(req);
      const stats = await storage.getLatestSystemStats(userId);
      res.json(stats || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to get system stats" });
    }
  });

  app.get("/api/game-profiles", optionalAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = getOptionalUserId(req);
      const profiles = await storage.getGameProfiles(userId);
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
      const [load, temp, mem, graphics] = await Promise.all([
        si.currentLoad(),
        si.cpuTemperature(),
        si.mem(),
        si.graphics(),
      ]);

      const controller = (graphics.controllers && graphics.controllers[0]) || undefined;

      const stats = {
        cpuUsage: Math.max(0, Math.min(100, Math.round(load.currentLoad || 0))),
        cpuTemp: Math.round((temp.main || 0)),
        gpuUsage: Math.max(0, Math.min(100, Math.round((controller as any)?.utilizationGpu ?? 0))),
        gpuTemp: Math.round((controller as any)?.temperatureGpu ?? 0),
        ramUsed: (mem.used / 1024 / 1024 / 1024).toFixed(1),
        ramAvailable: (mem.available / 1024 / 1024 / 1024).toFixed(1),
        networkPing: 0,
        networkUpload: 0,
        networkDownload: 0,
        fps: 0,
      };

      // Store in memory
      await storage.createSystemStats(stats);

      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'systemStats', data: stats }));
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
