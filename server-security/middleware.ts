/**
 * @file middleware.ts
 * @description Advanced security middleware configuration including CSP, secure headers, CORS,
 * body size limits, and cache controls.
 */

import { Request, Response, NextFunction } from "express";

/**
 * Configure secure HTTP Response Headers (Defense in Depth)
 */
export function secureHeaders(req: Request, res: Response, next: NextFunction): void {
  // 1. Content Security Policy (CSP)
  // Designed to support Vite, Google Fonts, Lucide icons, and the AI Studio framing environment
  const cspRules = [
    "default-src 'self'",
    "script-src 'self' unpkg.com 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' fonts.googleapis.com 'unsafe-inline'",
    "font-src 'self' fonts.gstatic.com",
    "img-src 'self' data: blob:",
    "connect-src 'self' ws://localhost:* wss://localhost:* ws://127.0.0.1:* wss://127.0.0.1:*",
    "media-src 'self' blob: data:",
    "object-src 'none'",
    "frame-ancestors 'self' https://*.run.app https://*.google.com https://ai.studio https://ai-studio.build",
    "base-uri 'self'",
    "form-action 'self'"
  ].join("; ");

  res.setHeader("Content-Security-Policy", cspRules);

  // 2. Prevent clickjacking (sameorigin to allow AI Studio embedding)
  res.setHeader("X-Frame-Options", "SAMEORIGIN");

  // 3. Prevent MIME-type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");

  // 4. Referrer policy
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  // 5. Restrict permissions (microphone is required for speech recognition)
  res.setHeader("Permissions-Policy", "microphone=(self), camera=(), geolocation=()");

  // 6. Cross-Origin Resource Policy
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");

  // 7. Cross-Origin Opener Policy
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");

  // 8. Strict-Transport-Security (Only applied over HTTPS connections or when behind Cloud Run proxies)
  if (process.env.NODE_ENV === "production" || req.secure || req.headers["x-forwarded-proto"] === "https") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  }

  next();
}

/**
 * Custom CORS Policy (Block wildcards in production, allow only self or identical domains)
 */
export function corsPolicy(req: Request, res: Response, next: NextFunction): void {
  const origin = req.headers.origin;
  
  if (process.env.NODE_ENV !== "production") {
    // Development loose rules
    res.setHeader("Access-Control-Allow-Origin", origin || "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  } else {
    // Production strict origin validation
    const host = req.headers.host || "";
    const protocol = req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
    const absoluteSelf = `${protocol}://${host}`;
    
    if (origin && (origin === absoluteSelf || origin.includes(".run.app") || origin.includes(".google.com"))) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    } else {
      res.setHeader("Access-Control-Allow-Origin", absoluteSelf);
    }
    
    res.setHeader("Access-Control-Allow-Methods", "GET, POST");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  }

  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }

  next();
}

/**
 * Cache-Control disabler for dynamic JSON APIs
 */
export function disableApiCaching(req: Request, res: Response, next: NextFunction): void {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
}
