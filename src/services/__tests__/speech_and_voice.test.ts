import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  getBcp47LanguageTag,
  convertGurmukhiToDevanagari,
  convertBengaliToDevanagari,
  convertGujaratiToDevanagari,
  resolveDoctorVoice,
  createSpeechRecognizer,
  SpeechRecognitionResultHandler
} from '../speechService.js';

describe('Speech, Voice & Audio Life Cycle Verification', () => {
  it('1. Correctly maps all 12 supported Indic languages & English to BCP-47 tags', () => {
    assert.strictEqual(getBcp47LanguageTag('hi'), 'hi-IN');
    assert.strictEqual(getBcp47LanguageTag('pa'), 'pa-IN');
    assert.strictEqual(getBcp47LanguageTag('bn'), 'bn-IN');
    assert.strictEqual(getBcp47LanguageTag('ta'), 'ta-IN');
    assert.strictEqual(getBcp47LanguageTag('te'), 'te-IN');
    assert.strictEqual(getBcp47LanguageTag('mr'), 'mr-IN');
    assert.strictEqual(getBcp47LanguageTag('gu'), 'gu-IN');
    assert.strictEqual(getBcp47LanguageTag('kn'), 'kn-IN');
    assert.strictEqual(getBcp47LanguageTag('ml'), 'ml-IN');
    assert.strictEqual(getBcp47LanguageTag('or'), 'or-IN');
    assert.strictEqual(getBcp47LanguageTag('ur'), 'ur-IN');
    assert.strictEqual(getBcp47LanguageTag('en'), 'en-IN');
    // Aliases
    assert.strictEqual(getBcp47LanguageTag('hinglish'), 'hi-IN');
    assert.strictEqual(getBcp47LanguageTag('bhojpuri'), 'hi-IN');
  });

  it('2. Gurmukhi to Devanagari transliteration produces phonetically equivalent Hindi text for TTS fallback', () => {
    // "ਮੈਨੂੰ ਦਰਦ ਹੈ" (I have pain)
    const punjabiSample = 'ਮੈਨੂੰ ਦਰਦ ਹੈ';
    const devanagariPhonetic = convertGurmukhiToDevanagari(punjabiSample);
    
    assert.ok(devanagariPhonetic.length > 0);
    // Gurmukhi unicode range is 0x0A00 - 0x0A7F.
    // Devanagari unicode range is 0x0900 - 0x097F.
    // Ensure all Gurmukhi characters are converted to Devanagari
    const remainingGurmukhi = /[\u0A00-\u0A7F]/.test(devanagariPhonetic);
    assert.strictEqual(remainingGurmukhi, false, 'Should not contain remaining Gurmukhi glyphs after transliteration');
  });

  it('3. Bengali & Gujarati transliterations convert to Devanagari script for shared Indic TTS engines', () => {
    const bengaliSample = 'আমার মাথা ব্যথা করছে'; // My head is aching
    const gujaratiSample = 'મને પેટમાં દુખાવો થાય છે'; // My stomach aches

    const bengaliDeva = convertBengaliToDevanagari(bengaliSample);
    const gujaratiDeva = convertGujaratiToDevanagari(gujaratiSample);

    assert.strictEqual(/[\u0980-\u09FF]/.test(bengaliDeva), false, 'No unmapped Bengali glyphs should remain');
    assert.strictEqual(/[\u0A80-\u0AFF]/.test(gujaratiDeva), false, 'No unmapped Gujarati glyphs should remain');
  });

  it('4. Voice Resolution handles environment gracefully and falls back reliably', () => {
    // In node environment without window, resolveDoctorVoice returns safe fallback
    const result = resolveDoctorVoice('hi-IN', 'female');
    assert.strictEqual(result.voice, null);
    assert.strictEqual(result.targetLang, 'hi-IN');
    assert.strictEqual(result.useDevanagariConversion, false);
  });

  it('5. Speech Recognizer reports helpful error when Web Speech API is absent and directs to touch fallback', () => {
    // Simulate browser window where SpeechRecognition is not installed
    const originalWindow = (global as any).window;
    (global as any).window = {};

    let reportedError = '';
    const handlers: SpeechRecognitionResultHandler = {
      onResult: () => {},
      onError: (err) => { reportedError = err; },
      onEnd: () => {}
    };

    const recognizer = createSpeechRecognizer('hi', handlers);
    assert.strictEqual(recognizer, null, 'Recognizer must be null when browser API unsupported');
    assert.ok(
      reportedError.includes('touch options or type') || reportedError.includes('not supported'),
      'Error message must guide user to touch or text fallback'
    );

    // Restore window
    (global as any).window = originalWindow;
  });

  it('6. Speech Recognizer lifecycle handles start, interim, final transcript, and end events', () => {
    let currentTranscript = '';
    let isFinalReceived = false;
    let endFired = false;

    // Mock SpeechRecognition class
    class MockSpeechRecognition {
      continuous = false;
      interimResults = true;
      lang = '';
      onresult: any = null;
      onerror: any = null;
      onend: any = null;

      start() {}
      stop() {
        if (this.onend) this.onend();
      }
      abort() {
        if (this.onend) this.onend();
      }
    }

    const originalWindow = (global as any).window;
    (global as any).window = {
      SpeechRecognition: MockSpeechRecognition
    };

    const handlers: SpeechRecognitionResultHandler = {
      onResult: (text, isFinal) => {
        currentTranscript = text;
        isFinalReceived = isFinal;
      },
      onError: () => {},
      onEnd: () => {
        endFired = true;
      }
    };

    const recognizer = createSpeechRecognizer('pa', handlers) as any;
    assert.ok(recognizer, 'Recognizer instance created');
    assert.strictEqual(recognizer.lang, 'pa-IN');

    // Simulate interim speech event
    recognizer.onresult({
      resultIndex: 0,
      results: [
        Object.assign([{ transcript: 'ਮੈਨੂੰ ਛਾਤੀ ਵਿੱਚ' }], { isFinal: false })
      ]
    });
    assert.strictEqual(currentTranscript, 'ਮੈਨੂੰ ਛਾਤੀ ਵਿੱਚ');
    assert.strictEqual(isFinalReceived, false);

    // Simulate final speech event
    recognizer.onresult({
      resultIndex: 0,
      results: [
        Object.assign([{ transcript: 'ਮੈਨੂੰ ਛਾਤੀ ਵਿੱਚ ਦਰਦ ਹੈ' }], { isFinal: true })
      ]
    });
    assert.strictEqual(currentTranscript, 'ਮੈਨੂੰ ਛਾਤੀ ਵਿੱਚ ਦਰਦ ਹੈ');
    assert.strictEqual(isFinalReceived, true);

    // End event
    recognizer.stop();
    assert.strictEqual(endFired, true);

    (global as any).window = originalWindow;
  });

  it('7. Native Android App SpeechRecognizer bridge is correctly prioritized when available', () => {
    let nativeStartedLang = '';
    let nativeStopped = false;

    const originalWindow = (global as any).window;
    (global as any).window = {
      AndroidApp: {
        startSpeechRecognition: (lang: string) => {
          nativeStartedLang = lang;
        },
        stopSpeechRecognition: () => {
          nativeStopped = true;
        }
      }
    };

    let receivedText = '';
    const handlers: SpeechRecognitionResultHandler = {
      onResult: (text) => { receivedText = text; },
      onError: () => {},
      onEnd: () => {}
    };

    const recognizer = createSpeechRecognizer('ta', handlers);
    assert.ok(recognizer, 'Android bridge wrapper created');

    recognizer.start();
    assert.strictEqual(nativeStartedLang, 'ta-IN', 'Should start native speech recognition with ta-IN');

    // Simulate bridge callback from Java/Kotlin
    (global as any).window.onAndroidSpeechResult('நெஞ்சு வலி', true);
    assert.strictEqual(receivedText, 'நெஞ்சு வலி');

    recognizer.stop();
    assert.strictEqual(nativeStopped, true);

    (global as any).window = originalWindow;
  });
});
