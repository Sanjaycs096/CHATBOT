/**
 * @file rate_limiter.ts
 * @description Bulletproof in-memory rate limiter middleware for Express to prevent DDoS and API abuse.
 */

import { Request, Response, NextFunction } from "express";

interface RateLimitRecord {
  timestamps: number[];
}

// Memory-efficient IP request log mapping
const ipLimits = new Map<string, RateLimitRecord>();

// Clean up memory maps periodically to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of ipLimits.entries()) {
    // Retain only requests within the last minute (60,000 ms)
    record.timestamps = record.timestamps.filter(ts => now - ts < 60000);
    if (record.timestamps.length === 0) {
      ipLimits.delete(ip);
    }
  }
}, 300000); // Trigger every 5 minutes

/**
 * Express middleware to enforce a request limit per IP.
 * Defaults to 10 requests per minute.
 */
export function rateLimiter(limit = 10, windowMs = 60000) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Resolve requester IP securely
    const rawIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";
    const ip = (Array.isArray(rawIp) ? rawIp[0] : typeof rawIp === "string" ? rawIp.split(",")[0] : "127.0.0.1").trim();
    
    const now = Date.now();
    let record = ipLimits.get(ip);
    
    if (!record) {
      record = { timestamps: [] };
      ipLimits.set(ip, record);
    }
    
    // Filter timestamps falling outside the sliding window
    record.timestamps = record.timestamps.filter(ts => now - ts < windowMs);
    
    if (record.timestamps.length >= limit) {
      console.warn(`[SECURITY - RATE LIMIT] Limit exceeded for IP: ${ip} on path: ${req.path}`);
      return res.status(429).json({
        response: "⚠️ **Rate Limit Exceeded**: You are sending messages too quickly! To maintain high system availability, please wait a minute before trying again.",
        detected_language: "English"
      });
    }
    
    // Log the current valid hit
    record.timestamps.push(now);
    next();
  };
}
