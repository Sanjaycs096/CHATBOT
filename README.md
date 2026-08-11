# PolyTalk AI - Multilingual AI Assistant

PolyTalk AI is a beautiful, premium, glassmorphic conversational companion supporting **English**, **Tamil (தமிழ்)**, and **Malayalam (മലയാളം)** via both text and voice.

It incorporates full-fidelity layout design, responsive sidebars, custom-synthesized notification audio cues, real-time character/word counts, and automatic language detection with localized Speech Synthesis playback.

---

## Technical Architecture

To align with development and deployment environments seamlessly:
1. **Frontend**: 100% Vanilla HTML5, CSS3, and JavaScript (ES6 Modules) - entirely free of React or Vue as requested.
2. **Backend Services**:
   - **Production Node/Express Server (`server.ts`)**: Boots natively on port 3000 inside container sandboxes and uses Vite to bundle/serve the premium frontend and integrate securely with the Groq API.
   - **Local Python/Flask Server (`app.py`)**: Fully integrated as requested, serving as the MVC layout controller for offline developer deployments.

---

## Folder Explanation

```text
multilingual-chatbot/
│
├── app.py                     # Main Python Flask backend server
├── server.ts                  # Main Node/Express production backend server
├── requirements.txt           # Python Flask dependency manifest
├── package.json               # Node/Vite/Express dependency manifest
├── .env.example               # Template file for secret parameters
├── README.md                  # Comprehensive user guides and manuals
│
├── static/                    # Frontend assets
│     ├── css/
│     │      style.css         # Custom animations, scrollbars, and dark themes
│     │
│     ├── js/
│     │      script.js         # Chat orchestrator and lightweight Markdown parser
│     │      voice.js          # SpeechRecognition & SpeechSynthesis controllers
│     │      animation.js      # Ambient floating bubbles, preloader, and synthesizers
│     │
│     └── images/              # Media resources
│
├── templates/
│      index.html              # Main HTML frontend template (for Flask render)
│
├── chatbot/                   # Python modular AI pipeline
│      chatbot.py              # Secure Groq API direct communication handler
│      language_detector.py    # High-reliability Unicode script classifiers
│      prompt_manager.py       # Conversational persona structures
│      speech.py               # Voice locale mappings and meta configs
│
└── utils/
       helpers.py              # XSS sanitizers and error handlers
```

---

## Installation & Setup

### Option A: Python / Flask (Local Development)

#### 1. Prerequisites
- Python 3.9 or higher
- Pip package manager

#### 2. Virtual Environment Setup
Create and activate a isolated virtual environment to keep your system packages clean:

```bash
# Create the environment
python -m venv venv

# Activate (macOS/Linux)
source venv/bin/activate

# Activate (Windows PowerShell)
.\venv\Scripts\Activate.ps1
```

#### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

#### 4. Configure Secrets
Copy the template `.env.example` file to `.env` and fill in your Groq API Key:
```env
GROQ_API_KEY="YOUR_ACTUAL_API_KEY_HERE"
```

#### 5. Launch the Server
```bash
python app.py
```
The server will boot locally at **`http://127.0.0.1:5000`**.

---

### Option B: Node / Express (Production / AI Studio)

#### 1. Install Node Dependencies
```bash
npm install
```

#### 2. Start Development Server
```bash
npm run dev
```

#### 3. Build & Compile for Production
```bash
npm run build
npm start
```

---

## Groq API Configuration

1. **Get an API Key**: Navigate to the [Groq Console](https://console.groq.com/) and request an API key.
2. **Setup Secrets Safely**:
   - For Local Python development, place the key in `.env`: `GROQ_API_KEY="gsk_..."`
   - For the AI Studio Cloud sandbox, navigate to the **Settings > Secrets** panel in the user interface to add `GROQ_API_KEY` directly. It is injected into your server variables automatically.

---

## Troubleshooting

### Speech Synthesis / Voices Unavailable
- **Symptoms**: No voice output or wrong dialect.
- **Fix**: Speech synthesis relies on device-installed TTS models. For high-fidelity Tamil or Malayalam playback, ensure that Tamil/Malayalam voice synthesizers are enabled on your operating system or browser (e.g., Google TTS, Microsoft David/Zira, Apple Speech).

### Microphone Capture Blocked
- **Symptoms**: Clicking the Mic button triggers errors.
- **Fix**: Modern browsers require active secure contexts (`https://` or `localhost`) to request microphone access. Ensure you grant mic permissions to the applet in your browser's address bar.

### Groq API Connection Timeouts
- **Symptoms**: Messages are greeted by "System Latency" notifications.
- **Fix**: Check that your `GROQ_API_KEY` is fully correct and active, and that your server container has open outbound ports to communicate with Groq services.
