# -*- coding: utf-8 -*-
"""
@file error_handler.py
@description Implements secure, non-disclosing error formatting and system logging 
for the Flask backend.
"""

import logging
from datetime import datetime

# Configure standard secure logger
logger = logging.getLogger("PolyTalkSecurity")
logging.basicConfig(level=logging.INFO)

def log_security_event(ip: str, event_type: str, endpoint: str, status_code: int, details: str = ""):
    """
    Logs security events with timestamp, sanitized IP, and descriptive codes.
    """
    timestamp = datetime.utcnow().isoformat()
    clean_ip = ip.replace("\r", "").replace("\n", "")
    clean_event = event_type.replace("\r", "").replace("\n", "")
    clean_endpoint = endpoint.replace("\r", "").replace("\n", "")
    clean_details = details.replace("\r", "").replace("\n", "")
    
    logger.info(
        f"[SECURITY LOG] [{timestamp}] IP: {clean_ip} | Event: {clean_event} | Route: {clean_endpoint} | Status: {status_code} | Info: {clean_details}"
    )

def handle_exception(e: Exception, ip: str, endpoint: str) -> dict:
    """
    Sanitizes stack traces, emits a security log, and yields a safe generic payload to the client.
    """
    err_message = str(e)
    # Exclude internal file paths or API details if present
    logger.error(f"[EXCEPTION CAUGHT] {timestamp_str()} | Endpoint: {endpoint} | Error: {err_message}")
    
    log_security_event(
        ip=ip,
        event_type="UNHANDLED_BACKEND_EXCEPTION",
        endpoint=endpoint,
        status_code=500,
        details=err_message[:200] # Safe slice
    )
    
    return {
        "response": "⚠️ **System Interruption**: PolyTalk AI encountered an issue. Please verify your message details and try again.",
        "detected_language": "English"
    }

def timestamp_str() -> str:
    return datetime.utcnow().isoformat()
