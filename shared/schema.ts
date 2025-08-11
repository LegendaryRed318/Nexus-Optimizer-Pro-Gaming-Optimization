import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username", { length: 50 }).unique().notNull(),
  email: varchar("email", { length: 255 }).unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  lastLogin: timestamp("last_login"),
  twoFactorSecret: text("two_factor_secret"),
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  isLocked: boolean("is_locked").default(false),
  lockoutUntil: timestamp("lockout_until"),
  failedLoginAttempts: integer("failed_login_attempts").default(0),
});

export const userSettings = pgTable("user_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  darkMode: boolean("dark_mode").default(true).notNull(),
  soundEffects: boolean("sound_effects").default(true).notNull(),
  autoOptimization: boolean("auto_optimization").default(false).notNull(),
  performanceAlerts: boolean("performance_alerts").default(true).notNull(),
  colorTheme: varchar("color_theme", { length: 20 }).default("green").notNull(),
  fpsTargets: json("fps_targets").default({ fortnite: 144, global: 240 }),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const passwordResets = pgTable("password_resets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const securityLogs = pgTable("security_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
  event: varchar("event", { length: 100 }).notNull(),
  details: json("details"),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const systemStats = pgTable("system_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
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
  userId: varchar("user_id").references(() => users.id),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  isActive: boolean("is_active").default(false),
  settings: text("settings").notNull(), // JSON string
});

export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  content: text("content").notNull(),
  isUser: boolean("is_user").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

// User authentication schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, lastLogin: true, twoFactorSecret: true, twoFactorEnabled: true, isLocked: true, lockoutUntil: true, failedLoginAttempts: true });
export const loginUserSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6),
});

// Password reset schemas
export const insertPasswordResetSchema = createInsertSchema(passwordResets).omit({ id: true, createdAt: true, used: true });
export const insertSecurityLogSchema = createInsertSchema(securityLogs).omit({ id: true, timestamp: true });

// User settings schemas
export const insertUserSettingsSchema = createInsertSchema(userSettings).omit({ id: true, updatedAt: true });
export const updateUserSettingsSchema = insertUserSettingsSchema.omit({ userId: true }).partial();

// Existing schemas with user references
export const insertSystemStatsSchema = createInsertSchema(systemStats).omit({ id: true, timestamp: true });
export const insertGameProfileSchema = createInsertSchema(gameProfiles).omit({ id: true });
export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({ id: true, timestamp: true });

// Type exports
export type User = typeof users.$inferSelect;
export type UserSettings = typeof userSettings.$inferSelect;
export type PasswordReset = typeof passwordResets.$inferSelect;
export type SecurityLog = typeof securityLogs.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type InsertPasswordReset = z.infer<typeof insertPasswordResetSchema>;
export type InsertSecurityLog = z.infer<typeof insertSecurityLogSchema>;
export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;
export type UpdateUserSettings = z.infer<typeof updateUserSettingsSchema>;

export type InsertSystemStats = z.infer<typeof insertSystemStatsSchema>;
export type InsertGameProfile = z.infer<typeof insertGameProfileSchema>;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;

export type SystemStats = typeof systemStats.$inferSelect;
export type GameProfile = typeof gameProfiles.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;
