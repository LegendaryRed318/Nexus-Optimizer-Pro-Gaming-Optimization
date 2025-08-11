import { storage } from "./storage";
import { InsertSecurityLog } from "../shared/schema";

export async function createSecurityLog(logData: Omit<InsertSecurityLog, "id" | "timestamp">) {
  try {
    await storage.createSecurityLog(logData);
  } catch (error) {
    console.error("Failed to create security log:", error);
  }
}

export function generateSecureToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function sanitizeInput(input: string): string {
  return input.replace(/[<>]/g, '');
}

export function getClientIP(req: any): string {
  return req.ip || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress || 
         req.connection.socket?.remoteAddress || 
         'unknown';
}

export function isRateLimited(ip: string, action: string): boolean {
  // Simple in-memory rate limiting
  // In production, use Redis or similar
  const key = `${ip}:${action}`;
  const now = Date.now();
  const window = 15 * 60 * 1000; // 15 minutes
  
  if (!global.rateLimitStore) {
    global.rateLimitStore = new Map();
  }
  
  const record = global.rateLimitStore.get(key);
  if (!record) {
    global.rateLimitStore.set(key, { count: 1, firstAttempt: now });
    return false;
  }
  
  if (now - record.firstAttempt > window) {
    global.rateLimitStore.set(key, { count: 1, firstAttempt: now });
    return false;
  }
  
  if (record.count >= 5) { // 5 attempts per 15 minutes
    return true;
  }
  
  record.count++;
  return false;
}

// Extend global to include rate limiting store
declare global {
  var rateLimitStore: Map<string, { count: number; firstAttempt: number }>;
}
