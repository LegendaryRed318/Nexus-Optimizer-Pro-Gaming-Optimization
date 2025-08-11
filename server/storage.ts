import { 
  type SystemStats, type GameProfile, type ChatMessage, 
  type User, type UserSettings, type PasswordReset, type SecurityLog,
  type InsertSystemStats, type InsertGameProfile, type InsertChatMessage,
  type InsertUser, type InsertUserSettings, type UpdateUserSettings,
  type InsertPasswordReset, type InsertSecurityLog
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserById(id: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserLastLogin(id: string): Promise<void>;
  updateUser2FA(id: string, secret: string | null, enabled: boolean): Promise<void>;
  lockUser(id: string, until: Date): Promise<void>;
  unlockUser(id: string): Promise<void>;
  incrementFailedLogins(id: string): Promise<void>;
  resetFailedLogins(id: string): Promise<void>;
  
  // User Settings
  getUserSettings(userId: string): Promise<UserSettings | undefined>;
  createUserSettings(settings: InsertUserSettings): Promise<UserSettings>;
  updateUserSettings(userId: string, updates: UpdateUserSettings): Promise<UserSettings | undefined>;
  
  // Password Resets
  createPasswordReset(reset: InsertPasswordReset): Promise<PasswordReset>;
  getPasswordResetByToken(token: string): Promise<PasswordReset | undefined>;
  markPasswordResetUsed(id: string): Promise<void>;
  cleanupExpiredPasswordResets(): Promise<void>;
  
  // Security Logs
  createSecurityLog(log: InsertSecurityLog): Promise<SecurityLog>;
  getSecurityLogs(userId?: string): Promise<SecurityLog[]>;
  clearSecurityLogs(userId?: string): Promise<void>;
  
  // System Stats
  getLatestSystemStats(userId?: string): Promise<SystemStats | undefined>;
  createSystemStats(stats: InsertSystemStats): Promise<SystemStats>;
  
  // Game Profiles
  getGameProfiles(userId?: string): Promise<GameProfile[]>;
  createGameProfile(profile: InsertGameProfile): Promise<GameProfile>;
  updateGameProfile(id: string, updates: Partial<GameProfile>): Promise<GameProfile | undefined>;
  
  // Chat Messages
  getChatMessages(userId?: string): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  clearChatMessages(userId?: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private userSettings: Map<string, UserSettings>;
  private passwordResets: Map<string, PasswordReset>;
  private securityLogs: Map<string, SecurityLog>;
  private systemStats: Map<string, SystemStats>;
  private gameProfiles: Map<string, GameProfile>;
  private chatMessages: Map<string, ChatMessage>;

  constructor() {
    this.users = new Map();
    this.userSettings = new Map();
    this.passwordResets = new Map();
    this.securityLogs = new Map();
    this.systemStats = new Map();
    this.gameProfiles = new Map();
    this.chatMessages = new Map();
    
    // Initialize with default game profiles
    this.initializeGameProfiles();
  }

  // User methods
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserById(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      createdAt: new Date(),
      lastLogin: null,
      twoFactorSecret: null,
      twoFactorEnabled: false,
      isLocked: false,
      lockoutUntil: null,
      failedLoginAttempts: 0,
    };
    this.users.set(id, user);
    
    // Create default settings for new user
    await this.createUserSettings({
      userId: id,
      darkMode: true,
      soundEffects: true,
      autoOptimization: false,
      performanceAlerts: true,
      colorTheme: "green",
      fpsTargets: { fortnite: 144, global: 240 },
    });
    
    return user;
  }

  async updateUserLastLogin(id: string): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      user.lastLogin = new Date();
      this.users.set(id, user);
    }
  }

  async updateUser2FA(id: string, secret: string | null, enabled: boolean): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      user.twoFactorSecret = secret;
      user.twoFactorEnabled = enabled;
      this.users.set(id, user);
    }
  }

  async lockUser(id: string, until: Date): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      user.isLocked = true;
      user.lockoutUntil = until;
      this.users.set(id, user);
    }
  }

  async unlockUser(id: string): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      user.isLocked = false;
      user.lockoutUntil = null;
      user.failedLoginAttempts = 0;
      this.users.set(id, user);
    }
  }

  async incrementFailedLogins(id: string): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      this.users.set(id, user);
    }
  }

  async resetFailedLogins(id: string): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      user.failedLoginAttempts = 0;
      this.users.set(id, user);
    }
  }

  // User Settings methods
  async getUserSettings(userId: string): Promise<UserSettings | undefined> {
    return Array.from(this.userSettings.values()).find(settings => settings.userId === userId);
  }

  async createUserSettings(insertSettings: InsertUserSettings): Promise<UserSettings> {
    const id = randomUUID();
    const settings: UserSettings = {
      ...insertSettings,
      id,
      updatedAt: new Date(),
    };
    this.userSettings.set(id, settings);
    return settings;
  }

  async updateUserSettings(userId: string, updates: UpdateUserSettings): Promise<UserSettings | undefined> {
    const existingSettings = await this.getUserSettings(userId);
    if (!existingSettings) {
      return undefined;
    }

    const updatedSettings: UserSettings = {
      ...existingSettings,
      ...updates,
      updatedAt: new Date(),
    };
    
    this.userSettings.set(existingSettings.id, updatedSettings);
    return updatedSettings;
  }

  // Password Reset methods
  async createPasswordReset(reset: InsertPasswordReset): Promise<PasswordReset> {
    const id = randomUUID();
    const passwordReset: PasswordReset = {
      ...reset,
      id,
      createdAt: new Date(),
      used: false,
    };
    this.passwordResets.set(id, passwordReset);
    return passwordReset;
  }

  async getPasswordResetByToken(token: string): Promise<PasswordReset | undefined> {
    return Array.from(this.passwordResets.values()).find(reset => reset.token === token && !reset.used);
  }

  async markPasswordResetUsed(id: string): Promise<void> {
    const reset = this.passwordResets.get(id);
    if (reset) {
      reset.used = true;
      this.passwordResets.set(id, reset);
    }
  }

  async cleanupExpiredPasswordResets(): Promise<void> {
    const now = new Date();
    const expiredResets = Array.from(this.passwordResets.entries())
      .filter(([_, reset]) => reset.expiresAt < now || reset.used);
    
    expiredResets.forEach(([id, _]) => this.passwordResets.delete(id));
  }

  // Security Log methods
  async createSecurityLog(log: InsertSecurityLog): Promise<SecurityLog> {
    const id = randomUUID();
    const securityLog: SecurityLog = {
      ...log,
      id,
      timestamp: new Date(),
    };
    this.securityLogs.set(id, securityLog);
    return securityLog;
  }

  async getSecurityLogs(userId?: string): Promise<SecurityLog[]> {
    const logs = Array.from(this.securityLogs.values());
    return userId ? logs.filter(log => log.userId === userId) : logs;
  }

  async clearSecurityLogs(userId?: string): Promise<void> {
    if (userId) {
      const logsToDelete = Array.from(this.securityLogs.entries())
        .filter(([_, log]) => log.userId === userId)
        .map(([id, _]) => id);
      
      logsToDelete.forEach(id => this.securityLogs.delete(id));
    } else {
      this.securityLogs.clear();
    }
  }

  private initializeGameProfiles() {
    const defaultProfiles = [
      {
        name: "Valorant",
        icon: "fas fa-gun",
        isActive: true,
        settings: JSON.stringify({ priority: "high", optimization: "fps" })
      },
      {
        name: "Fortnite",
        icon: "fas fa-hammer",
        isActive: false,
        settings: JSON.stringify({ priority: "medium", optimization: "balanced" })
      },
      {
        name: "Minecraft",
        icon: "fas fa-cube",
        isActive: false,
        settings: JSON.stringify({ priority: "low", optimization: "quality" })
      }
    ];

    defaultProfiles.forEach(profile => {
      const id = randomUUID();
      const gameProfile: GameProfile = { 
        ...profile, 
        id, 
        userId: null, // Default profiles don't belong to any specific user
        isActive: profile.isActive ?? false 
      };
      this.gameProfiles.set(id, gameProfile);
    });
  }

  async getLatestSystemStats(userId?: string): Promise<SystemStats | undefined> {
    const stats = Array.from(this.systemStats.values());
    const filtered = userId ? stats.filter(s => s.userId === userId) : stats;
    return filtered.length > 0 ? filtered[filtered.length - 1] : undefined;
  }

  async createSystemStats(insertStats: InsertSystemStats): Promise<SystemStats> {
    const id = randomUUID();
    const stats: SystemStats = { 
      ...insertStats, 
      id,
      timestamp: new Date()
    };
    this.systemStats.set(id, stats);
    return stats;
  }

  async getGameProfiles(userId?: string): Promise<GameProfile[]> {
    const profiles = Array.from(this.gameProfiles.values());
    return userId ? profiles.filter(p => p.userId === userId || !p.userId) : profiles;
  }

  async createGameProfile(insertProfile: InsertGameProfile): Promise<GameProfile> {
    const id = randomUUID();
    const profile: GameProfile = { 
      ...insertProfile, 
      id,
      isActive: insertProfile.isActive ?? false
    };
    this.gameProfiles.set(id, profile);
    return profile;
  }

  async updateGameProfile(id: string, updates: Partial<GameProfile>): Promise<GameProfile | undefined> {
    const profile = this.gameProfiles.get(id);
    if (!profile) return undefined;
    
    const updatedProfile = { ...profile, ...updates };
    this.gameProfiles.set(id, updatedProfile);
    return updatedProfile;
  }

  async getChatMessages(userId?: string): Promise<ChatMessage[]> {
    const messages = Array.from(this.chatMessages.values());
    const filtered = userId ? messages.filter(m => m.userId === userId || !m.userId) : messages;
    return filtered.sort((a, b) => 
      (a.timestamp?.getTime() || 0) - (b.timestamp?.getTime() || 0)
    );
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = randomUUID();
    const message: ChatMessage = { 
      ...insertMessage, 
      id,
      timestamp: new Date()
    };
    this.chatMessages.set(id, message);
    return message;
  }

  async clearChatMessages(userId?: string): Promise<void> {
    if (userId) {
      const messagesToDelete = Array.from(this.chatMessages.entries())
        .filter(([_, message]) => message.userId === userId)
        .map(([id, _]) => id);
      
      messagesToDelete.forEach(id => this.chatMessages.delete(id));
    } else {
      this.chatMessages.clear();
    }
  }
}

export const storage = new MemStorage();
