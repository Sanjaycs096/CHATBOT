# -*- coding: utf-8 -*-
"""
@file language_detector.py
@description Performs high-reliability Unicode script checks and regex scans
to classify inputs as English, Tamil, or Malayalam.
"""

import re

class LanguageDetector:
    @staticmethod
    def detect_language(text: str) -> str:
        """
        Detects the primary language of the provided text.
        Prioritizes Tamil and Malayalam scripts via script ranges.
        
        Unicode Blocks:
        - Tamil: U+0B80 to U+0BFF
        - Malayalam: U+0D00 to U+0D7F
        """
        if not text or not isinstance(text, str):
            return "English"

        # Unicode ranges
        tamil_regex = re.compile(r'[\u0b80-\u0bff]')
        malayalam_regex = re.compile(r'[\u0d00-\u0d7f]')

        if tamil_regex.search(text):
            return "Tamil"
        elif malayalam_regex.search(text):
            return "Malayalam"
        
        return "English"
