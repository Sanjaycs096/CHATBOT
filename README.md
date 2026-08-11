<div align="center">
  <img src="static/favicon.svg" width="100" height="100" alt="PolyTalk AI Logo" />
  <h1>PolyTalk AI</h1>
  <p><strong>A sleek, highly responsive, multilingual conversational companion.</strong></p>
  
  [![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?logo=node.js&logoColor=white)](https://nodejs.org)
  [![Python](https://img.shields.io/badge/Python-3.9+-3776AB?logo=python&logoColor=white)](https://python.org)
  [![Groq](https://img.shields.io/badge/Groq-Llama_3.1-F26522?logo=meta&logoColor=white)](https://groq.com)
  [![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
</div>

<br/>

PolyTalk AI is a beautiful, premium, glassmorphic conversational interface supporting **English**, **Tamil (தமிழ்)**, and **Malayalam (മലയാളം)** via both text and voice.

It incorporates full-fidelity layout design, responsive sidebars, custom-synthesized notification audio cues, real-time character/word counts, and automatic language detection with localized Speech Synthesis playback.

## 📋 Table of Contents
- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation & Setup](#-installation--setup)
- [Testing & Quality](#-testing--quality)
- [Security Features](#-security-features)
- [Contributing](#-contributing)

---

## ✨ Key Features
- **Multilingual Context Generation:** Chat in English, Tamil, or Malayalam.
- **Dialect Locking:** Sidebar controls to enforce AI to generate responses exclusively in a specific dialect.
- **Regex JSON Parsing:** Robust JSON extraction mechanism bypassing typical LLM hallucination issues.
- **Glassmorphic UI:** Smooth animations, dynamic gradient backgrounds, and an immersive user experience.
- **Dual Server Implementations:** Bootable in Node.js (for high-scale production) or Python/Flask (for local Pythonic development).
- **Voice Synthesis:** Reads out messages in the native language automatically via Web Speech API.

---

## 🏛 Architecture
PolyTalk uses a robust dual-backend architecture to bridge the gap between lightweight UI development and heavy server orchestration. 

For a complete breakdown, please read our [Architecture Documentation](docs/architecture.md).

---

## 🛠 Tech Stack

| Category | Technologies |
| --- | --- |
| **Frontend** | Vanilla HTML5, CSS3, JavaScript (ES6) |
| **Styling** | Tailwind CSS via CDN, Lucide Icons |
| **Backend (Prod)** | Node.js, Express.js, TypeScript, tsx |
| **Backend (Dev)** | Python 3, Flask, Werkzeug |
| **AI Models** | `llama-3.1-8b-instant` via Groq Cloud |
| **Tooling** | Vite, dotenv, rate-limiter-flexible |

---

## 📁 Project Structure

```text
polytalk-ai/
├── .github/                   # CI/CD Workflows and Issue Templates
├── docs/                      # Technical Documentation
├── static/                    # Frontend assets
│     ├── css/                 # Glassmorphic stylesheets
│     ├── js/                  # SPA orchestration and voice routing
│     └── favicon.svg          # Vector branding
├── chatbot/                   # Python AI pipeline components
├── templates/                 # Flask HTML routes
├── app.py                     # Local Flask server
├── server.ts                  # Production Node server
├── package.json               # Node dependency manifest
├── requirements.txt           # Python dependency manifest
└── CHANGELOG.md               # Versioning history
```

---

## 🚀 Installation & Setup

### Option 1: Node.js (Production Mode)
Ideal for standard deployment.
```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env and insert your GROQ_API_KEY

# 3. Start server
npm run dev
```
The server will run on **http://localhost:3000**

### Option 2: Python / Flask (Development Mode)
Ideal for AI testing and scripting.
```bash
# 1. Setup virtual environment
python -m venv venv
source venv/bin/activate  # Or .\venv\Scripts\Activate.ps1 on Windows

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment
cp .env.example .env
# Edit .env and insert your GROQ_API_KEY

# 4. Start server
python app.py
```
The server will run on **http://localhost:5000**

---

## 🛡 Security Features
- **Prompt Injection Defense:** Both Node and Python servers run synchronous heuristics to block malicious context alterations.
- **XSS Sanitization:** Native HTML encoding parses user output before DOM injection.
- **Rate Limiting:** IP-based sliding window ratelimiting restricts `/chat` to prevent billing exhaustion.
- **Error Obfuscation:** Global handlers prevent raw server traces from leaking to the frontend SPA.

---

## 🤝 Contributing
Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

Please check out our [Bug Report Template](.github/ISSUE_TEMPLATE/bug_report.yml) if you find an issue.

## 📄 License
This project is open-source and available under the MIT License.
