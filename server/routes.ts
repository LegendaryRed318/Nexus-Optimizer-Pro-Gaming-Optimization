import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { storage } from "./storage";
import { authenticateToken, rateLimiter } from "./auth";
import { createSecurityLog } from "./utils";

const router = Router();

// Input validation schemas
const loginSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6),
  twoFactorCode: z.string().optional(),
});

const signupSchema = z.object({
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  email: z.string().email().optional(),
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one lowercase letter, one uppercase letter, and one number"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const passwordResetRequestSchema = z.object({
  email: z.string().email(),
});

const passwordResetSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one lowercase letter, one uppercase letter, and one number"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const twoFactorSetupSchema = z.object({
  action: z.enum(["enable", "disable", "verify"]),
  code: z.string().optional(),
});

// Authentication routes
router.post("/auth/login", rateLimiter, async (req, res) => {
  try {
    const { username, password, twoFactorCode } = loginSchema.parse(req.body);
    
    // Get user
    const user = await storage.getUserByUsername(username);
    if (!user) {
      await createSecurityLog({
        action: "login_failed",
        details: `Failed login attempt for username: ${username}`,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check if user is locked
    if (user.isLocked && user.lockoutUntil && user.lockoutUntil > new Date()) {
      return res.status(423).json({ 
        error: "Account is temporarily locked due to too many failed login attempts",
        lockoutUntil: user.lockoutUntil
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      await storage.incrementFailedLogins(user.id);
      
      // Lock account after 5 failed attempts
      if ((user.failedLoginAttempts || 0) >= 4) {
        const lockoutUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        await storage.lockUser(user.id, lockoutUntil);
        await createSecurityLog({
          userId: user.id,
          action: "account_locked",
          details: "Account locked due to too many failed login attempts",
          ipAddress: req.ip,
          userAgent: req.get("User-Agent"),
        });
        return res.status(423).json({ 
          error: "Account is temporarily locked due to too many failed login attempts",
          lockoutUntil
        });
      }

      await createSecurityLog({
        action: "login_failed",
        details: `Failed login attempt for user: ${user.id}`,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
        userId: user.id,
      });
      
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check 2FA if enabled
    if (user.twoFactorEnabled) {
      if (!twoFactorCode) {
        return res.status(400).json({ 
          error: "Two-factor authentication code required",
          requires2FA: true 
        });
      }
      
      // Verify 2FA code (you'd implement proper TOTP verification here)
      // For now, we'll use a simple check
      if (twoFactorCode !== "123456") { // Replace with proper TOTP verification
        await createSecurityLog({
          userId: user.id,
          action: "2fa_failed",
          details: "Invalid 2FA code provided",
          ipAddress: req.ip,
          userAgent: req.get("User-Agent"),
        });
        return res.status(401).json({ error: "Invalid two-factor authentication code" });
      }
    }

    // Reset failed login attempts and unlock account if needed
    if (user.isLocked) {
      await storage.unlockUser(user.id);
    }

    // Update last login
    await storage.updateUserLastLogin(user.id);

    // Create JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username,
        twoFactorEnabled: user.twoFactorEnabled 
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    // Log successful login
    await createSecurityLog({
      userId: user.id,
      action: "login_success",
      details: "User logged in successfully",
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        twoFactorEnabled: user.twoFactorEnabled,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation error", details: error.errors });
    }
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/auth/signup", rateLimiter, async (req, res) => {
  try {
    const { username, email, password } = signupSchema.parse(req.body);
    
    // Check if username already exists
    const existingUser = await storage.getUserByUsername(username);
    if (existingUser) {
      return res.status(409).json({ error: "Username already exists" });
    }

    // Check if email already exists (if provided)
    if (email) {
      const existingEmail = Array.from(storage["users"].values()).find(user => user.email === email);
      if (existingEmail) {
        return res.status(409).json({ error: "Email already exists" });
      }
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await storage.createUser({
      username,
      email: email || null,
      passwordHash,
    });

    // Create JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username,
        twoFactorEnabled: false 
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    // Log account creation
    await createSecurityLog({
      userId: user.id,
      action: "account_created",
      details: "New user account created",
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        twoFactorEnabled: user.twoFactorEnabled,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation error", details: error.errors });
    }
    console.error("Signup error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/auth/logout", authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    
    await createSecurityLog({
      userId,
      action: "logout",
      details: "User logged out",
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/auth/refresh", authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const user = await storage.getUserById(userId);
    
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // Create new token
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username,
        twoFactorEnabled: user.twoFactorEnabled 
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    res.json({ token });
  } catch (error) {
    console.error("Token refresh error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/auth/password-reset-request", rateLimiter, async (req, res) => {
  try {
    const { email } = passwordResetRequestSchema.parse(req.body);
    
    // Find user by email
    const user = Array.from(storage["users"].values()).find(u => u.email === email);
    if (!user) {
      // Don't reveal if email exists or not
      return res.json({ message: "If an account with that email exists, a password reset link has been sent" });
    }

    // Generate reset token
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Create password reset record
    await storage.createPasswordReset({
      userId: user.id,
      token,
      expiresAt,
    });

    // Log password reset request
    await createSecurityLog({
      userId: user.id,
      action: "password_reset_requested",
      details: "Password reset requested",
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    // In a real app, you'd send an email here
    console.log(`Password reset token for ${email}: ${token}`);

    res.json({ message: "If an account with that email exists, a password reset link has been sent" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation error", details: error.errors });
    }
    console.error("Password reset request error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/auth/password-reset", rateLimiter, async (req, res) => {
  try {
    const { token, newPassword } = passwordResetSchema.parse(req.body);
    
    // Find valid reset token
    const resetRecord = await storage.getPasswordResetByToken(token);
    if (!resetRecord) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    // Check if token is expired
    if (resetRecord.expiresAt < new Date()) {
      return res.status(400).json({ error: "Reset token has expired" });
    }

    // Hash new password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update user password
    const user = await storage.getUserById(resetRecord.userId);
    if (user) {
      user.passwordHash = passwordHash;
      storage["users"].set(user.id, user);
    }

    // Mark reset token as used
    await storage.markPasswordResetUsed(resetRecord.id);

    // Log password reset
    await createSecurityLog({
      userId: resetRecord.userId,
      action: "password_reset_completed",
      details: "Password reset completed",
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation error", details: error.errors });
    }
    console.error("Password reset error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/auth/2fa/setup", authenticateToken, async (req, res) => {
  try {
    const { action, code } = twoFactorSetupSchema.parse(req.body);
    const userId = (req as any).user.userId;
    const user = await storage.getUserById(userId);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (action === "enable") {
      // Generate 2FA secret (in real app, use proper TOTP library)
      const secret = Math.random().toString(36).substring(2, 15);
      await storage.updateUser2FA(userId, secret, true);
      
      await createSecurityLog({
        userId,
        action: "2fa_enabled",
        details: "Two-factor authentication enabled",
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });

      res.json({ 
        message: "2FA enabled successfully",
        secret, // In real app, show QR code instead
        requiresVerification: true
      });
    } else if (action === "disable") {
      await storage.updateUser2FA(userId, null, false);
      
      await createSecurityLog({
        userId,
        action: "2fa_disabled",
        details: "Two-factor authentication disabled",
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });

      res.json({ message: "2FA disabled successfully" });
    } else if (action === "verify") {
      if (!code) {
        return res.status(400).json({ error: "Verification code required" });
      }
      
      // Verify code (replace with proper TOTP verification)
      if (code === "123456") { // Replace with proper verification
        await createSecurityLog({
          userId,
          action: "2fa_verified",
          details: "Two-factor authentication verified",
          ipAddress: req.ip,
          userAgent: req.get("User-Agent"),
        });
        
        res.json({ message: "2FA verification successful" });
      } else {
        await createSecurityLog({
          userId,
          action: "2fa_verification_failed",
          details: "Two-factor authentication verification failed",
          ipAddress: req.ip,
          userAgent: req.get("User-Agent"),
        });
        
        res.status(400).json({ error: "Invalid verification code" });
      }
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation error", details: error.errors });
    }
    console.error("2FA setup error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Protected routes
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const user = await storage.getUserById(userId);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const settings = await storage.getUserSettings(userId);
    
    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        twoFactorEnabled: user.twoFactorEnabled,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      },
      settings
    });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/profile", authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const { username, email } = req.body;
    
    const user = await storage.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if new username is already taken
    if (username && username !== user.username) {
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(409).json({ error: "Username already exists" });
      }
      user.username = username;
    }

    // Check if new email is already taken
    if (email && email !== user.email) {
      const existingEmail = Array.from(storage["users"].values()).find(u => u.email === email);
      if (existingEmail) {
        return res.status(409).json({ error: "Email already exists" });
      }
      user.email = email;
    }

    storage["users"].set(userId, user);
    
    await createSecurityLog({
      userId,
      action: "profile_updated",
      details: "User profile updated",
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.json({ 
      message: "Profile updated successfully",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        twoFactorEnabled: user.twoFactorEnabled,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      }
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/settings", authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const updates = req.body;
    
    const settings = await storage.updateUserSettings(userId, updates);
    if (!settings) {
      return res.status(404).json({ error: "User settings not found" });
    }

    res.json({ 
      message: "Settings updated successfully",
      settings 
    });
  } catch (error) {
    console.error("Settings update error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/security-logs", authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const logs = await storage.getSecurityLogs(userId);
    
    res.json({ logs });
  } catch (error) {
    console.error("Security logs error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// System routes (existing functionality)
router.get("/system/stats", authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const stats = await storage.getLatestSystemStats(userId);
    res.json({ stats });
  } catch (error) {
    console.error("System stats error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/system/stats", authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const stats = await storage.createSystemStats({
      ...req.body,
      userId,
    });
    res.json({ stats });
  } catch (error) {
    console.error("Create system stats error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/games/profiles", authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const profiles = await storage.getGameProfiles(userId);
    res.json({ profiles });
  } catch (error) {
    console.error("Game profiles error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/games/profiles", authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const profile = await storage.createGameProfile({
      ...req.body,
      userId,
    });
    res.json({ profile });
  } catch (error) {
    console.error("Create game profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/chat/messages", authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const messages = await storage.getChatMessages(userId);
    res.json({ messages });
  } catch (error) {
    console.error("Chat messages error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/chat/messages", authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const message = await storage.createChatMessage({
      ...req.body,
      userId,
    });
    res.json({ message });
  } catch (error) {
    console.error("Create chat message error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
