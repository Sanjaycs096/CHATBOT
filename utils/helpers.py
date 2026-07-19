# -*- coding: utf-8 -*-
"""
@file helpers.py
@description Helper functions, string formatting, and XSS sanitizers.
"""

import html

def sanitize_input(text: str) -> str:
    """
    Sanitizes string inputs to prevent XSS.
    """
    if not text:
        return ""
    return html.escape(text.strip())

def format_error_response(error_message: str) -> dict:
    """
    Builds a standard error payload.
    """
    return {
        "response": f"⚠️ **System Interruption**: {error_message}",
        "detected_language": "English"
    }
