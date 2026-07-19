# -*- coding: utf-8 -*-
"""
@file chatbot.py
@description Integrates Google Gemini API using python-dotenv and 
generative AI SDK client.
"""

import os
import json
import requests
from dotenv import load_dotenv
from chatbot.prompt_manager import PromptManager
from chatbot.language_detector import LanguageDetector
from utils.helpers import format_error_response

load_dotenv()

class MultilingualChatbot:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        # Base endpoint fallback in case dependencies are not fully configured
        self.endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent"

    def generate_reply(self, message: str) -> dict:
        """
        Interacts with Gemini API via direct JSON request for maximum stability
        without strict library-version dependencies, guaranteeing structured JSON returns.
        """
        if not self.api_key:
            return format_error_response("GEMINI_API_KEY is not defined in backend secrets.")

        system_instruction = PromptManager.get_system_instruction()
        
        # Build direct request payload
        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": message}
                    ]
                }
            ],
            "systemInstruction": {
                "parts": [
                    {"text": system_instruction}
                ]
            },
            "generationConfig": {
                "responseMimeType": "application/json"
            }
        }

        headers = {
            "Content-Type": "application/json"
        }

        try:
            # Send securely
            url = f"{self.endpoint}?key={self.api_key}"
            response = requests.post(url, json=payload, headers=headers, timeout=15)
            
            if response.status_code != 200:
                raise Exception(f"Google APIs returned HTTP status code {response.status_code}: {response.text}")

            result = response.json()
            candidates = result.get("candidates", [])
            if not candidates:
                raise Exception("No content candidates returned from Google AI model.")

            text_part = candidates[0]["content"]["parts"][0]["text"]
            
            # Parse response json
            data = json.loads(text_part.strip())
            return data

        except Exception as e:
            # Fallback offline language detection and friendly warning
            detected = LanguageDetector.detect_language(message)
            return {
                "response": f"⚠️ **Service Latency**: I am unable to connect to the primary Gemini AI server right now.\n\n*Details:* {str(e)}",
                "detected_language": detected
            }
__all__ = ["MultilingualChatbot"]
Def = MultilingualChatbot()
