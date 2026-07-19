# -*- coding: utf-8 -*-
"""
@file rate_limiter.py
@description Lightweight in-memory rate limiting implementation for Python Flask app.
"""

import time
from flask import request, jsonify

# Store rate limiting logs in-memory
ip_records = {}

def clean_expired_records(window_sec=60):
    """
    Cleans up old rate limit hits.
    """
    now = time.time()
    for ip in list(ip_records.keys()):
        hits = [t for t in ip_records[ip] if now - t < window_sec]
        if not hits:
            del ip_records[ip]
        else:
            ip_records[ip] = hits

def limit_requests(limit=10, window_sec=60):
    """
    Flask decorator / interceptor to rate limit requests.
    """
    def decorator(f):
        def wrapper(*args, **kwargs):
            # Safe IP resolution
            ip = request.headers.get("X-Forwarded-For", request.remote_addr or "127.0.0.1")
            ip = ip.split(",")[0].strip()
            
            now = time.time()
            clean_expired_records(window_sec)
            
            if ip not in ip_records:
                ip_records[ip] = []
                
            # Filter hits outside the window
            ip_records[ip] = [t for t in ip_records[ip] if now - t < window_sec]
            
            if len(ip_records[ip]) >= limit:
                return jsonify({
                    "response": "⚠️ **Rate Limit Exceeded**: You are posting inputs too fast! Please pause and try again in a minute.",
                    "detected_language": "English"
                }), 429
                
            ip_records[ip].append(now)
            return f(*args, **kwargs)
        wrapper.__name__ = f.__name__
        return wrapper
    return decorator
