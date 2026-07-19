# -*- coding: utf-8 -*-
"""
@file middleware.py
@description Attaches secure HTTP response headers to prevent clickjacking, MIME sniffing, 
XSS injections, and enforce restrictive CSP.
"""

from flask import Response

def add_security_headers(response: Response) -> Response:
    """
    Attaches comprehensive security headers to the Flask response.
    """
    # 1. Content Security Policy
    csp_rules = (
        "default-src 'self'; "
        "script-src 'self' unpkg.com cdn.tailwindcss.com 'unsafe-inline' 'unsafe-eval'; "
        "style-src 'self' fonts.googleapis.com 'unsafe-inline'; "
        "font-src 'self' fonts.gstatic.com; "
        "img-src 'self' data: blob:; "
        "connect-src 'self' unpkg.com cdn.tailwindcss.com; "
        "media-src 'self' blob: data:; "
        "object-src 'none'; "
        "frame-ancestors 'self' https://*.run.app https://*.google.com https://ai.studio https://ai-studio.build; "
        "base-uri 'self'; "
        "form-action 'self';"
    )
    response.headers["Content-Security-Policy"] = csp_rules
    
    # 2. Frame options
    response.headers["X-Frame-Options"] = "SAMEORIGIN"
    
    # 3. Content Type options
    response.headers["X-Content-Type-Options"] = "nosniff"
    
    # 4. Referrer Policy
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    
    # 5. Permissions Policy
    response.headers["Permissions-Policy"] = "microphone=(self), camera=(), geolocation=()"
    
    # 6. CORS policy restrictions
    response.headers["Access-Control-Allow-Methods"] = "GET, POST"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    
    # 7. Cache-Control for dynamic pages
    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, proxy-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    
    return response
