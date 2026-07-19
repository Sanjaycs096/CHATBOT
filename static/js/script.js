/**
 * @file script.js
 * @description Main client-side orchestrator. Handles input, communication with the server,
 * markdown parsing, copy/delete items, download history, and sidebar toggling.
 */

import { playSound } from './animation.js';
import { toggleSpeechRecognition, speakResponse, showToast, stopSpeaking, pauseSpeaking, resumeSpeaking } from './voice.js';

// Local temporary conversational state
let chatHistory = [];
let sessionDurationSeconds = 0;
let timerInterval = null;

// Native lightweight secure Markdown parser
function parseMarkdown(text) {
  if (!text) return "";
  
  // Clean inputs to avoid XSS
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Code blocks (```language ... ```)
  html = html.replace(/```([\s\S]*?)```/gm, (match, code) => {
    return `<pre class="font-mono text-xs text-purple-300"><code>${code.trim()}</code></pre>`;
  });

  // Inline code (`code`)
  html = html.replace(/`([^`]+)`/g, '<code class="bg-slate-900/80 px-1 py-0.5 rounded text-purple-300 font-mono text-xs">$1</code>');

  // Bold (**bold**)
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-white">$1</strong>');

  // Italics (*italics*)
  html = html.replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>');

  // Bullet points
  html = html.replace(/^\s*-\s+(.+)$/gmy, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/g, '<ul class="list-disc pl-5 my-2 space-y-1">$1</ul>');

  // Numbered points
  html = html.replace(/^\s*\d+\.\s+(.+)$/gmy, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/g, '<ol class="list-decimal pl-5 my-2 space-y-1">$1</ol>');

  // Headings
  html = html.replace(/^###\s+(.+)$/gm, '<h4 class="text-sm font-bold text-purple-300 mt-2 mb-1">$1</h4>');
  html = html.replace(/^##\s+(.+)$/gm, '<h3 class="text-base font-semibold text-purple-400 mt-3 mb-1">$1</h3>');
  html = html.replace(/^#\s+(.+)$/gm, '<h2 class="text-lg font-bold text-purple-400 mt-4 mb-2">$1</h2>');

  // Paragraphs (split by double carriage return)
  const paragraphs = html.split(/\n{2,}/);
  html = paragraphs.map(p => {
    if (p.startsWith('<pre') || p.startsWith('<ul') || p.startsWith('<ol') || p.startsWith('<h')) {
      return p;
    }
    return `<p class="leading-relaxed text-slate-300">${p.replace(/\n/g, '<br>')}</p>`;
  }).join('\n');

  return html;
}

// Generate human-friendly timestamp
function getFormattedTime() {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Safe client-side HTML escaper to neutralize XSS
function escapeHTML(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

// Render dynamic message node in UI
function appendMessage(role, text, detectedLang = '') {
  const landing = document.getElementById('landing-component');
  const messagesList = document.getElementById('messages-list');
  const portal = document.getElementById('chat-portal');
  
  // Hide landing view on first active item
  if (landing && !landing.classList.contains('hidden')) {
    landing.classList.add('hidden');
    messagesList.classList.remove('hidden');
  }

  const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
  const messageDiv = document.createElement('div');
  messageDiv.id = messageId;
  messageDiv.className = `flex items-start space-x-3.5 animate-fade-in ${role === 'user' ? 'justify-end' : ''}`;

  const parsedHTML = parseMarkdown(text);
  const time = getFormattedTime();

  // Create local message object for history logs
  chatHistory.push({ id: messageId, role, text, timestamp: time, language: detectedLang });

  if (role === 'user') {
    const escapedUserText = escapeHTML(text);
    messageDiv.innerHTML = `
      <div class="max-w-[85%] sm:max-w-xl space-y-1 text-right">
        <div class="text-3xs font-mono text-slate-500 uppercase tracking-widest flex items-center justify-end space-x-1.5">
          <span>You</span>
          <span class="w-1 h-1 rounded-full bg-slate-600"></span>
          <span>${time}</span>
        </div>
        <div class="glass px-4 py-3 rounded-2xl inline-block border border-purple-500/10 text-slate-100 font-medium text-sm text-left shadow-md user-bubble">
          <p class="leading-relaxed whitespace-pre-wrap">${escapedUserText}</p>
        </div>
      </div>
      <div class="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700/60 flex items-center justify-center shrink-0 shadow-md">
        <i data-lucide="user" class="w-4 h-4 text-purple-400"></i>
      </div>
    `;
  } else {
    // Determine language badges and gradients
    let badgeColor = 'bg-purple-500/10 text-purple-300 border-purple-500/20';
    if (detectedLang === 'Tamil') {
      badgeColor = 'bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/20';
    } else if (detectedLang === 'Malayalam') {
      badgeColor = 'bg-pink-500/10 text-pink-300 border-pink-500/20';
    }

    const badgeHTML = detectedLang 
      ? `<span class="text-3xs font-mono px-1.5 py-0.5 rounded border ${badgeColor}">${detectedLang}</span>`
      : '';

    const escapedTextAttr = escapeHTML(text);

    messageDiv.innerHTML = `
      <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-fuchsia-600 flex items-center justify-center shrink-0 shadow-md">
        <i data-lucide="bot" class="w-4 h-4 text-white"></i>
      </div>
      <div class="max-w-[85%] sm:max-w-xl space-y-1">
        <div class="text-3xs font-mono text-slate-500 uppercase tracking-widest flex items-center space-x-2">
          <span class="font-bold text-slate-300">PolyTalk AI</span>
          <span class="w-1 h-1 rounded-full bg-slate-600"></span>
          <span>${time}</span>
          ${badgeHTML}
        </div>
        <div class="glass px-4 py-3.5 rounded-2xl border border-slate-800 text-slate-200 text-sm shadow-xl markdown-body ai-bubble">
          ${parsedHTML}
        </div>
        <!-- Actions footer inside card -->
        <div class="flex items-center space-x-1 pl-1 pt-0.5 opacity-60 hover:opacity-100 transition-opacity">
          <button class="action-copy-btn p-1.5 rounded-lg hover:bg-slate-800/60 text-slate-400 hover:text-slate-200 transition-colors" title="Copy Text" data-text="${escapedTextAttr}">
            <i data-lucide="copy" class="w-3.5 h-3.5"></i>
          </button>
          <button class="action-speak-btn p-1.5 rounded-lg hover:bg-slate-800/60 text-slate-400 hover:text-slate-200 transition-colors" title="Speak Response" data-text="${escapedTextAttr}" data-lang="${detectedLang}">
            <i data-lucide="volume-2" class="w-3.5 h-3.5"></i>
          </button>
          <button class="action-stop-btn p-1.5 rounded-lg hover:bg-slate-800/60 text-slate-400 hover:text-slate-200 transition-colors" title="Mute Response">
            <i data-lucide="volume-x" class="w-3.5 h-3.5"></i>
          </button>
          <button class="action-regenerate-btn p-1.5 rounded-lg hover:bg-slate-800/60 text-slate-400 hover:text-slate-200 transition-colors" title="Regenerate" data-text="${escapedTextAttr}">
            <i data-lucide="rotate-cw" class="w-3.5 h-3.5"></i>
          </button>
          <button class="action-like-btn p-1.5 rounded-lg hover:bg-slate-800/60 text-slate-400 hover:text-slate-200 transition-colors" title="Like">
            <i data-lucide="thumbs-up" class="w-3.5 h-3.5"></i>
          </button>
          <button class="action-dislike-btn p-1.5 rounded-lg hover:bg-slate-800/60 text-slate-400 hover:text-slate-200 transition-colors" title="Dislike">
            <i data-lucide="thumbs-down" class="w-3.5 h-3.5"></i>
          </button>
          <button class="action-delete-btn p-1.5 rounded-lg hover:bg-slate-800/60 text-rose-400 hover:text-rose-300 transition-colors" title="Delete Message" data-id="${messageId}">
            <i data-lucide="trash" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      </div>
    `;
  }

  messagesList.appendChild(messageDiv);
  if (window.lucide) window.lucide.createIcons();
  
  // Smart auto-scroll: Scroll only if user is already at the bottom bounds
  if (portal) {
    const isAtBottom = portal.scrollHeight - portal.scrollTop - portal.clientHeight < 200;
    if (isAtBottom || chatHistory.length <= 1) {
      portal.scrollTo({
        top: portal.scrollHeight,
        behavior: 'smooth'
      });
    }
  }

  // Bind message action listeners
  bindMessageActions(messageId);
}

// Bind interactive actions on custom message nodes
function bindMessageActions(msgId) {
  const container = document.getElementById(msgId);
  if (!container) return;

  const copyBtn = container.querySelector('.action-copy-btn');
  const deleteBtn = container.querySelector('.action-delete-btn');
  const speakBtn = container.querySelector('.action-speak-btn');
  const stopBtn = container.querySelector('.action-stop-btn');
  const regenerateBtn = container.querySelector('.action-regenerate-btn');
  const likeBtn = container.querySelector('.action-like-btn');
  const dislikeBtn = container.querySelector('.action-dislike-btn');

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const textToCopy = copyBtn.getAttribute('data-text');
      navigator.clipboard.writeText(textToCopy).then(() => {
        showToast("Copied to clipboard!");
        playSound('click');
      }).catch(() => {
        showToast("Copy failed.");
      });
    });
  }

  if (speakBtn) {
    speakBtn.addEventListener('click', () => {
      const textToSpeak = speakBtn.getAttribute('data-text');
      const detectedLang = speakBtn.getAttribute('data-lang');
      speakResponse(textToSpeak, detectedLang);
      playSound('click');
    });
  }

  if (stopBtn) {
    stopBtn.addEventListener('click', () => {
      stopSpeaking();
      playSound('click');
      showToast("Speech synthesis stopped.");
    });
  }

  if (regenerateBtn) {
    regenerateBtn.addEventListener('click', () => {
      // Find the last user prompt message
      const userMsgs = chatHistory.filter(m => m.role === 'user');
      if (userMsgs.length > 0) {
        const lastPrompt = userMsgs[userMsgs.length - 1].text;
        showToast("Regenerating reply...");
        playSound('send');
        sendChatMessage(lastPrompt);
      } else {
        showToast("No prompt found to regenerate.");
      }
    });
  }

  if (likeBtn) {
    likeBtn.addEventListener('click', () => {
      likeBtn.classList.toggle('text-emerald-400');
      dislikeBtn?.classList.remove('text-rose-400');
      playSound('click');
      showToast("Thank you for your feedback!");
    });
  }

  if (dislikeBtn) {
    dislikeBtn.addEventListener('click', () => {
      dislikeBtn.classList.toggle('text-rose-400');
      likeBtn?.classList.remove('text-emerald-400');
      playSound('click');
      showToast("Feedback captured.");
    });
  }

  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => {
      const targetId = deleteBtn.getAttribute('data-id');
      const element = document.getElementById(targetId);
      if (element) {
        element.classList.add('opacity-0', 'scale-95');
        setTimeout(() => {
          element.remove();
          chatHistory = chatHistory.filter(m => m.id !== targetId);
          if (chatHistory.length === 0) {
            document.getElementById('landing-component').classList.remove('hidden');
            document.getElementById('messages-list').classList.add('hidden');
          }
        }, 300);
        showToast("Message deleted");
        playSound('click');
      }
    });
  }
}

// Trigger POST /chat request API to backend
async function sendChatMessage(text) {
  const thinking = document.getElementById('thinking-indicator');
  const portal = document.getElementById('chat-portal');
  const sendBtn = document.getElementById('send-btn');
  const textInput = document.getElementById('message-input');

  // Disable inputs while generating
  sendBtn.disabled = true;
  textInput.disabled = true;
  if (thinking) thinking.classList.remove('hidden');

  // Auto-scroll to show thinking indicator
  if (portal) {
    portal.scrollTo({ top: portal.scrollHeight, behavior: 'smooth' });
  }

  try {
    const res = await fetch('/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text })
    });

    if (!res.ok) {
      throw new Error(`API returned error code ${res.status}`);
    }

    const data = await res.json();
    
    // Hide loader
    if (thinking) thinking.classList.add('hidden');

    if (data.response) {
      appendMessage('bot', data.response, data.detected_language);
      playSound('receive');

      // Trigger automatic Speech playback if synthesis is on
      speakResponse(data.response, data.detected_language);
    } else {
      throw new Error("No response string inside payload");
    }

  } catch (err) {
    console.error("Chat transmission issue:", err);
    if (thinking) thinking.classList.add('hidden');
    
    appendMessage('bot', `⚠️ **Transmission Error**: We are unable to connect to the Google Gemini AI Server. Please verify your internet connection or check your API Secrets. \n\n*Error logs:* \`\`\`${err.message}\`\`\``, 'English');
    playSound('error');
  } finally {
    // Re-enable inputs
    sendBtn.disabled = false;
    textInput.disabled = false;
    textInput.focus();
    updateWordCounters();
  }
}

// Update local counter stats (characters, words)
function updateWordCounters() {
  const input = document.getElementById('message-input');
  const charCounter = document.getElementById('char-counter');
  const wordCounter = document.getElementById('word-counter');
  const sendBtn = document.getElementById('send-btn');

  if (!input || !charCounter || !wordCounter || !sendBtn) return;

  const text = input.value;
  const chars = text.length;
  const words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;

  charCounter.textContent = `${chars} chars`;
  wordCounter.textContent = `${words} words`;

  // Control send button state
  sendBtn.disabled = text.trim() === "";
}

// Export conversation history as structured log file (TXT, MD, JSON)
function exportConversationLogs(format) {
  if (chatHistory.length === 0) {
    showToast("Conversation log is currently empty.");
    return;
  }

  playSound('click');
  let content = "";
  let fileType = "text/plain;charset=utf-8";
  let fileName = `polytalk-ai-session-${Date.now()}`;

  if (format === 'txt') {
    content += `=========================================\n`;
    content += `  POLYTALK AI CONVERSATIONAL EXPORT LOG\n`;
    content += `  Export Date: ${new Date().toLocaleString()}\n`;
    content += `=========================================\n\n`;

    chatHistory.forEach(msg => {
      const roleLabel = msg.role === 'user' ? 'USER' : 'POLYTALK AI';
      const langBadge = msg.language ? ` [Dialect: ${msg.language}]` : '';
      content += `[${msg.timestamp}] ${roleLabel}${langBadge}:\n`;
      content += `${msg.text}\n`;
      content += `-----------------------------------------\n`;
    });
    fileName += ".txt";
  } else if (format === 'md') {
    content += `# PolyTalk AI - Conversation Export\n`;
    content += `*Generated: ${new Date().toLocaleString()}*\n\n---\n\n`;

    chatHistory.forEach(msg => {
      const roleLabel = msg.role === 'user' ? '**You**' : '**PolyTalk AI**';
      const langBadge = msg.language ? ` *(${msg.language})*` : '';
      content += `### ${roleLabel}${langBadge} \`[${msg.timestamp}]\`\n\n`;
      content += `${msg.text}\n\n---\n\n`;
    });
    fileName += ".md";
  } else if (format === 'json') {
    content = JSON.stringify(chatHistory, null, 2);
    fileType = "application/json;charset=utf-8";
    fileName += ".json";
  }

  const blob = new Blob([content], { type: fileType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast(`Chat log downloaded as ${format.toUpperCase()}!`);
}

// Handle sidebar toggling on mobile viewports
function initSidebarNavigation() {
  const openBtn = document.getElementById('open-sidebar-btn');
  const closeBtn = document.getElementById('close-sidebar-btn');
  const sidebar = document.getElementById('sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');

  if (!openBtn || !closeBtn || !sidebar || !backdrop) return;

  function openSidebar() {
    sidebar.classList.remove('-translate-x-full');
    backdrop.classList.remove('hidden');
    playSound('click');
  }

  function closeSidebar() {
    sidebar.classList.add('-translate-x-full');
    backdrop.classList.add('hidden');
    playSound('click');
  }

  openBtn.addEventListener('click', openSidebar);
  closeBtn.addEventListener('click', closeSidebar);
  backdrop.addEventListener('click', closeSidebar);
}

// Emoji panel utility injections
function initEmojiPicker() {
  const btn = document.getElementById('emoji-btn');
  const input = document.getElementById('message-input');
  if (!btn || !input) return;

  const popularEmojis = ['😊', '😂', '🔥', '👍', '🙏', 'தமிழ்', 'മലയാളം', '💡', '🤖', '✨', '❤️'];

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    playSound('click');
    
    // Create floating popover
    let picker = document.getElementById('emoji-popover');
    if (picker) {
      picker.remove();
      return;
    }

    picker = document.createElement('div');
    picker.id = 'emoji-popover';
    picker.className = 'absolute bottom-16 left-4 bg-slate-900 border border-slate-800 p-2.5 rounded-xl flex items-center space-x-2 shadow-2xl z-40 animate-fade-in';
    
    popularEmojis.forEach(emoji => {
      const eBtn = document.createElement('button');
      eBtn.className = 'hover:scale-125 hover:bg-slate-800 p-1.5 rounded transition-transform text-sm';
      eBtn.textContent = emoji;
      eBtn.addEventListener('click', () => {
        input.value += emoji;
        updateWordCounters();
        picker.remove();
        input.focus();
        playSound('click');
      });
      picker.appendChild(eBtn);
    });

    btn.parentElement.appendChild(picker);
  });

  // Close when clicking elsewhere
  document.addEventListener('click', () => {
    const picker = document.getElementById('emoji-popover');
    if (picker) picker.remove();
  });
}

// Auto scale message textarea box as content increases
function initTextareaAutoGrow() {
  const area = document.getElementById('message-input');
  if (!area) return;

  area.addEventListener('input', () => {
    area.style.height = 'auto';
    area.style.height = (area.scrollHeight - 4) + 'px';
  });
}

// Phase 1 Custom Typewriter Animation loops for Landing bots
function startTypewriterPreview() {
  const previewText = document.getElementById('landing-typing-preview');
  if (!previewText) return;

  const phrases = [
    "I understand English commands...",
    "நான் தமிழ் மொழியில் பேசுவேன்...",
    "എനിക്ക് മലയാളം നന്നായി അറിയാം...",
    "Ready to chat with you securely!"
  ];

  let phraseIdx = 0;
  let charIdx = 0;
  let isDeleting = false;

  function loop() {
    const currentPhrase = phrases[phraseIdx];
    if (isDeleting) {
      previewText.textContent = currentPhrase.substring(0, charIdx - 1);
      charIdx--;
    } else {
      previewText.textContent = currentPhrase.substring(0, charIdx + 1);
      charIdx++;
    }

    let delay = isDeleting ? 40 : 80;

    if (!isDeleting && charIdx === currentPhrase.length) {
      delay = 1800; // Pause at end of sentence
      isDeleting = true;
    } else if (isDeleting && charIdx === 0) {
      isDeleting = false;
      phraseIdx = (phraseIdx + 1) % phrases.length;
      delay = 500; // Pause before typing next sentence
    }

    setTimeout(loop, delay);
  }

  loop();
}

// Phase 5: Maintain session details & Timer
function initSessionTimer() {
  const timerElement = document.getElementById('session-timer');
  if (!timerElement) return;

  timerInterval = setInterval(() => {
    sessionDurationSeconds++;
    const mins = String(Math.floor(sessionDurationSeconds / 60)).padStart(2, '0');
    const secs = String(sessionDurationSeconds % 60).padStart(2, '0');
    timerElement.textContent = `${mins}:${secs}`;
  }, 1000);
}

// Config User Identity Preferences (Session only)
function initUserPreferences() {
  const usernameInput = document.getElementById('username-input');
  const saveBtn = document.getElementById('save-username-btn');
  const displayLabel = document.getElementById('session-username');

  if (!usernameInput || !saveBtn || !displayLabel) return;

  // Read previous session if exists
  const savedName = sessionStorage.getItem('polytalk-username');
  if (savedName) {
    usernameInput.value = savedName;
    displayLabel.textContent = savedName;
  }

  saveBtn.addEventListener('click', () => {
    const val = usernameInput.value.trim() || "Guest User";
    sessionStorage.setItem('polytalk-username', val);
    displayLabel.textContent = val;
    showToast(`Identity preference configured to ${val}!`);
    playSound('click');
  });
}

// Config Dynamic Theme Accent colors
function initThemeAccentPicker() {
  const root = document.documentElement;
  const accentButtons = document.querySelectorAll('[data-accent]');

  const accentsMap = {
    purple: {
      color: '#a855f7',
      rgb: '168, 85, 247',
      gradient: 'linear-gradient(135deg, #60A5FA 0%, #A78BFA 100%)',
      glow: '0 0 20px rgba(168, 85, 247, 0.35)'
    },
    blue: {
      color: '#3b82f6',
      rgb: '59, 130, 246',
      gradient: 'linear-gradient(135deg, #38BDF8 0%, #3B82F6 100%)',
      glow: '0 0 20px rgba(59, 130, 246, 0.35)'
    },
    fuchsia: {
      color: '#d946ef',
      rgb: '217, 70, 239',
      gradient: 'linear-gradient(135deg, #F472B6 0%, #D946EF 100%)',
      glow: '0 0 20px rgba(217, 70, 239, 0.35)'
    },
    emerald: {
      color: '#10b981',
      rgb: '16, 185, 129',
      gradient: 'linear-gradient(135deg, #34D399 0%, #10B981 100%)',
      glow: '0 0 20px rgba(16, 185, 129, 0.35)'
    },
    amber: {
      color: '#f59e0b',
      rgb: '245, 158, 11',
      gradient: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)',
      glow: '0 0 20px rgba(245, 158, 11, 0.35)'
    }
  };

  // Check saved choice
  const savedAccent = sessionStorage.getItem('polytalk-accent');
  if (savedAccent && accentsMap[savedAccent]) {
    applyAccent(accentsMap[savedAccent]);
  }

  accentButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const acc = btn.getAttribute('data-accent');
      if (accentsMap[acc]) {
        applyAccent(accentsMap[acc]);
        sessionStorage.setItem('polytalk-accent', acc);
        showToast(`Accent theme set to ${acc}!`);
        playSound('click');
      }
    });
  });

  function applyAccent(props) {
    root.style.setProperty('--accent-color', props.color);
    root.style.setProperty('--accent-color-rgb', props.rgb);
    root.style.setProperty('--accent-gradient', props.gradient);
    root.style.setProperty('--accent-glow', props.glow);
  }
}

// Scroll to bottom control button
function initScrollBottomController() {
  const portal = document.getElementById('chat-portal');
  const btn = document.getElementById('scroll-bottom-btn');

  if (!portal || !btn) return;

  portal.addEventListener('scroll', () => {
    const isAway = portal.scrollHeight - portal.scrollTop - portal.clientHeight > 220;
    if (isAway) {
      btn.classList.remove('scale-0', 'opacity-0');
      btn.classList.add('scale-100', 'opacity-100');
    } else {
      btn.classList.remove('scale-100', 'opacity-100');
      btn.classList.add('scale-0', 'opacity-0');
    }
  });

  btn.addEventListener('click', () => {
    portal.scrollTo({
      top: portal.scrollHeight,
      behavior: 'smooth'
    });
    playSound('click');
  });
}

// Listen to network status (Online / Offline feedback)
function initNetworkObserver() {
  const label = document.getElementById('network-status-label');
  const dot = document.getElementById('network-status-indicator');
  const badgeLabel = document.getElementById('network-badge-label');
  const badgeDot = document.getElementById('network-badge-dot');

  function updateStatus() {
    const isOnline = navigator.onLine;
    if (isOnline) {
      if (label) label.textContent = "ONLINE";
      if (dot) {
        dot.className = "w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse";
      }
      if (badgeLabel) badgeLabel.textContent = "SECURE CONNECTION";
      if (badgeDot) {
        badgeDot.className = "w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse";
      }
      showToast("System reconnected to secure server!");
    } else {
      if (label) label.textContent = "OFFLINE";
      if (dot) {
        dot.className = "w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5";
      }
      if (badgeLabel) badgeLabel.textContent = "OFFLINE MODE";
      if (badgeDot) {
        badgeDot.className = "w-1.5 h-1.5 rounded-full bg-rose-500";
      }
      showToast("Network disconnect: Local core active.");
    }
  }

  window.addEventListener('online', updateStatus);
  window.addEventListener('offline', updateStatus);
  updateStatus(); // run initial
}

// Modal handling routines
function setupModals() {
  const shortcutsModal = document.getElementById('shortcuts-modal');
  const shortcutsBtn = document.getElementById('shortcuts-help-btn');
  const closeShortcuts = document.getElementById('close-shortcuts-btn');

  const clearModal = document.getElementById('clear-confirm-modal');
  const clearBtn = document.getElementById('clear-chat-btn');
  const cancelClear = document.getElementById('cancel-clear-btn');
  const confirmClear = document.getElementById('confirm-clear-btn');

  // Toggle shortcuts
  if (shortcutsModal && shortcutsBtn && closeShortcuts) {
    const openMenu = () => {
      shortcutsModal.classList.remove('hidden');
      setTimeout(() => shortcutsModal.classList.add('opacity-100'), 10);
      playSound('click');
    };
    const closeMenu = () => {
      shortcutsModal.classList.remove('opacity-100');
      setTimeout(() => shortcutsModal.classList.add('hidden'), 300);
      playSound('click');
    };

    shortcutsBtn.addEventListener('click', openMenu);
    closeShortcuts.addEventListener('click', closeMenu);

    // Keyboard '?' toggle
    window.addEventListener('keydown', (e) => {
      if (e.key === '?' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        if (shortcutsModal.classList.contains('hidden')) {
          openMenu();
        } else {
          closeMenu();
        }
      }
    });
  }

  // Toggle Reset confirmation
  if (clearModal && clearBtn && cancelClear && confirmClear) {
    const openReset = () => {
      clearModal.classList.remove('hidden');
      setTimeout(() => clearModal.classList.add('opacity-100'), 10);
      playSound('click');
    };
    const closeReset = () => {
      clearModal.classList.remove('opacity-100');
      setTimeout(() => clearModal.classList.add('hidden'), 300);
      playSound('click');
    };

    clearBtn.addEventListener('click', openReset);
    cancelClear.addEventListener('click', closeReset);
    confirmClear.addEventListener('click', () => {
      closeReset();
      handleSessionReset();
    });
  }
}

// Reset/New Chat trigger
function handleSessionReset() {
  stopSpeaking();
  chatHistory = [];
  document.getElementById('messages-list').innerHTML = "";
  document.getElementById('messages-list').classList.add('hidden');
  document.getElementById('landing-component').classList.remove('hidden');
  showToast("Conversational state successfully reset.");
  playSound('receive');
}

// Main DOM Loader
document.addEventListener('DOMContentLoaded', () => {
  const landingPageView = document.getElementById('landing-page-view');
  const chatPageView = document.getElementById('chat-page-view');
  
  const heroLaunchCtaBtn = document.getElementById('hero-launch-cta-btn');
  const heroLaunchNavBtn = document.getElementById('hero-launch-nav-btn');
  
  const sidebarHomeBtn = document.getElementById('sidebar-home-btn');
  const headerCollapseBtn = document.getElementById('header-collapse-btn');

  const textInput = document.getElementById('message-input');
  const sendBtn = document.getElementById('send-btn');
  const newChatBtn = document.getElementById('new-chat-btn');
  const micBtn = document.getElementById('mic-btn');

  // Multi-export buttons
  const expTxt = document.getElementById('export-txt-btn');
  const expMd = document.getElementById('export-md-btn');
  const expJson = document.getElementById('export-json-btn');

  // Trigger typewriter logic
  startTypewriterPreview();

  // Route/Page transitions inside single-page dual layout
  function transitionToChat() {
    if (landingPageView && chatPageView) {
      playSound('send');
      landingPageView.classList.add('hidden');
      chatPageView.classList.remove('hidden');
      
      // Start session tracking timer once
      if (!timerInterval) {
        initSessionTimer();
      }

      if (textInput) textInput.focus();
    }
  }

  function transitionToHome() {
    if (landingPageView && chatPageView) {
      playSound('click');
      chatPageView.classList.add('hidden');
      landingPageView.classList.remove('hidden');
    }
  }

  if (heroLaunchCtaBtn) heroLaunchCtaBtn.addEventListener('click', transitionToChat);
  if (heroLaunchNavBtn) heroLaunchNavBtn.addEventListener('click', transitionToChat);
  
  if (sidebarHomeBtn) sidebarHomeBtn.addEventListener('click', transitionToHome);
  if (headerCollapseBtn) {
    headerCollapseBtn.addEventListener('click', () => {
      const sidebar = document.getElementById('sidebar');
      if (sidebar) {
        sidebar.classList.toggle('hidden');
        playSound('click');
      }
    });
  }

  // Load modules
  initSidebarNavigation();
  initEmojiPicker();
  initTextareaAutoGrow();
  initUserPreferences();
  initThemeAccentPicker();
  initScrollBottomController();
  initNetworkObserver();
  setupModals();

  // Message submission handler
  function triggerSend() {
    if (!textInput) return;
    const value = textInput.value.trim();
    if (value === "") return;

    appendMessage('user', value);
    playSound('send');
    
    // Clear text area
    textInput.value = "";
    textInput.style.height = 'auto';

    sendChatMessage(value);
  }

  if (sendBtn) {
    sendBtn.addEventListener('click', triggerSend);
  }

  if (textInput) {
    textInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        triggerSend();
      }
    });

    textInput.addEventListener('input', updateWordCounters);
  }

  // Suggestion chip clicks (transitions automatically if in landing)
  document.querySelectorAll('.suggestion-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const text = chip.querySelector('div:last-child').textContent;
      if (textInput) {
        textInput.value = text;
        updateWordCounters();
        textInput.focus();
        playSound('click');
      }
    });
  });

  // Export binders
  if (expTxt) expTxt.addEventListener('click', () => exportConversationLogs('txt'));
  if (expMd) expMd.addEventListener('click', () => exportConversationLogs('md'));
  if (expJson) expJson.addEventListener('click', () => exportConversationLogs('json'));

  // Side drawer reset button
  if (newChatBtn) newChatBtn.addEventListener('click', () => {
    const clearModal = document.getElementById('clear-confirm-modal');
    if (clearModal) {
      clearModal.classList.remove('hidden');
      setTimeout(() => clearModal.classList.add('opacity-100'), 10);
      playSound('click');
    } else {
      handleSessionReset();
    }
  });

  // Mic Button Voice trigger integration
  if (micBtn) {
    micBtn.addEventListener('click', () => {
      toggleSpeechRecognition((transcript) => {
        if (textInput && transcript.trim() !== "") {
          textInput.value = transcript;
          updateWordCounters();
          triggerSend(); // auto-send
        }
      });
    });
  }

  // Global Keyboard listener bindings
  window.addEventListener('keydown', (e) => {
    // Esc: stop speak synthesis
    if (e.key === 'Escape') {
      stopSpeaking();
    }
    // Ctrl + / : Focus chat text input
    if (e.key === '/' && e.ctrlKey) {
      e.preventDefault();
      if (textInput) textInput.focus();
    }
    // Ctrl + Delete : Clear session
    if (e.key === 'Delete' && e.ctrlKey) {
      e.preventDefault();
      const clearModal = document.getElementById('clear-confirm-modal');
      if (clearModal) {
        clearModal.classList.remove('hidden');
        setTimeout(() => clearModal.classList.add('opacity-100'), 10);
      }
    }
  });

  // Initialize Lucide icons on initial page load
  if (window.lucide) window.lucide.createIcons();
});
