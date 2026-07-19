# -*- coding: utf-8 -*-
"""
@file speech.py
@description Documents voice settings and provides voice mapping metadata
for client-side Web Speech and SpeechSynthesis APIs.
"""

class SpeechEngineMetadata:
    @staticmethod
    def get_supported_voices():
        """
        Returns metadata about supported languages and recommended locales
        for SpeechSynthesis and SpeechRecognition APIs.
        """
        return {
            "English": {
                "locale": "en-US",
                "rate": 1.0,
                "pitch": 1.0
            },
            "Tamil": {
                "locale": "ta-IN",
                "rate": 0.95,
                "pitch": 1.05
            },
            "Malayalam": {
                "locale": "ml-IN",
                "rate": 0.95,
                "pitch": 1.05
            }
        }
