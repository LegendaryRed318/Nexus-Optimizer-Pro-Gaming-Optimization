import { type SystemStats, type GameProfile, type ChatMessage, type InsertSystemStats, type InsertGameProfile, type InsertChatMessage } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // System Stats
  getLatestSystemStats(): Promise<SystemStats | undefined>;
  createSystemStats(stats: InsertSystemStats): Promise<SystemStats>;
  
  // Game Profiles
  getGameProfiles(): Promise<GameProfile[]>;
  createGameProfile(profile: InsertGameProfile): Promise<GameProfile>;
  updateGameProfile(id: string, updates: Partial<GameProfile>): Promise<GameProfile | undefined>;
  
  // Chat Messages
  getChatMessages(): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  clearChatMessages(): Promise<void>;
}

export class MemStorage implements IStorage {
  private systemStats: Map<string, SystemStats>;
  private gameProfiles: Map<string, GameProfile>;
  private chatMessages: Map<string, ChatMessage>;

  constructor() {
    this.systemStats = new Map();
    this.gameProfiles = new Map();
    this.chatMessages = new Map();
    
    // Initialize with default game profiles
    this.initializeGameProfiles();
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
      const gameProfile: GameProfile = { ...profile, id, isActive: profile.isActive ?? false };
      this.gameProfiles.set(id, gameProfile);
    });
  }

  async getLatestSystemStats(): Promise<SystemStats | undefined> {
    const stats = Array.from(this.systemStats.values());
    return stats.length > 0 ? stats[stats.length - 1] : undefined;
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

  async getGameProfiles(): Promise<GameProfile[]> {
    return Array.from(this.gameProfiles.values());
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

  async getChatMessages(): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values()).sort((a, b) => 
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

  async clearChatMessages(): Promise<void> {
    this.chatMessages.clear();
  }
}

export const storage = new MemStorage();
