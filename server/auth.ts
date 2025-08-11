import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { isRateLimited, getClientIP } from "./utils";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    username: string;
    twoFactorEnabled: boolean;
  };
}

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as any;
    (req as AuthenticatedRequest).user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
}

export function rateLimiter(req: Request, res: Response, next: NextFunction) {
  const ip = getClientIP(req);
  const action = req.path;
  
  if (isRateLimited(ip, action)) {
    return res.status(429).json({ 
      error: "Too many requests. Please try again later.",
      retryAfter: 900 // 15 minutes in seconds
    });
  }
  
  next();
}

export function require2FA(req: Request, res: Response, next: NextFunction) {
  const user = (req as AuthenticatedRequest).user;
  
  if (!user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  if (!user.twoFactorEnabled) {
    return res.status(403).json({ error: "Two-factor authentication required" });
  }
  
  next();
}

export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as any;
      (req as AuthenticatedRequest).user = decoded;
    } catch (error) {
      // Token is invalid, but we continue without authentication
    }
  }
  
  next();
}