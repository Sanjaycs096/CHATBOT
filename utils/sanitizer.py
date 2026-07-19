# -*- coding: utf-8 -*-
"""
@file sanitizer.py
@description Handles output sanitization, escaping malicious dynamic text, 
and neutralizing script injection vectors for Python.
"""

import re
import html

def escape_html(text: str) -> str:
    """
    Escapes standard raw HTML characters.
    """
    if not text:
        return ""
    return html.escape(text)

def sanitize_response(response: str) -> str:
    """
    Cleans chatbot responses to block malicious script tags, iframes, and onload actions
    while allowing legitimate user markdown syntax to be rendered securely.
    """
    if not response:
        return ""

    # 1. Strip script tags and inner contents
    sanitized = re.sub(r'<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>', '', response, flags=re.IGNORECASE)

    # 2. Strip iframes, embed, objects
    sanitized = re.sub(r'<iframe\b[^<]*<\/iframe>', '', sanitized, flags=re.IGNORECASE)
    sanitized = re.sub(r'<object\b[^<]*<\/object>', '', sanitized, flags=re.IGNORECASE)
    sanitized = re.sub(r'<embed\b[^<]*>', '', sanitized, flags=re.IGNORECASE)

    # 3. Strip inline script event handlers (e.g. onload, onerror)
    sanitized = re.sub(r'\bon[a-z]+\s*=\s*(["\'])[^\1]*?\1', '', sanitized, flags=re.IGNORECASE)

    # 4. Neutralize javascript pseudo protocol
    sanitized = re.sub(r'javascript\s*:\s*[^\s\'"]*', 'unsafe-uri', sanitized, flags=re.IGNORECASE)

    return sanitized
