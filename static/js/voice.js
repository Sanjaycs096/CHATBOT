/**
 * @file voice.js
 * @description Manages browser-native Speech Recognition (Web Speech API) and 
 * Speech Synthesis (SpeechSynthesis API) with automatic voice mapping for 
 * English, Tamil, and Malayalam.
 */

import { playSound } from './animation.js';

// Native API check
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;

let recognition = null;
let isListening = false;
let synthesisEnabled = true; // Read aloud responses by default
let currentUtterance = null;

// Initialize Web Speech Recognition
if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.continuous = false; // Capture short commands
  recognition.interimResults = false; // Only final transcript
  recognition.maxAlternatives = 1;
}

// Track available voices for synthesis
let voicesList = [];
function loadVoices() {
  if ('speechSynthesis' in window) {
    voicesList = window.speechSynthesis.getVoices();
  }
}
loadVoices();
if ('speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

/**
 * Automatically triggers Mic Web Speech Recognition
 */
export function toggleSpeechRecognition(onResultCallback, onErrorCallback) {
  if (!recognition) {
    showToast("Voice Recognition is unsupported in this browser.");
    if (onErrorCallback) onErrorCallback("unsupported");
    return;
  }

  const micBtn = document.getElementById('mic-btn');
  const micIcon = document.getElementById('mic-icon');
  const overlay = document.getElementById('voice-listening-overlay');

  if (isListening) {
    // STOP ACTIVE CAPTURE
    recognition.stop();
    isListening = false;
    micBtn.classList.remove('bg-rose-600', 'text-white', 'pulse-record');
    micBtn.classList.add('bg-slate-800', 'text-purple-400');
    overlay.classList.add('hidden');
    playSound('click');
  } else {
    // START NEW CAPTURE
    isListening = true;
    playSound('send');
    
    // Stop any speaking speech before capturing
    stopSpeaking();

    // Check language context or use default multi-lingual auto mode
    // We set speech recognition language to empty or let the browser auto-detect if possible.
    // By default, setting recognition.lang = "" or "en-US" (with fallback). 
    // In many engines, "ta-IN" or "ml-IN" works if we set it. Let's let it run or support multi.
    // We'll set lang to a broad default or look at current state.
    recognition.lang = 'en-US'; // English fallback, browser usually accepts any spoken language
    
    recognition.start();

    // Update UI elements
    micBtn.classList.remove('bg-slate-800', 'text-purple-400');
    micBtn.classList.add('bg-rose-600', 'text-white', 'pulse-record');
    overlay.classList.remove('hidden');

    recognition.onresult = (event) => {
      let transcript = event.results[0][0].transcript;
      
      // Advanced transcript validation & sanitization (Defense in depth)
      if (transcript) {
        transcript = transcript.trim().normalize("NFC");
        
        // Strip zero-width/invisible characters
        transcript = transcript.replace(/[\u200B-\u200D\uFEFF]/g, "");
        
        // Reject/slice oversized transcripts (automated voice injections defense)
        if (transcript.length > 1000) {
          transcript = transcript.substring(0, 1000);
        }
      }
      
      if (onResultCallback) onResultCallback(transcript || "");
      resetMicUI();
    };

    recognition.onerror = (event) => {
      if (event.error === 'not-allowed') {
        console.warn('Speech recognition access denied (not-allowed).');
        showToast("Microphone access blocked. Please allow microphone permissions in your browser or iframe settings.");
      } else {
        console.error('Speech recognition error:', event.error);
        showToast(`Voice capture issue: ${event.error}`);
      }
      if (onErrorCallback) onErrorCallback(event.error);
      resetMicUI();
      playSound('error');
    };

    recognition.onend = () => {
      resetMicUI();
    };
  }
}

function resetMicUI() {
  isListening = false;
  const micBtn = document.getElementById('mic-btn');
  const overlay = document.getElementById('voice-listening-overlay');
  if (micBtn) {
    micBtn.classList.remove('bg-rose-600', 'text-white', 'pulse-record');
    micBtn.classList.add('bg-slate-800', 'text-purple-400');
  }
  if (overlay) {
    overlay.classList.add('hidden');
  }
}

// Tamil transliteration maps for compatibility fallback when native voices are not present on the system
const tamilVowels = {
  'அ': 'a', 'ஆ': 'aa', 'இ': 'i', 'ஈ': 'ee', 'உ': 'u', 'ஊ': 'oo',
  'எ': 'e', 'ஏ': 'ae', 'ஐ': 'ai', 'ஒ': 'o', 'ஓ': 'oe', 'ஔ': 'au', 'ஃ': 'h'
};

const tamilConsonants = {
  'க': 'ka', 'ங': 'nga', 'ச': 'cha', 'ஞ': 'nya', 'ட': 'ta', 'ண': 'na',
  'த': 'tha', 'ந': 'na', 'ப': 'pa', 'ம': 'ma', 'ய': 'ya', 'ர': 'ra',
  'ல': 'la', 'வ': 'va', 'ழ': 'zha', 'ள': 'la', 'ற': 'ra', 'ன': 'na',
  'ஜ': 'ja', 'ஶ': 'sha', 'ஷ்': 'sh', 'ஸ்': 'sa', 'ஹ': 'ha'
};

const tamilVowelSigns = {
  'ா': 'aa', 'ி': 'i', 'ீ': 'ee', 'ு': 'u', 'ூ': 'oo',
  'ெ': 'e', 'ே': 'ae', 'ை': 'ai', 'ொ': 'o', 'ோ': 'oe', 'ௌ': 'au'
};

function transliterateTamil(text) {
  let result = '';
  let i = 0;
  while (i < text.length) {
    const char = text[i];
    if (tamilConsonants[char]) {
      let base = tamilConsonants[char];
      const nextChar = text[i + 1];
      if (nextChar === '்') {
        result += base.slice(0, -1);
        i += 2;
      } else if (tamilVowelSigns[nextChar]) {
        result += base.slice(0, -1) + tamilVowelSigns[nextChar];
        i += 2;
      } else {
        result += base;
        i += 1;
      }
    } else if (tamilVowels[char]) {
      result += tamilVowels[char];
      i += 1;
    } else {
      result += char;
      i += 1;
    }
  }
  return result;
}

// Malayalam transliteration maps for compatibility fallback when native voices are not present on the system
const malayalamVowels = {
  'അ': 'a', 'ആ': 'aa', 'ഇ': 'i', 'ഈ': 'ee', 'ഉ': 'u', 'ഊ': 'oo',
  'ഋ': 'ri', 'എ': 'e', 'ഏ': 'ae', 'ഐ': 'ai', 'ഒ': 'o', 'ഓ': 'oe', 'ഔ': 'au'
};

const malayalamConsonants = {
  'ക': 'ka', 'ഖ': 'kha', 'ഗ': 'ga', 'ഘ': 'gha', 'ങ': 'nga',
  'ച': 'cha', 'ഛ': 'chha', 'ജ': 'ja', 'ഝ': 'jha', 'ഞ': 'nya',
  'ട': 'ta', 'ഠ': 'tha', 'ഡ': 'da', 'ഢ': 'dha', 'ണ': 'na',
  'ത': 'tha', 'ഥ': 'thha', 'ദ': 'da', 'ധ': 'dha', 'ന': 'na',
  'പ': 'pa', 'ഫ': 'pha', 'ബ': 'ba', 'ഭ': 'bha', 'മ': 'ma',
  'യ': 'ya', 'ര': 'ra', 'ല': 'la', 'വ': 'va', 'ശ': 'sha', 'ഷ': 'sha',
  'സ': 'sa', 'ஹ': 'ha', 'ള': 'la', 'ഴ': 'zha', 'റ': 'ra',
  'ൽ': 'l', 'ൻ': 'n', 'ർ': 'r', 'ൺ': 'n', 'ക്ട്': 'kt'
};

const malayalamVowelSigns = {
  'ാ': 'aa', 'ി': 'i', 'ീ': 'ee', 'ു': 'u', 'ൂ': 'oo', 'ൃ': 'ri',
  'െ': 'e', 'േ': 'ae', 'ൈ': 'ai', 'ൊ': 'o', 'ോ': 'oe', 'ൌ': 'au'
};

function transliterateMalayalam(text) {
  let result = '';
  let i = 0;
  while (i < text.length) {
    const char = text[i];
    if (malayalamConsonants[char]) {
      let base = malayalamConsonants[char];
      const nextChar = text[i + 1];
      if (nextChar === '്') {
        result += base.slice(0, -1);
        i += 2;
      } else if (malayalamVowelSigns[nextChar]) {
        result += base.slice(0, -1) + malayalamVowelSigns[nextChar];
        i += 2;
      } else {
        result += base;
        i += 1;
      }
    } else if (malayalamVowels[char]) {
      result += malayalamVowels[char];
      i += 1;
    } else {
      result += char;
      i += 1;
    }
  }
  return result;
}

/**
 * Speak bot response using browser SpeechSynthesis with dual-layered native and transliterated fallback support
 * @param {string} text - Message content to speak
 * @param {string} detectedLang - Language: "English", "Tamil", or "Malayalam"
 */
export function speakResponse(text, detectedLang) {
  if (!synthesisEnabled || !('speechSynthesis' in window)) return;

  // Clear previous audio
  stopSpeaking();

  // Strip Markdown / HTML formatting before speaking
  const plainText = text
    .replace(/[#*`_\[\]()]/g, '') // strip markdown
    .replace(/<\/?[^>]+(>|$)/g, ""); // strip html

  // Force retrieve fresh available voices list
  if ('speechSynthesis' in window) {
    voicesList = window.speechSynthesis.getVoices();
  }

  // Auto-select correct voice locale
  let targetLocale = 'en-US';
  if (detectedLang === 'Tamil') {
    targetLocale = 'ta-IN';
  } else if (detectedLang === 'Malayalam') {
    targetLocale = 'ml-IN';
  }

  // Look for a native voice matching the locale code or name
  let matchedVoice = voicesList.find(voice => {
    const vlang = voice.lang.toLowerCase().replace('_', '-');
    return vlang === targetLocale.toLowerCase() ||
           vlang.startsWith(targetLocale.split('-')[0]) ||
           voice.name.toLowerCase().includes(detectedLang.toLowerCase());
  });

  let modeLabel = '';
  let finalSpokenText = plainText;

  if (detectedLang === 'Tamil' || detectedLang === 'Malayalam') {
    if (matchedVoice) {
      modeLabel = 'Native';
    } else {
      // Compatibility Fallback mode: Translating regional script into phonetic English syllable strings
      modeLabel = 'Compatibility';
      if (detectedLang === 'Tamil') {
        finalSpokenText = transliterateTamil(plainText);
      } else if (detectedLang === 'Malayalam') {
        finalSpokenText = transliterateMalayalam(plainText);
      }
      // Set to English to read out the romanized script phonetically
      targetLocale = 'en-US';
      matchedVoice = voicesList.find(voice => {
        const vlang = voice.lang.toLowerCase().replace('_', '-');
        return vlang === 'en-us' || vlang.startsWith('en');
      });
    }
  }

  currentUtterance = new SpeechSynthesisUtterance(finalSpokenText);
  currentUtterance.lang = targetLocale;

  if (matchedVoice) {
    currentUtterance.voice = matchedVoice;
  }

  // Anchor to window scope to prevent browser premature garbage collection
  window._polyTalkActiveUtterance = currentUtterance;

  // Adjust vocal rhythm and speech speed
  if (detectedLang === 'Tamil' || detectedLang === 'Malayalam') {
    if (modeLabel === 'Native') {
      currentUtterance.rate = 0.95; // Slightly slower for native flow
      currentUtterance.pitch = 1.05; // Friendly pitch
    } else {
      // Slower speed for the English engine to pronounce phonetic words accurately
      currentUtterance.rate = 0.85; 
      currentUtterance.pitch = 1.0;
    }
  } else {
    currentUtterance.rate = 1.0;
    currentUtterance.pitch = 1.0;
  }

  // Synthesis playback event hooks
  const synthBar = document.getElementById('voice-synthesis-bar');
  const barText = document.getElementById('voice-bar-text');

  currentUtterance.onstart = () => {
    if (synthBar) synthBar.classList.remove('hidden');
    if (barText) {
      const suffix = modeLabel ? ` - ${modeLabel} Mode` : '';
      barText.textContent = `Speaking (${detectedLang}${suffix})...`;
    }
  };

  currentUtterance.onend = () => {
    if (synthBar) synthBar.classList.add('hidden');
    currentUtterance = null;
    window._polyTalkActiveUtterance = null;
  };

  currentUtterance.onerror = (e) => {
    if (e.error === 'interrupted' || e.error === 'canceled') {
      console.log('Synthesis speech stopped or interrupted.');
    } else {
      console.error('Synthesis error:', e.error || e);
    }
    if (synthBar) synthBar.classList.add('hidden');
    currentUtterance = null;
    window._polyTalkActiveUtterance = null;
  };

  // Safe timeout call to prevent collision with immediate preceding speechSynthesis.cancel()
  setTimeout(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.speak(currentUtterance);
    }
  }, 20);
}

export function stopSpeaking() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  const synthBar = document.getElementById('voice-synthesis-bar');
  if (synthBar) synthBar.classList.add('hidden');
  currentUtterance = null;
}

export function pauseSpeaking() {
  if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
    window.speechSynthesis.pause();
    const barText = document.getElementById('voice-bar-text');
    if (barText) barText.textContent = `Vocal Output Paused`;
    playSound('click');
  }
}

export function resumeSpeaking() {
  if ('speechSynthesis' in window && window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
    const barText = document.getElementById('voice-bar-text');
    if (barText) barText.textContent = `Resuming voice...`;
    playSound('click');
  }
}

// UI helper to show notification banners
export function showToast(message) {
  const toast = document.getElementById('alert-toast');
  const toastMsg = document.getElementById('toast-message');
  if (!toast || !toastMsg) return;
  
  toastMsg.textContent = message;
  toast.classList.remove('translate-x-80', 'opacity-0');
  toast.classList.add('translate-x-0', 'opacity-100');
  
  setTimeout(() => {
    toast.classList.remove('translate-x-0', 'opacity-100');
    toast.classList.add('translate-x-80', 'opacity-0');
  }, 4000);
}

// Toggle overall read-aloud TTS status via button
export function setSponsorshipTTS(enabled) {
  synthesisEnabled = enabled;
  const slider = document.getElementById('tts-toggle-slider');
  const button = document.getElementById('tts-toggle-btn');
  
  if (synthesisEnabled) {
    slider.classList.remove('translate-x-0');
    slider.classList.add('translate-x-4');
    button.classList.add('bg-purple-600');
    button.classList.remove('bg-slate-700');
    showToast("Voice Synthesis Enabled");
  } else {
    slider.classList.remove('translate-x-4');
    slider.classList.add('translate-x-0');
    button.classList.add('bg-slate-700');
    button.classList.remove('bg-purple-600');
    stopSpeaking();
    showToast("Muted Voice Synthesis");
  }
}

// Set initial controls
document.addEventListener('DOMContentLoaded', () => {
  const ttsToggleBtn = document.getElementById('tts-toggle-btn');
  if (ttsToggleBtn) {
    ttsToggleBtn.addEventListener('click', () => {
      setSponsorshipTTS(!synthesisEnabled);
      playSound('click');
    });
  }

  // Voice controllers
  const pauseBtn = document.getElementById('voice-pause-btn');
  const stopBtn = document.getElementById('voice-stop-btn');
  
  if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
      if ('speechSynthesis' in window) {
        if (window.speechSynthesis.paused) {
          resumeSpeaking();
          pauseBtn.innerHTML = '<i data-lucide="pause" class="w-3.5 h-3.5"></i>';
        } else {
          pauseSpeaking();
          pauseBtn.innerHTML = '<i data-lucide="play" class="w-3.5 h-3.5"></i>';
        }
        if (window.lucide) window.lucide.createIcons();
      }
    });
  }

  if (stopBtn) {
    stopBtn.addEventListener('click', () => {
      stopSpeaking();
      playSound('click');
    });
  }
});
