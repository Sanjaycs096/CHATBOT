# -*- coding: utf-8 -*-
"""
@file validators.py
@description Performs string level input constraints, Unicode normalization,
and prompt injection detection for the Python Flask backend.
"""

import re
import unicodedata

# Common prompt injection signatures to scan for
PROMPT_INJECTION_SIGNATURES = [
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
]

def validate_and_normalize_message(message: str) -> str:
    """
    Validates the text parameter, normalizes Unicode encoding, limits size, 
    and filters invisible control characters.
    """
    if message is None:
        raise ValueError("Message input is missing.")
        
    if not isinstance(message, str):
        raise TypeError("Message input must be a string value.")

    # 1. Unicode Normalization (NFC)
    normalized = unicodedata.normalize("NFC", message)

    # 2. Size limit checking (DoS prevention)
    if len(normalized) > 2000:
        raise ValueError("Message length exceeds maximum safe size of 2000 characters.")

    # 3. Hidden control characters check (excluding tab, space, newline)
    # Zero-width spaces, etc.
    normalized = re.sub(r'[\u200b-\u200d\ufeff]', '', normalized)

    # Unicode control character categories (Cc, Cf)
    control_chars = [c for c in normalized if unicodedata.category(c) in ("Cc", "Cf") and c not in ("\n", "\r", "\t")]
    if control_chars:
        raise ValueError("Unsafe control characters detected in input.")

    # 4. Strip excessive spacing
    normalized = normalized.strip()

    if not normalized:
        raise ValueError("Message cannot be empty or containing only whitespaces.")

    return normalized

def detect_prompt_injection(message: str) -> bool:
    """
    Scans the string for common prompt injection patterns.
    """
    lowercase_msg = message.lower()
    for signature in PROMPT_INJECTION_SIGNATURES:
        if signature in lowercase_msg:
            return True
    return False
