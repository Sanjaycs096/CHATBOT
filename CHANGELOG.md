# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-08-11
### Added
- Integrated Llama-3.1-8b-instant model via Groq API.
- Replaced Google Gemini with robust Groq AI architecture.
- Added strict multi-dialect support (English, Tamil, Malayalam).
- Added UI toggles for locking AI response dialect.
- Injected real-time system date/time variables into AI context to prevent hallucinations on current events.
- Created highly robust Regex JSON parser for fallback logic when Groq json_validate fails.
- Integrated Web Speech API (SpeechRecognition & SpeechSynthesis).
- Added global error handlers to Flask backend for SPA redirection.
- Designed and injected SVG Favicon.

### Changed
- Shifted default Python port to 5000 to prevent collisions with Node on port 3000.
- Improved environment variable parsing to override stale system cache variables (`override=True`).

### Fixed
- Fixed Groq `json_validate_failed` bug by removing strict API validation and doing manual regex block extraction.
- Fixed 401 Unauthorized errors caused by trailing Windows CRLF newlines in `.env`.
