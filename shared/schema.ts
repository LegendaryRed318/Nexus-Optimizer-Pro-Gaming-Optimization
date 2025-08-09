import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const systemStats = pgTable("system_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cpuUsage: integer("cpu_usage").notNull(),
  cpuTemp: integer("cpu_temp").notNull(),
  gpuUsage: integer("gpu_usage").notNull(),
  gpuTemp: integer("gpu_temp").notNull(),
  ramUsed: text("ram_used").notNull(),
  ramAvailable: text("ram_available").notNull(),
  networkPing: integer("network_ping").notNull(),
  networkUpload: integer("network_upload").notNull(),
  networkDownload: integer("network_download").notNull(),
  fps: integer("fps").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const gameProfiles = pgTable("game_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  isActive: boolean("is_active").default(false),
  settings: text("settings").notNull(), // JSON string
});

export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  content: text("content").notNull(),
  isUser: boolean("is_user").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertSystemStatsSchema = createInsertSchema(systemStats).omit({ id: true, timestamp: true });
export const insertGameProfileSchema = createInsertSchema(gameProfiles).omit({ id: true });
export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({ id: true, timestamp: true });

export type InsertSystemStats = z.infer<typeof insertSystemStatsSchema>;
export type InsertGameProfile = z.infer<typeof insertGameProfileSchema>;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;

export type SystemStats = typeof systemStats.$inferSelect;
export type GameProfile = typeof gameProfiles.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;
