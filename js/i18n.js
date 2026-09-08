/**
 * LANDSLIDE SENTINEL AI - Multilingual Internationalization (i18n) & Voice Alert Engine
 * Supports 9 Indian Languages: English, Nepali (Primary Sikkim), Hindi, Bengali,
 * Tamil, Telugu, Kannada, Malayalam, Marathi.
 */

let currentLocale = 'en';
let translations = {};

const SUPPORTED_LANGUAGES = {
  en: { name: 'English', native: 'English', voiceLang: 'en-IN' },
  ne: { name: 'Nepali', native: 'नेपाली (सिक्किम)', voiceLang: 'ne-NP' },
  hi: { name: 'Hindi', native: 'हिन्दी', voiceLang: 'hi-IN' },
  bn: { name: 'Bengali', native: 'বাংলা', voiceLang: 'bn-IN' },
  ta: { name: 'Tamil', native: 'தமிழ்', voiceLang: 'ta-IN' },
  te: { name: 'Telugu', native: 'తెలుగు', voiceLang: 'te-IN' },
  kn: { name: 'Kannada', native: 'ಕನ್ನಡ', voiceLang: 'kn-IN' },
  ml: { name: 'Malayalam', native: 'മലയാളം', voiceLang: 'ml-IN' },
  mr: { name: 'Marathi', native: 'मराठी', voiceLang: 'mr-IN' }
};

export async function initI18n(lang = 'en') {
  currentLocale = lang;
  try {
    const res = await fetch(`./locales/${lang}.json`);
    if (res.ok) {
      translations = await res.json();
    } else {
      console.warn(`[i18n] Failed to load locale ${lang}, falling back to English`);
      const fallback = await fetch('./locales/en.json');
      translations = await fallback.json();
    }
  } catch (err) {
    console.error(`[i18n] Error loading locale ${lang}:`, err);
  }
  applyTranslations();
}

export function setLanguage(lang) {
  if (SUPPORTED_LANGUAGES[lang]) {
    initI18n(lang);
  }
}

export function t(key, defaultText = '') {
  return translations[key] || defaultText || key;
}

export function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[key]) {
      el.textContent = translations[key];
    }
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (translations[key]) {
      el.setAttribute('placeholder', translations[key]);
    }
  });
}

/**
 * Text-to-Speech (TTS) Voice Warning Synthesizer
 * Uses Web Speech API for emergency broadcast
 */
export function speakEmergencyWarning(text, lang = currentLocale) {
  if (!('speechSynthesis' in window)) {
    console.warn('[TTS] Web Speech API not supported on this browser.');
    return;
  }

  window.speechSynthesis.cancel(); // Stop any pending speech

  const utterance = new SpeechSynthesisUtterance(text);
  const voiceConfig = SUPPORTED_LANGUAGES[lang] || SUPPORTED_LANGUAGES['en'];
  utterance.lang = voiceConfig.voiceLang;
  utterance.rate = 0.95; // Slightly slower for clarity in emergencies
  utterance.pitch = 1.0;

  // Find suitable voice if available
  const voices = window.speechSynthesis.getVoices();
  const matchedVoice = voices.find(v => v.lang.startsWith(voiceConfig.voiceLang.split('-')[0]));
  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  window.speechSynthesis.speak(utterance);
}

export function getAvailableLanguages() {
  return SUPPORTED_LANGUAGES;
}
