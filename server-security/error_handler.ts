/**
 * @file error_handler.ts
 * @description Global application exception processing, secure sanitized logging,
 * and standard generic error formatting for client responses.
 */

import { Request, Response, NextFunction } from "express";

/**
 * Standard security logging structure
 */
export function logSecurityEvent(
  ip: string,
  event: string,
  endpoint: string,
  statusCode: number,
  processingTimeMs?: number,
  additionalDetails?: string
): void {
  const timestamp = new Date().toISOString();
  
  // Clean elements to prevent Log Injection
  const cleanIp = ip.replace(/[\r\n]/g, "");
  const cleanEvent = event.replace(/[\r\n]/g, "");
  const cleanEndpoint = endpoint.replace(/[\r\n]/g, "");
  const cleanDetails = additionalDetails ? additionalDetails.replace(/[\r\n]/g, "") : "";

  console.log(
    `[SECURITY LOG] [${timestamp}] IP: ${cleanIp} | Event: ${cleanEvent} | Route: ${cleanEndpoint} | Status: ${statusCode} | Time: ${processingTimeMs || 0}ms${cleanDetails ? ` | Info: ${cleanDetails}` : ""}`
  );
}

/**
 * Global Express error handling middleware.
 * Sanitizes exceptions to prevent internal folder disclosure, version leaks, and API key exposure.
 */
export function globalErrorHandler(
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): any {
  const startTime = (req as any)._startTime || Date.now();
  const processingTime = Date.now() - startTime;
  const ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown") as string;
  
  // Log detailed error on server side securely
  console.error(`[ERROR EXCEPTION] [${new Date().toISOString()}] Details:`, err.message || err);

  // Security log emission
  logSecurityEvent(
    ip,
    "API_EXCEPTION_TRIGGERED",
    req.path,
    500,
    processingTime,
    `Message: ${err.message || "Unknown error"}`
  );

  // Return formatted generic message back to user (Defense in Depth)
  return res.status(500).json({
    response: "⚠️ **System Interruption**: PolyTalk AI was unable to process your request safely. Please review your input or try again in a few moments.",
    detected_language: "English"
  });
}

/**
 * Middleware to track request processing duration
 */
export function requestTimer(req: Request, res: Response, next: NextFunction): void {
  (req as any)._startTime = Date.now();
  
  res.on("finish", () => {
    const startTime = (req as any)._startTime;
    if (startTime) {
      const processingTime = Date.now() - startTime;
      const ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown") as string;
      const rawIp = Array.isArray(ip) ? ip[0] : ip;
      
      // Filter logs for general assets to avoid noise, only logging endpoint transitions like /chat
      if (req.path === "/chat") {
        logSecurityEvent(
          rawIp.split(",")[0].trim(),
          "REQUEST_PROCESSED",
          req.path,
          res.statusCode,
          processingTime
        );
      }
    }
  });

  next();
}
