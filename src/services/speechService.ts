// Voice, Speech & Accessibility Sound Service for OPD Intake Kiosk
// Optimized for Human-like Doctor Consultation Experience & Helping Audio

let cachedVoices: SpeechSynthesisVoice[] = [];
let audioContextInstance: AudioContext | null = null;
let activeUtterance: SpeechSynthesisUtterance | null = null;
let keepAliveInterval: any = null;
let isAudioUnlocked = false;
let activeEngineLanguage: string = 'hi-IN';
type VoiceReloadListener = (voices: SpeechSynthesisVoice[], lang: string) => void;
let voiceReloadListeners: VoiceReloadListener[] = [];

// Universal AudioContext Initializer with Auto-Resume
export function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  
  try {
    if (!audioContextInstance) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        audioContextInstance = new AudioCtx();
      }
    }
    
    if (audioContextInstance && audioContextInstance.state === 'suspended') {
      audioContextInstance.resume().catch(() => {});
    }
    
    return audioContextInstance;
  } catch (e) {
    console.warn('AudioContext initialization note:', e);
    return null;
  }
}

// User-gesture unlocker: unlocks AudioContext and SpeechSynthesis on first user interaction
export function unlockAudioSystem() {
  if (isAudioUnlocked) return;

  try {
    const ctx = getAudioContext();
    if (ctx) {
      if (ctx.state === 'suspended') {
        ctx.resume().then(() => {
          isAudioUnlocked = true;
        }).catch(() => {});
      } else {
        isAudioUnlocked = true;
      }

      // Play an imperceptible micro-silent sound to unlock iOS/Safari/Chrome audio pipeline
      try {
        const buffer = ctx.createBuffer(1, 1, 22050);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start(0);
      } catch (e) {}
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.resume();
    }
  } catch (e) {
    console.warn('Audio system unlock note:', e);
  }
}

// Register global touch/click listeners to unlock audio on first interaction
if (typeof window !== 'undefined') {
  const unlockEvents = ['click', 'touchstart', 'keydown', 'pointerdown'];
  const handleUnlock = () => {
    unlockAudioSystem();
    unlockEvents.forEach(evt => window.removeEventListener(evt, handleUnlock));
  };
  unlockEvents.forEach(evt => window.addEventListener(evt, handleUnlock, { once: true, passive: true }));

  // Load initial browser voices
  if ('speechSynthesis' in window) {
    const loadVoices = () => {
      try {
        const v = window.speechSynthesis.getVoices();
        if (v && v.length > 0) {
          cachedVoices = v;
        }
      } catch (e) {}
    };
    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }
}

/**
 * Dynamically reloads the speech synthesis engine and refreshes available voices.
 * When language code changes (such as switching between Punjabi 'pa', Hindi 'hi', and English 'en'),
 * this flushes any active utterance, halts pending speech, queries the browser/OS speech
 * engine for newly loaded or language-specific voice profiles, re-binds the audio context,
 * and updates the voice resolution pipeline to ensure immediate and accurate voice switching.
 */
export async function reloadVoiceSynthesisEngine(lang?: string): Promise<SpeechSynthesisVoice[]> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return [];
  }

  const targetBcp = getBcp47LanguageTag(lang || activeEngineLanguage);
  activeEngineLanguage = targetBcp;

  // 1. Immediately cancel any active or pending speech to prevent cross-language overlap
  try {
    if (keepAliveInterval) {
      clearInterval(keepAliveInterval);
      keepAliveInterval = null;
    }
    activeUtterance = null;
    window.speechSynthesis.cancel();
    window.speechSynthesis.resume();
  } catch (e) {
    console.warn('[VoiceEngine] Error resetting speech synthesis pipeline:', e);
  }

  // 2. Query fresh voices from browser/OS
  const fetchVoices = (): SpeechSynthesisVoice[] => {
    try {
      const v = window.speechSynthesis.getVoices();
      if (v && v.length > 0) {
        cachedVoices = v;
        return v;
      }
    } catch (e) {}
    return cachedVoices;
  };

  let voices = fetchVoices();

  // If voices are empty (e.g. initial cold load in Chrome / Android WebView), wait for voiceschanged
  if (!voices || voices.length === 0) {
    voices = await new Promise<SpeechSynthesisVoice[]>((resolve) => {
      let resolved = false;
      const timer = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          resolve(fetchVoices());
        }
      }, 300);

      const onVoicesReady = () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timer);
          resolve(fetchVoices());
        }
      };

      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = onVoicesReady;
      } else {
        window.speechSynthesis.addEventListener('voiceschanged', onVoicesReady, { once: true });
      }
    });
  }

  // 3. Pre-resolve voice for target language
  const resolved = resolveDoctorVoice(targetBcp);
  if (resolved.voice) {
    console.log(`[VoiceEngine] Successfully loaded voice for ${targetBcp}: ${resolved.voice.name} (${resolved.voice.lang})`);
  } else {
    console.log(`[VoiceEngine] Using cloud/system fallback for ${targetBcp} (Devanagari fallback: ${resolved.useDevanagariConversion})`);
  }

  // 4. Notify listeners
  voiceReloadListeners.forEach(listener => {
    try {
      listener(voices, targetBcp);
    } catch (err) {}
  });

  return voices;
}

export function getActiveVoiceEngineLanguage(): string {
  return activeEngineLanguage;
}

export function onVoiceEngineReloaded(listener: (voices: SpeechSynthesisVoice[], lang: string) => void): () => void {
  voiceReloadListeners.push(listener);
  return () => {
    voiceReloadListeners = voiceReloadListeners.filter(l => l !== listener);
  };
}

export type DoctorVoiceGender = 'female' | 'male' | 'auto';

export interface DoctorSpeechOptions {
  lang?: string;
  gender?: DoctorVoiceGender;
  rate?: number;
  pitch?: number;
  playChime?: boolean;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

// 1. Gentle Doctor Consultation Stethoscope Chime (D5 -> E5 -> A5)
export function playDoctorChime(): Promise<void> {
  return new Promise((resolve) => {
    try {
      const ctx = getAudioContext();
      if (!ctx) {
        resolve();
        return;
      }

      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.12); // E5

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880.00, now + 0.06); // A5

      gainNode.gain.setValueAtTime(0.0001, now);
      gainNode.gain.linearRampToValueAtTime(0.12, now + 0.04);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now + 0.06);
      osc1.stop(now + 0.35);
      osc2.stop(now + 0.35);

      setTimeout(() => {
        resolve();
      }, 350);
    } catch (e) {
      resolve();
    }
  });
}

// 2. Helping Interactive Touch Feedback (Subtle clean soft tap + Native Haptic)
export function playTouchFeedback(): void {
  // Trigger Android native tactile vibration
  try {
    if (typeof (window as any).AndroidApp?.performHapticFeedback === 'function') {
      (window as any).AndroidApp.performHapticFeedback();
    } else if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10);
    }
  } catch (e) {}

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(700, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  } catch (e) {}
}

// 3. Helping Success / Confirmation Sound (C5 -> G5 Harmonious Chime)
export function playSuccessChime(): Promise<void> {
  try {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([25, 40, 25]);
    }
  } catch (e) {}

  return new Promise((resolve) => {
    try {
      const ctx = getAudioContext();
      if (!ctx) {
        resolve();
        return;
      }

      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc1.frequency.setValueAtTime(659.25, now + 0.1); // E5

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(783.99, now + 0.1); // G5
      osc2.frequency.setValueAtTime(1046.50, now + 0.2); // C6

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.1, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now + 0.1);
      osc1.stop(now + 0.45);
      osc2.stop(now + 0.45);

      setTimeout(resolve, 450);
    } catch (e) {
      resolve();
    }
  });
}

// 4. Helping Microphone Activation Sound (Ascending double pip)
export function playMicPromptSound(): Promise<void> {
  return new Promise((resolve) => {
    try {
      const ctx = getAudioContext();
      if (!ctx) {
        resolve();
        return;
      }

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(660, now);
      osc.frequency.setValueAtTime(880, now + 0.08);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);

      setTimeout(resolve, 200);
    } catch (e) {
      resolve();
    }
  });
}

// 5. Helping Alert / Attention Sound (Clinical Soft Double Warning)
export function playAlertChime(): Promise<void> {
  return new Promise((resolve) => {
    try {
      const ctx = getAudioContext();
      if (!ctx) {
        resolve();
        return;
      }

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.setValueAtTime(440, now + 0.15);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.09, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);

      setTimeout(resolve, 350);
    } catch (e) {
      resolve();
    }
  });
}

export function getBcp47LanguageTag(lang: string = 'hi'): string {
  const l = (lang || 'hi').toLowerCase().trim();
  if (l === 'hi' || l === 'hinglish' || l === 'bho' || l === 'bhojpuri' || l.startsWith('hi')) return 'hi-IN';
  if (l === 'en' || l.startsWith('en')) return 'en-IN';
  if (l === 'pa' || l.startsWith('pa')) return 'pa-IN';
  if (l === 'bn' || l.startsWith('bn')) return 'bn-IN';
  if (l === 'ta' || l.startsWith('ta')) return 'ta-IN';
  if (l === 'te' || l.startsWith('te')) return 'te-IN';
  if (l === 'mr' || l.startsWith('mr')) return 'mr-IN';
  if (l === 'gu' || l.startsWith('gu')) return 'gu-IN';
  if (l === 'kn' || l.startsWith('kn')) return 'kn-IN';
  if (l === 'ml' || l.startsWith('ml')) return 'ml-IN';
  if (l === 'or' || l.startsWith('or') || l === 'od') return 'or-IN';
  if (l === 'ur' || l.startsWith('ur')) return 'ur-IN';
  return 'hi-IN';
}

/**
 * Transliterates Gurmukhi (Punjabi) unicode text to Devanagari script so that Indic/Hindi TTS engines
 * (e.g. Google हिन्दी, Swara, Lekha) can synthesize Punjabi audio with accurate pronunciation when
 * no dedicated Punjabi voice is installed in the user's browser.
 */
export function convertGurmukhiToDevanagari(text: string): string {
  if (!text) return '';
  return text.replace(/[\u0A00-\u0A7F]/g, ch => {
    const code = ch.charCodeAt(0);
    // Tippi (0x0A70) -> Anusvara (0x0902)
    if (code === 0x0A70) return String.fromCharCode(0x0902);
    // Addak (0x0A71) -> skip
    if (code === 0x0A71) return '';
    // Specific vowels mapping
    if (code === 0x0A05) return 'अ';
    if (code === 0x0A06) return 'आ';
    if (code === 0x0A07) return 'इ';
    if (code === 0x0A08) return 'ई';
    if (code === 0x0A09) return 'उ';
    if (code === 0x0A0A) return 'ऊ';
    if (code === 0x0A0F) return 'ए';
    if (code === 0x0A10) return 'ऐ';
    if (code === 0x0A13) return 'ओ';
    if (code === 0x0A14) return 'औ';
    // Shift ISCII-aligned characters by -0x0100
    const devaCode = code - 0x0100;
    if (devaCode >= 0x0900 && devaCode <= 0x097F) {
      return String.fromCharCode(devaCode);
    }
    return ch;
  });
}

/**
 * Transliterates Bengali unicode text to Devanagari script for Indic TTS fallback
 */
export function convertBengaliToDevanagari(text: string): string {
  if (!text) return '';
  return text.replace(/[\u0980-\u09FF]/g, ch => {
    const code = ch.charCodeAt(0);
    if (code === 0x0981) return String.fromCharCode(0x0901);
    if (code === 0x0982) return String.fromCharCode(0x0902);
    if (code === 0x0983) return String.fromCharCode(0x0903);
    const devaCode = code - 0x0080;
    if (devaCode >= 0x0900 && devaCode <= 0x097F) {
      return String.fromCharCode(devaCode);
    }
    return ch;
  });
}

/**
 * Transliterates Gujarati unicode text to Devanagari script for Indic TTS fallback
 */
export function convertGujaratiToDevanagari(text: string): string {
  if (!text) return '';
  return text.replace(/[\u0A80-\u0AFF]/g, ch => {
    const code = ch.charCodeAt(0);
    const devaCode = code - 0x0180;
    if (devaCode >= 0x0900 && devaCode <= 0x097F) {
      return String.fromCharCode(devaCode);
    }
    return ch;
  });
}

export interface VoiceResolutionResult {
  voice: SpeechSynthesisVoice | null;
  targetLang: string;
  useDevanagariConversion: boolean;
}

export function resolveDoctorVoice(lang: string = 'hi-IN', preferredGender: DoctorVoiceGender = 'auto'): VoiceResolutionResult {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return { voice: null, targetLang: 'hi-IN', useDevanagariConversion: false };
  }

  // Refresh voices dynamically
  try {
    const fresh = window.speechSynthesis.getVoices();
    if (fresh && fresh.length > 0) {
      cachedVoices = fresh;
    }
  } catch (e) {}

  const bcpTag = getBcp47LanguageTag(lang);
  const targetLangPrefix = bcpTag.split('-')[0].toLowerCase();
  const isEnglish = targetLangPrefix === 'en';
  const isPunjabi = targetLangPrefix === 'pa';
  const isHindi = targetLangPrefix === 'hi' || targetLangPrefix === 'bho' || targetLangPrefix === 'hinglish';

  if (!cachedVoices || cachedVoices.length === 0) {
    return { voice: null, targetLang: bcpTag, useDevanagariConversion: false };
  }

  // 1. SPECIFIC & DYNAMIC HANDLING FOR PUNJABI (pa-IN)
  if (isPunjabi) {
    const punjabiVoices = cachedVoices.filter(v => {
      const vLang = (v.lang || '').toLowerCase().replace('_', '-');
      const vName = (v.name || '').toLowerCase();
      return vLang.startsWith('pa') || 
             vName.includes('punjabi') || 
             vName.includes('panjabi') || 
             v.name.includes('ਪੰਜਾਬੀ') ||
             vName.includes('harmohan') ||
             vName.includes('ravneet') ||
             vName.includes('gurmukhi');
    });

    if (punjabiVoices.length > 0) {
      let picked: SpeechSynthesisVoice | null = null;
      if (preferredGender === 'female') {
        picked = punjabiVoices.find(v => /female|ravneet|priya|swara/i.test(v.name)) || null;
      } else if (preferredGender === 'male') {
        picked = punjabiVoices.find(v => /male|harmohan|prabhat|ravi/i.test(v.name)) || null;
      }
      if (!picked) {
        picked = punjabiVoices.find(v => /natural|neural|google|online/i.test(v.name)) || punjabiVoices[0];
      }
      return {
        voice: picked,
        targetLang: 'pa-IN',
        useDevanagariConversion: false
      };
    }

    // High-fidelity fallback for client systems without local Punjabi TTS:
    // Route through high-clarity Hindi Indic voice with Gurmukhi-to-Devanagari phonetic synthesis
    const hindiFallbackVoices = cachedVoices.filter(v => {
      const vLang = (v.lang || '').toLowerCase().replace('_', '-');
      const vName = (v.name || '').toLowerCase();
      return vLang.startsWith('hi') || vName.includes('hindi') || v.name.includes('हिन्दी') || /swara|madhur|lekha|kalpana/i.test(vName);
    });

    if (hindiFallbackVoices.length > 0) {
      let picked: SpeechSynthesisVoice | null = null;
      if (preferredGender === 'female') {
        picked = hindiFallbackVoices.find(v => /female|swara|neerja|heera|kalpana|veena|priya|lekha/i.test(v.name)) || null;
      } else if (preferredGender === 'male') {
        picked = hindiFallbackVoices.find(v => /male|madhur|ravi|prabhat/i.test(v.name)) || null;
      }
      return {
        voice: picked || hindiFallbackVoices[0],
        targetLang: 'hi-IN',
        useDevanagariConversion: true
      };
    }

    return {
      voice: null,
      targetLang: 'pa-IN',
      useDevanagariConversion: false
    };
  }

  // 2. SPECIFIC & DYNAMIC HANDLING FOR HINDI (hi-IN)
  if (isHindi) {
    const hindiVoices = cachedVoices.filter(v => {
      const vLang = (v.lang || '').toLowerCase().replace('_', '-');
      const vName = (v.name || '').toLowerCase();
      return vLang.startsWith('hi') || 
             vName.includes('hindi') || 
             v.name.includes('हिन्दी') ||
             vName.includes('swara') ||
             vName.includes('madhur') ||
             vName.includes('kalpana') ||
             vName.includes('heera') ||
             vName.includes('neerja') ||
             vName.includes('lekha');
    });

    if (hindiVoices.length > 0) {
      let picked: SpeechSynthesisVoice | null = null;
      if (preferredGender === 'female') {
        picked = hindiVoices.find(v => /female|swara|neerja|heera|kalpana|veena|priya|lekha/i.test(v.name)) || null;
      } else if (preferredGender === 'male') {
        picked = hindiVoices.find(v => /male|madhur|ravi|prabhat/i.test(v.name)) || null;
      }
      if (!picked) {
        picked = hindiVoices.find(v => /natural|neural|google|online/i.test(v.name)) || hindiVoices[0];
      }
      return {
        voice: picked,
        targetLang: 'hi-IN',
        useDevanagariConversion: false
      };
    }

    return {
      voice: null,
      targetLang: 'hi-IN',
      useDevanagariConversion: false
    };
  }

  // 3. SPECIFIC & DYNAMIC HANDLING FOR ENGLISH (en-IN / en-US / en-GB)
  if (isEnglish) {
    const englishVoices = cachedVoices.filter(v => {
      const vLang = (v.lang || '').toLowerCase().replace('_', '-');
      return vLang.startsWith('en');
    });

    if (englishVoices.length > 0) {
      // Prioritize Indian English (en-IN) for medical OPD context
      const indianEnVoices = englishVoices.filter(v => {
        const vLang = (v.lang || '').toLowerCase().replace('_', '-');
        const vName = (v.name || '').toLowerCase();
        return vLang.includes('en-in') || vName.includes('india');
      });

      const candidateList = indianEnVoices.length > 0 ? indianEnVoices : englishVoices;
      let picked: SpeechSynthesisVoice | null = null;

      if (preferredGender === 'female') {
        picked = candidateList.find(v => /female|neerja|veena|priya|zira|samantha|kavya|ananya|jenny/i.test(v.name)) || null;
      } else if (preferredGender === 'male') {
        picked = candidateList.find(v => /male|prabhat|rishi|david|george|ravi|guy/i.test(v.name)) || null;
      }
      if (!picked) {
        picked = candidateList.find(v => /natural|neural|google|online/i.test(v.name)) || candidateList[0];
      }

      return {
        voice: picked || candidateList[0],
        targetLang: (picked?.lang || 'en-IN').replace('_', '-'),
        useDevanagariConversion: false
      };
    }

    return {
      voice: null,
      targetLang: 'en-IN',
      useDevanagariConversion: false
    };
  }

  // 4. OTHER INDIC REGIONAL LANGUAGES
  const regionalVoices = cachedVoices.filter(v => {
    const vLang = (v.lang || '').toLowerCase().replace('_', '-');
    const vName = (v.name || '').toLowerCase();
    
    if (targetLangPrefix === 'bn') {
      return vLang.startsWith('bn') || vName.includes('bengali') || vName.includes('bangla') || v.name.includes('বাংলা');
    }
    if (targetLangPrefix === 'mr') {
      return vLang.startsWith('mr') || vName.includes('marathi') || v.name.includes('मराठी');
    }
    if (targetLangPrefix === 'gu') {
      return vLang.startsWith('gu') || vName.includes('gujarati') || v.name.includes('ગુજરાતી');
    }
    if (targetLangPrefix === 'ta') {
      return vLang.startsWith('ta') || vName.includes('tamil') || v.name.includes('தமிழ்');
    }
    if (targetLangPrefix === 'te') {
      return vLang.startsWith('te') || vName.includes('telugu') || v.name.includes('తెలుగు');
    }
    if (targetLangPrefix === 'kn') {
      return vLang.startsWith('kn') || vName.includes('kannada') || v.name.includes('ಕನ್ನಡ');
    }
    if (targetLangPrefix === 'ml') {
      return vLang.startsWith('ml') || vName.includes('malayalam') || v.name.includes('മലയാളം');
    }
    if (targetLangPrefix === 'ur') {
      return vLang.startsWith('ur') || vName.includes('urdu');
    }
    return vLang.startsWith(targetLangPrefix);
  });

  if (regionalVoices.length > 0) {
    let picked: SpeechSynthesisVoice | null = null;
    if (preferredGender === 'female') {
      picked = regionalVoices.find(v => /female|priya|swara|lekha|kavya/i.test(v.name)) || null;
    } else if (preferredGender === 'male') {
      picked = regionalVoices.find(v => /male|ravi|prabhat|madhur/i.test(v.name)) || null;
    }
    if (!picked) {
      picked = regionalVoices.find(v => /natural|neural|google|online/i.test(v.name)) || regionalVoices[0];
    }
    return {
      voice: picked,
      targetLang: bcpTag,
      useDevanagariConversion: false
    };
  }

  // Fallback for Bengali and Gujarati if local voice missing
  const isIndicDevanagariCompatible = ['bn', 'gu', 'mr', 'or'].includes(targetLangPrefix);
  if (isIndicDevanagariCompatible) {
    const hindiVoices = cachedVoices.filter(v => {
      const vLang = (v.lang || '').toLowerCase().replace('_', '-');
      const vName = (v.name || '').toLowerCase();
      return vLang.startsWith('hi') || vName.includes('hindi') || v.name.includes('हिन्दी');
    });

    if (hindiVoices.length > 0) {
      return {
        voice: hindiVoices[0],
        targetLang: 'hi-IN',
        useDevanagariConversion: ['bn', 'gu'].includes(targetLangPrefix)
      };
    }
  }

  return {
    voice: null,
    targetLang: bcpTag,
    useDevanagariConversion: false
  };
}

export function findBestDoctorVoice(lang: string = 'hi-IN', preferredGender: DoctorVoiceGender = 'auto'): SpeechSynthesisVoice | null {
  const result = resolveDoctorVoice(lang, preferredGender);
  return result.voice;
}

export function speakText(
  text: string, 
  lang: string = 'hi-IN', 
  onEnd?: () => void,
  options?: DoctorSpeechOptions
) {
  if (typeof window === 'undefined') {
    if (onEnd) onEnd();
    return;
  }

  unlockAudioSystem();

  const chosenLang = options?.lang || lang;
  const bcpTag = getBcp47LanguageTag(chosenLang);

  // Clean and prepare text language-sensitively
  let cleanedText = text
    .replace(/\(.*?\)/g, '')
    .replace(/SOCRATES/gi, '')
    .replace(/[\*_~#`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const targetLangPrefix = bcpTag.split('-')[0].toLowerCase();
  if (targetLangPrefix === 'pa') {
    cleanedText = cleanedText.replace(/Chief Complaint/gi, 'ਮੁੱਖ ਤਕਲੀਫ');
  } else if (targetLangPrefix === 'hi') {
    cleanedText = cleanedText.replace(/Chief Complaint/gi, 'मुख्य शिकायत');
  } else {
    cleanedText = cleanedText.replace(/Chief Complaint/gi, 'Main symptom');
  }

  if (!cleanedText) {
    if (onEnd) onEnd();
    return;
  }

  // 1. FIRST PRIORITY: Check for Native Android App TextToSpeech Engine
  // Supports window.AndroidApp, window.Android, and window.android bridges
  const androidBridge = (window as any).AndroidApp || (window as any).Android || (window as any).android;
  const isAndroidNativeTts = typeof androidBridge !== 'undefined' && 
                             typeof androidBridge.speak === 'function';

  if (isAndroidNativeTts) {
    const doAndroidSpeak = () => {
      try {
        let isHandled = false;
        const handleDone = () => {
          if (isHandled) return;
          isHandled = true;
          if (onEnd) onEnd();
          if (options?.onEnd) options.onEnd();
        };

        (window as any).onAndroidTtsStart = () => {
          if (options?.onStart) options.onStart();
        };

        (window as any).onAndroidTtsDone = () => {
          handleDone();
        };

        (window as any).onAndroidTtsError = () => {
          handleDone();
        };

        // Safety fallback timer (~280ms per word + 2500ms baseline)
        const wordCount = cleanedText.split(/\s+/).length;
        const fallbackMs = Math.max(3000, wordCount * 280 + 2500);
        setTimeout(() => {
          if (!isHandled) {
            handleDone();
          }
        }, fallbackMs);

        androidBridge.speak(
          cleanedText, 
          bcpTag, 
          options?.pitch || 1.0, 
          options?.rate || 0.92
        );
      } catch (e) {
        console.warn('Native Android TTS invocation failed:', e);
        if (onEnd) onEnd();
        if (options?.onEnd) options.onEnd();
      }
    };

    if (options?.playChime) {
      playDoctorChime().then(() => {
        setTimeout(doAndroidSpeak, 70);
      });
    } else {
      doAndroidSpeak();
    }
    return;
  }

  // 2. Browser Web Speech API fallback
  if (!('speechSynthesis' in window)) {
    if (onEnd) onEnd();
    return;
  }

  const doSpeak = () => {
    try {
      try {
        window.speechSynthesis.resume();
      } catch (e) {}

      const { voice, targetLang, useDevanagariConversion } = resolveDoctorVoice(bcpTag, options?.gender || 'auto');

      let textToSpeak = cleanedText;
      if (useDevanagariConversion) {
        if (targetLangPrefix === 'pa') {
          textToSpeak = convertGurmukhiToDevanagari(cleanedText);
        } else if (targetLangPrefix === 'bn') {
          textToSpeak = convertBengaliToDevanagari(cleanedText);
        } else if (targetLangPrefix === 'gu') {
          textToSpeak = convertGujaratiToDevanagari(cleanedText);
        }
      }

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      activeUtterance = utterance;
      
      utterance.lang = targetLang;
      utterance.rate = options?.rate || 0.92;
      utterance.pitch = options?.pitch || 1.04;
      utterance.volume = 1.0;

      if (voice) {
        utterance.voice = voice;
      }

      let isFinished = false;

      const handleFinish = () => {
        if (isFinished) return;
        isFinished = true;
        activeUtterance = null;
        if (keepAliveInterval) {
          clearInterval(keepAliveInterval);
          keepAliveInterval = null;
        }
        if (onEnd) onEnd();
        if (options?.onEnd) options.onEnd();
      };

      utterance.onstart = () => {
        if (options?.onStart) options.onStart();
        
        // Android keep-alive pulse to prevent Chrome Android from cutting off speech mid-sentence
        keepAliveInterval = setInterval(() => {
          if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            if (window.speechSynthesis.speaking) {
              window.speechSynthesis.pause();
              window.speechSynthesis.resume();
            } else {
              handleFinish();
            }
          }
        }, 8000);
      };

      utterance.onend = () => {
        handleFinish();
      };

      utterance.onerror = (e) => {
        handleFinish();
        if (options?.onError) options.onError(e);
      };

      // Slight timeout for Android Chrome audio thread sync
      setTimeout(() => {
        try {
          window.speechSynthesis.resume();
          window.speechSynthesis.speak(utterance);
        } catch (err) {
          handleFinish();
        }
      }, 40);

    } catch (err) {
      if (onEnd) onEnd();
    }
  };

  const startPipeline = () => {
    if (options?.playChime) {
      playDoctorChime().then(() => {
        setTimeout(doSpeak, 80);
      }).catch(() => {
        doSpeak();
      });
    } else {
      doSpeak();
    }
  };

  // If language code changed or cached voices are empty, dynamically reload engine first!
  const needsReload = bcpTag !== activeEngineLanguage || !cachedVoices || cachedVoices.length === 0;
  if (needsReload) {
    reloadVoiceSynthesisEngine(bcpTag).then(() => {
      startPipeline();
    }).catch(() => {
      startPipeline();
    });
  } else {
    // If not reloading, ensure any stuck previous speech is cleared safely
    try {
      if (keepAliveInterval) {
        clearInterval(keepAliveInterval);
        keepAliveInterval = null;
      }
      if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
        window.speechSynthesis.cancel();
      }
      window.speechSynthesis.resume();
    } catch (e) {}
    startPipeline();
  }
}

export function stopSpeech() {
  if (typeof window !== 'undefined') {
    try {
      const androidBridge = (window as any).AndroidApp || (window as any).Android || (window as any).android;
      if (typeof androidBridge?.stopSpeech === 'function') {
        androidBridge.stopSpeech();
      }
    } catch (e) {}

    if ('speechSynthesis' in window) {
      try {
        if (keepAliveInterval) {
          clearInterval(keepAliveInterval);
          keepAliveInterval = null;
        }
        activeUtterance = null;
        window.speechSynthesis.cancel();
      } catch (e) {}
    }
  }
}

/**
 * Diagnostic & Audio Unblocker for Android devices
 * Wakes up WebAudio Context, unblocks SpeechSynthesis, and plays an audio feedback test
 */
export async function testAndroidAudioAndVoice(lang: string = 'hi-IN'): Promise<{ ok: boolean; message: string }> {
  unlockAudioSystem();
  
  try {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      await ctx.resume();
    }
    
    // Play test stethoscope sound
    await playDoctorChime();

    // Voice announcement
    const testPhrase = lang.startsWith('hi')
      ? 'आवाज प्रणाली सक्रिय है। नमस्ते, अस्पताल सहायता केंद्र में आपका स्वागत है।'
      : 'Sound system active. Welcome to hospital outpatient assistant.';
    
    speakText(testPhrase, lang, undefined, { rate: 0.95, pitch: 1.05 });
    return { ok: true, message: 'Audio and voice unlocked successfully.' };
  } catch (err: any) {
    console.warn('Android audio test note:', err);
    return { ok: false, message: err?.message || 'Audio playback initialization error.' };
  }
}

export interface SpeechRecognitionResultHandler {
  onResult: (transcript: string, isFinal: boolean) => void;
  onError: (error: string) => void;
  onEnd: () => void;
}

export function createSpeechRecognizer(lang: string = 'hi-IN', handlers: SpeechRecognitionResultHandler) {
  // 1. Android Native SpeechRecognizer Bridge
  if (typeof window !== 'undefined' && typeof (window as any).AndroidApp?.startSpeechRecognition === 'function') {
    (window as any).onAndroidSpeechResult = (transcript: string, isFinal: boolean) => {
      handlers.onResult(transcript, isFinal);
    };
    (window as any).onAndroidSpeechError = (errorMsg: string) => {
      handlers.onError(errorMsg);
    };
    (window as any).onAndroidSpeechEnd = () => {
      handlers.onEnd();
    };

    return {
      start: () => {
        try {
          (window as any).AndroidApp.startSpeechRecognition(getBcp47LanguageTag(lang));
        } catch (e) {
          handlers.onError('Unable to start speech recognition');
        }
      },
      stop: () => {
        try {
          (window as any).AndroidApp.stopSpeechRecognition();
        } catch (e) {}
      },
      abort: () => {
        try {
          (window as any).AndroidApp.stopSpeechRecognition();
        } catch (e) {}
      }
    };
  }

  // 2. Web Speech API Recognition for Chrome / Desktop
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    handlers.onError('Speech recognition not supported in this browser. Please use touch options or type.');
    return null;
  }

  try {
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = getBcp47LanguageTag(lang);

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      const current = final || interim;
      handlers.onResult(current, !!final);
    };

    recognition.onerror = (event: any) => {
      handlers.onError(event.error);
    };

    recognition.onend = () => {
      handlers.onEnd();
    };

    return recognition;
  } catch (e) {
    return null;
  }
}

// 6. Doctor Public Announcement (PA / Chime) for calling patient token
export function announcePatientTokenCall(
  tokenNumber: string,
  patientName: string,
  roomNumber: string = 'कमरा नंबर 2',
  language: string = 'hi'
) {
  unlockAudioSystem();
  playDoctorChime().then(() => {
    let callMessage = '';
    const l = (language || 'hi').toLowerCase();
    
    if (l === 'en') {
      callMessage = `Token number ${tokenNumber}, ${patientName}, please proceed to OPD ${roomNumber}.`;
    } else if (l === 'mr') {
      callMessage = `टोकन क्रमांक ${tokenNumber}, ${patientName}, कृपया ओपीडी ${roomNumber} मध्ये या.`;
    } else if (l === 'bn') {
      callMessage = `টোকেন নম্বর ${tokenNumber}, ${patientName}, অনুগ্রহ করে ওপিডি ${roomNumber}-এ আসুন।`;
    } else if (l === 'ta') {
      callMessage = `டோக்கன் எண் ${tokenNumber}, ${patientName}, தயவுசெய்து ${roomNumber}க்கு வாருங்கள்.`;
    } else if (l === 'te') {
      callMessage = `టోకెన్ నంబర్ ${tokenNumber}, ${patientName}, దయచేసి ${roomNumber} వద్దకు రండి.`;
    } else if (l === 'gu') {
      callMessage = `ટોકન નંબર ${tokenNumber}, ${patientName}, કૃપા કરીને ${roomNumber}માં આવો.`;
    } else {
      // Default Hindi
      callMessage = `टोकन नंबर ${tokenNumber}, ${patientName}, कृपया ओपीडी ${roomNumber} में पधारें।`;
    }

    speakText(callMessage, language, undefined, { rate: 0.88, pitch: 1.05 });
  });
}

