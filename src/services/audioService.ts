// Safe Web Speech API & HTML5 Dictionary Audio Service for Cambridge CEFR Alignment

export class AudioService {
  private static synth: SpeechSynthesis | null = typeof window !== 'undefined' ? window.speechSynthesis : null;
  private static currentUtterance: SpeechSynthesisUtterance | null = null;
  private static currentAudio: HTMLAudioElement | null = null;

  public static isSpeechSynthesisSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public static isSpeechRecognitionSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
    );
  }

  public static speak(
    text: string,
    options?: {
      rate?: number;
      pitch?: number;
      volume?: number;
      lang?: string;
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (err: any) => void;
    }
  ): void {
    if (typeof window === 'undefined') return;

    this.stop();

    const cleanText = text.trim();
    if (!cleanText) return;

    // Check if cleanText is a single word or short phrase suitable for native dictionary studio recording
    const wordCount = cleanText.split(/\s+/).length;
    const isSingleTerm = wordCount <= 3 && cleanText.length <= 45 && !/[.!?\n]/.test(cleanText);

    if (isSingleTerm) {
      // 1. Primary Engine: High-definition native Oxford / Cambridge pronunciation MP3 stream
      // type=1 for UK English (Cambridge CEFR alignment), type=2 for US
      const accentType = options?.lang?.includes('US') ? '2' : '1';
      const cdnUrl = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(cleanText)}&type=${accentType}`;

      try {
        const audio = new Audio(cdnUrl);
        audio.volume = options?.volume ?? 1.0;
        this.currentAudio = audio;

        let hasEnded = false;
        const cleanup = () => {
          if (this.currentAudio === audio) {
            this.currentAudio = null;
          }
        };

        audio.onplay = () => {
          options?.onStart?.();
        };

        audio.onended = () => {
          if (!hasEnded) {
            hasEnded = true;
            cleanup();
            options?.onEnd?.();
          }
        };

        audio.onerror = () => {
          cleanup();
          // Fall back gracefully to Web Speech API
          this.speakWithSpeechSynthesis(cleanText, options);
        };

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((playErr) => {
            console.warn('[AudioService] Native MP3 playback blocked or failed, falling back to Web Speech API:', playErr);
            cleanup();
            this.speakWithSpeechSynthesis(cleanText, options);
          });
        }
        return;
      } catch (audioInitErr) {
        console.warn('[AudioService] Failed to init native Audio element, using SpeechSynthesis fallback:', audioInitErr);
      }
    }

    // 2. Full Sentence / Fallback Engine: SpeechSynthesis with normalized natural rate = 1.0
    this.speakWithSpeechSynthesis(cleanText, options);
  }

  private static speakWithSpeechSynthesis(
    text: string,
    options?: {
      rate?: number;
      pitch?: number;
      volume?: number;
      lang?: string;
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (err: any) => void;
    }
  ): void {
    if (!this.synth) {
      options?.onError?.(new Error('SpeechSynthesis not supported on this platform.'));
      return;
    }

    try {
      this.synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = options?.lang || 'en-GB';
      // Normalize rate to 1.0 standard natural speech pace (prevent mobile robotic dragging)
      utterance.rate = options?.rate !== undefined ? Math.max(0.85, Math.min(options.rate, 1.5)) : 1.0;
      utterance.pitch = options?.pitch || 1.0;
      utterance.volume = options?.volume ?? 1.0;

      // Select the highest quality natural English voice available on this OS
      const voices = this.synth.getVoices();
      if (voices.length > 0) {
        const targetLang = utterance.lang.toLowerCase();
        const preferredVoice = voices.find(
          (v) =>
            v.lang.toLowerCase().replace('_', '-') === targetLang &&
            (v.name.includes('Natural') ||
              v.name.includes('Google') ||
              v.name.includes('Premium') ||
              v.name.includes('Samantha') ||
              v.name.includes('Daniel') ||
              v.name.includes('Oliver') ||
              v.name.includes('Serena'))
        ) || voices.find((v) => v.lang.toLowerCase().startsWith('en'));

        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }
      }

      utterance.onstart = () => {
        options?.onStart?.();
      };

      utterance.onend = () => {
        this.currentUtterance = null;
        options?.onEnd?.();
      };

      utterance.onerror = (event) => {
        this.currentUtterance = null;
        options?.onError?.(event);
      };

      this.currentUtterance = utterance;
      this.synth.speak(utterance);
    } catch (err) {
      console.warn('Audio playback error:', err);
      options?.onError?.(err);
    }
  }

  public static pause(): void {
    if (this.currentAudio && !this.currentAudio.paused) {
      this.currentAudio.pause();
    }
    if (this.synth && this.synth.speaking) {
      this.synth.pause();
    }
  }

  public static resume(): void {
    if (this.currentAudio && this.currentAudio.paused) {
      this.currentAudio.play().catch(() => {});
    }
    if (this.synth && this.synth.paused) {
      this.synth.resume();
    }
  }

  public static stop(): void {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.src = '';
      } catch {}
      this.currentAudio = null;
    }
    if (this.synth) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
  }

  public static createSpeechRecognizer(callbacks: {
    onResult: (transcript: string, isFinal: boolean) => void;
    onError: (error: string) => void;
    onEnd: () => void;
  }): any | null {
    if (!this.isSpeechRecognitionSupported()) {
      return null;
    }

    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    const recognition = new SpeechRecognitionClass();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

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

      callbacks.onResult(final || interim, Boolean(final));
    };

    recognition.onerror = (event: any) => {
      callbacks.onError(event.error || 'Speech recognition error');
    };

    recognition.onend = () => {
      callbacks.onEnd();
    };

    return recognition;
  }
}
