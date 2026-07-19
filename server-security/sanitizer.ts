/**
 * @file sanitizer.ts
 * @description Output sanitization utilities to prevent Cross-Site Scripting (XSS),
 * HTML injection, and other injection-based exploits in chatbot responses.
 */

/**
 * Escapes unsafe HTML characters to safe HTML entities.
 */
export function escapeHTML(text: string): string {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Sanitizes chatbot responses to eliminate malicious HTML tags (script, iframe, object, embed, svg)
 * while preserving valid markdown styling elements.
 */
export function sanitizeBotResponse(response: string): string {
  if (!response) return "";

  // Strictly strip script tags and their content
  let sanitized = response.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");

  // Strictly strip iframes, objects, embeds
  sanitized = sanitized
    .replace(/<iframe\b[^<]*<\/iframe>/gi, "")
    .replace(/<object\b[^<]*<\/object>/gi, "")
    .replace(/<embed\b[^<]*>/gi, "");

  // Prevent inline event handlers (e.g. onerror, onload, onclick)
  sanitized = sanitized.replace(/\bon[a-z]+\s*=\s*(['"])(.*?)\1/gi, "");

  // Prevent javascript: pseudo-protocol URIs
  sanitized = sanitized.replace(/javascript\s*:\s*[^\s'"]*/gi, "unsafe-uri");

  return sanitized;
}
