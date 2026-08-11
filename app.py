# -*- coding: utf-8 -*-
"""
@file app.py
@description Main Flask entry point serving Vanilla CSS/HTML/JS frontends,
now fully secured and hardened with OWASP Top 10 defenses.
"""

import os
from flask import Flask, render_template, request, jsonify, send_from_directory
from dotenv import load_dotenv
from chatbot.chatbot import MultilingualChatbot

# Import modular security utilities (Defense in depth)
from utils.validators import validate_and_normalize_message, detect_prompt_injection
from utils.sanitizer import sanitize_response
from utils.rate_limiter import limit_requests
from utils.middleware import add_security_headers
from utils.error_handler import handle_exception, log_security_event

load_dotenv(override=True)

app = Flask(__name__, 
            static_folder='static',
            template_folder='templates')

# Enforce payload body size restriction to 10KB (DoS prevention)
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024

# Initialize our secure modular chatbot
chatbot = MultilingualChatbot()

@app.after_request
def after_request(response):
    """
    Hook to enforce strict CSP, anti-clickjacking, nosniff, and other security headers.
    """
    return add_security_headers(response)

@app.route('/')
def index():
    """
    Renders the beautiful glassmorphic home portal.
    """
    return render_template('index.html')

@app.errorhandler(404)
def not_found_error(error):
    """
    Catch-all for 404 errors (useful for SPA behavior).
    Redirects back to the main chat portal.
    """
    return render_template('index.html'), 404

@app.errorhandler(500)
def internal_error(error):
    """
    Catch-all for 500 errors.
    """
    return render_template('index.html'), 500

@app.route('/chat', methods=['POST'])
@limit_requests(limit=10, window_sec=60)
def chat():
    """
    Receives text messages from the client, triggers Groq processing,
    and returns a structured JSON reply. Heavily validated and sanitized.
    """
    client_ip = request.headers.get("X-Forwarded-For", request.remote_addr or "127.0.0.1")
    client_ip = client_ip.split(",")[0].strip()
    
    try:
        data = request.get_json() or {}
        user_message = data.get("message", "")
        dialect = data.get("dialect", None)
        
        # 1. Advanced validation & Unicode normalization
        try:
            clean_message = validate_and_normalize_message(user_message)
        except (ValueError, TypeError) as val_err:
            log_security_event(client_ip, "INPUT_VALIDATION_FAILURE", request.path, 400, str(val_err))
            return jsonify({
                "response": f"⚠️ **Input Validation Error**: {str(val_err)}",
                "detected_language": "English"
            }), 400

        # 2. Prompt injection screening
        if detect_prompt_injection(clean_message):
            log_security_event(client_ip, "PROMPT_INJECTION_ALERT", request.path, 400, f"Prompt: {clean_message[:50]}...")
            return jsonify({
                "response": "🛡️ **Security Intercept**: PolyTalk AI detected an irregular prompt pattern or prompt injection attempt. Please formulate a standard conversational question.",
                "detected_language": "English"
            }), 400

        # Query our modular chat processing framework
        reply_payload = chatbot.generate_reply(clean_message, dialect=dialect)
        
        # 3. Output sanitization (XSS and script injection protection)
        if reply_payload and "response" in reply_payload:
            reply_payload["response"] = sanitize_response(reply_payload["response"])
            
        return jsonify(reply_payload)

    except Exception as e:
        # Secure error sanitization and log emission
        err_response = handle_exception(e, client_ip, request.path)
        return jsonify(err_response), 500

@app.route('/static/<path:path>')
def serve_static(path):
    """
    Explicitly handle static asset pipelines for files under static/
    """
    return send_from_directory('static', path)

if __name__ == '__main__':
    # Bind to host 0.0.0.0 and port 5000 to avoid conflict with the Node.js server
    app.run(host='0.0.0.0', port=5000, debug=False)
