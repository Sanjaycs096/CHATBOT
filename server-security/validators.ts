/**
 * @file validators.ts
 * @description Advanced security validators for validating user input, Unicode normalization,
 * control character filtering, size restriction, and prompt injection mitigation.
 */

// List of signatures commonly associated with prompt injection attacks
const PROMPT_INJECTION_SIGNATURES = [
  "ignore previous instructions",
  "ignore above instructions",
  "ignore the instructions",
  "reveal system prompt",
  "reveal your system prompt",
  "show system prompt",
  "expose system prompt",
  "what is your system prompt",
  "forget your rules",
  "forget previous instructions",
  "forget above rules",
  "execute javascript",
  "execute command",
  "show api key",
  "reveal api key",
  "expose api key",
  "developer instructions",
  "system prompt leak",
  "return environment variables",
  "display .env",
  "cat .env",
  "sudo rm",
  "eval(",
  "process.env"
];

/**
 * Validates, cleans, and normalizes user message inputs.
 * Returns the normalized message if valid, or throws a security error if validation fails.
 */
export function validateAndCleanMessage(message: any): string {
  if (message === undefined || message === null) {
    throw new Error("Message parameter is missing.");
  }

  if (typeof message !== "string") {
    throw new Error("Message must be a string value.");
  }

  // 1. Unicode Normalization (Form C)
  let cleanMessage = message.normalize("NFC");

  // 2. Reject excessively large payloads (DoS prevention)
  if (cleanMessage.length > 2000) {
    throw new Error("Message length exceeds maximum safe size of 2000 characters.");
  }

  // 3. Strip hidden / zero-width spaces / control characters
  // Allows standard newlines (\n, \r) and tabs (\t), rejects other control characters
  cleanMessage = cleanMessage.replace(/[\u200B-\u200D\uFEFF]/g, "");
  
  // Control characters regex (excluding whitespace characters)
  const controlCharsRegex = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g;
  if (controlCharsRegex.test(cleanMessage)) {
    throw new Error("Unsafe control characters detected in the request.");
  }

  // 4. Trim extra leading/trailing whitespace
  cleanMessage = cleanMessage.trim();

  if (!cleanMessage) {
    throw new Error("Message cannot be blank or contain only empty spacing.");
  }

  return cleanMessage;
}

/**
 * Evaluates the input message for potential prompt injection patterns.
 * Returns true if an injection signature is detected, false otherwise.
 */
export function detectPromptInjection(message: string): boolean {
  const lowercaseMsg = message.toLowerCase();
  
  for (const signature of PROMPT_INJECTION_SIGNATURES) {
    if (lowercaseMsg.includes(signature)) {
      return true;
    }
  }
  
  return false;
}
