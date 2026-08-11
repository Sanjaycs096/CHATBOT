# -*- coding: utf-8 -*-
"""
@file chatbot.py
@description Integrates Groq API using python-dotenv.
"""

import os
import re
import json
import requests
from dotenv import load_dotenv
from chatbot.prompt_manager import PromptManager
from chatbot.language_detector import LanguageDetector
from utils.helpers import format_error_response

load_dotenv(override=True)

class MultilingualChatbot:
    def __init__(self):
        key = os.getenv("GROQ_API_KEY", "")
        self.api_key = key.strip("\"'\r\n ")
        self.endpoint = "https://api.groq.com/openai/v1/chat/completions"

    def generate_reply(self, message: str, dialect: str = None) -> dict:
        """
        Interacts with Gemini API via direct JSON request for maximum stability
        without strict library-version dependencies, guaranteeing structured JSON returns.
        """
        if not self.api_key:
            return format_error_response("GROQ_API_KEY is not defined in backend secrets.")

        system_instruction = PromptManager.get_system_instruction()
        if dialect:
            system_instruction += f"\n\nIMPORTANT: The content of your 'response' JSON key MUST be exclusively in {dialect}, regardless of the language the user uses. DO NOT add any conversational text outside the JSON object."
            
        system_instruction += "\n\nNOTE: Your knowledge cutoff is typically around 2021 to 2023. If you are asked about recent current events, please answer to the best of your ability but kindly add a small note that your data is limited up to your training cutoff date."
        
        # Build direct request payload without strict response_format to avoid Groq's json_validate_failed bug
        payload = {
            "model": "llama-3.1-8b-instant",
            "messages": [
                {
                    "role": "system",
                    "content": f"{system_instruction}\n\nPlease output valid JSON ONLY, starting with {{ and ending with }}."
                },
                {
                    "role": "user",
                    "content": message
                }
            ]
        }

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }

        try:
            # Send securely
            response = requests.post(self.endpoint, json=payload, headers=headers, timeout=15)
            
            if response.status_code != 200:
                raise Exception(f"Groq APIs returned HTTP status code {response.status_code}: {response.text}")

            result = response.json()
            choices = result.get("choices", [])
            if not choices:
                raise Exception("No content choices returned from Groq API.")

            text_part = choices[0]["message"]["content"]
            
            # Robustly parse response json by finding the first { and last }
            match = re.search(r'\{.*\}', text_part, re.DOTALL)
            if match:
                text_part = match.group(0)
                
            data = json.loads(text_part.strip())
            return data

        except Exception as e:
            # Fallback offline language detection and friendly warning
            detected = LanguageDetector.detect_language(message)
            return {
                "response": f"⚠️ **Service Latency**: I am unable to connect to the primary Groq AI server right now.\n\n*Details:* {str(e)}",
                "detected_language": detected
            }
__all__ = ["MultilingualChatbot"]
Def = MultilingualChatbot()
