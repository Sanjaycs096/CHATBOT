/**
 * @file animation.js
 * @description Controls visual enhancements, particle backgrounds, typewriter transitions,
 * preloader sequencing, and synthesized UX sound effects.
 */

// Global audio context for synthesizing futuristic sounds
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

// Synthesize premium UI notification sounds
export function playSound(type) {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    const now = ctx.currentTime;
    
    if (type === 'send') {
      // Crisp high-tech chime
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.15);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === 'receive') {
      // Warm sci-fi double chime
      osc.type = 'sine';
      osc.frequency.setValueAtTime(900, now);
      osc.frequency.setValueAtTime(1100, now + 0.08);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'click') {
      // Tiny mechanical select click
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.05);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'error') {
      // Low digital buzz
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.linearRampToValueAtTime(100, now + 0.3);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    }
  } catch (e) {
    // Audio synthesis context unsupported or blocked by user permissions
  }
}

// Particle Engine (floating ambient bubbles)
function initParticles() {
  const container = document.getElementById('particles-container');
  if (!container) return;
  
  const particleCount = 20;
  for (let i = 0; i < particleCount; i++) {
    createParticle(container);
  }
}

function createParticle(container) {
  const particle = document.createElement('div');
  particle.className = 'particle';
  
  // Random sizes and placements
  const size = Math.random() * 40 + 10;
  particle.style.width = `${size}px`;
  particle.style.height = `${size}px`;
  particle.style.left = `${Math.random() * 100}%`;
  
  // Random delay and duration
  const delay = Math.random() * 10;
  const duration = Math.random() * 15 + 10;
  particle.style.animationDelay = `${delay}s`;
  particle.style.animationDuration = `${duration}s`;
  
  container.appendChild(particle);
}

// Typewriter Effect for Landing Page Subtitle
function initTypewriter() {
  const element = document.getElementById('typewriter-sub');
  if (!element) return;
  
  const strings = [
    'Converse in English naturally...',
    'தமிழில் உரையாடுங்கள்...',
    'മലയാളത്തിൽ സംസാരിക്കൂ...',
    'All-In-One Intelligent Voice & Text Assistant.'
  ];
  
  let stringIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let delay = 100;
  
  function tick() {
    const currentString = strings[stringIndex];
    if (isDeleting) {
      element.textContent = currentString.substring(0, charIndex - 1);
      charIndex--;
      delay = 40;
    } else {
      element.textContent = currentString.substring(0, charIndex + 1);
      charIndex++;
      delay = 80;
    }
    
    if (!isDeleting && charIndex === currentString.length) {
      isDeleting = true;
      delay = 2500; // Hold at the end
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      stringIndex = (stringIndex + 1) % strings.length;
      delay = 500;
    }
    
    setTimeout(tick, delay);
  }
  
  tick();
}

// Fullscreen mode handler
function initFullscreen() {
  const btn = document.getElementById('fullscreen-btn');
  if (!btn) return;
  
  btn.addEventListener('click', () => {
    playSound('click');
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      btn.innerHTML = '<i data-lucide="minimize-2" class="w-4 h-4"></i>';
    } else {
      document.exitFullscreen();
      btn.innerHTML = '<i data-lucide="maximize-2" class="w-4 h-4"></i>';
    }
    if (window.lucide) window.lucide.createIcons();
  });
}

// preloader/loading sequence logic
function runPreloader() {
  const preloader = document.getElementById('preloader');
  if (!preloader) return;
  
  // Step transition timeouts
  setTimeout(() => {
    const step2 = document.getElementById('step-2');
    if (step2) {
      step2.className = 'flex items-center space-x-2 text-purple-400 animate-pulse';
      step2.querySelector('span').className = 'w-2 h-2 rounded-full bg-purple-500 animate-ping';
    }
    const step1 = document.getElementById('step-1');
    if (step1) {
      step1.className = 'flex items-center space-x-2 text-slate-500';
      step1.querySelector('span').className = 'w-2 h-2 rounded-full bg-slate-500';
    }
  }, 900);
  
  setTimeout(() => {
    const step3 = document.getElementById('step-3');
    if (step3) {
      step3.className = 'flex items-center space-x-2 text-purple-400 animate-pulse';
      step3.querySelector('span').className = 'w-2 h-2 rounded-full bg-purple-500 animate-ping';
    }
    const step2 = document.getElementById('step-2');
    if (step2) {
      step2.className = 'flex items-center space-x-2 text-slate-500';
      step2.querySelector('span').className = 'w-2 h-2 rounded-full bg-slate-500';
    }
  }, 1800);
  
  setTimeout(() => {
    preloader.classList.add('opacity-0');
    playSound('receive');
    setTimeout(() => {
      preloader.classList.add('hidden');
    }, 700);
  }, 2700);
}

// Boot setup on DOM load
document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  initTypewriter();
  initFullscreen();
  runPreloader();
});
