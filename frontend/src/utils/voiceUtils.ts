// Enhanced Voice Utilities for AI Interviewer

export interface VoiceConfig {
  rate: number;
  pitch: number;
  volume: number;
  language: string;
}

export class EnhancedVoiceManager {
  private synth: SpeechSynthesis;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private selectedVoice: SpeechSynthesisVoice | null = null;

  constructor() {
    this.synth = window.speechSynthesis;
    this.loadVoices();
  }

  private loadVoices() {
    this.voices = this.synth.getVoices();
    
    if (this.voices.length === 0) {
      // Voices might not be loaded yet
      this.synth.onvoiceschanged = () => {
        this.voices = this.synth.getVoices();
      };
    }
  }

  /**
   * Get the best available voice based on preferences
   */
  getBestVoice(gender: 'male' | 'female' = 'female', language: string = 'en-US'): SpeechSynthesisVoice | null {
    if (this.voices.length === 0) {
      this.loadVoices();
    }

    const preferences = gender === 'female' 
      ? ['Google US English Female', 'Microsoft Zira', 'Samantha', 'Victoria', 'Karen', 'female']
      : ['Google US English Male', 'Microsoft David', 'Alex', 'Daniel', 'Fred', 'male'];

    // Try to find preferred voices
    for (const pref of preferences) {
      const voice = this.voices.find(v => 
        v.name.toLowerCase().includes(pref.toLowerCase()) && 
        v.lang.startsWith(language.split('-')[0])
      );
      if (voice) return voice;
    }

    // Fallback to any voice matching language and gender
    const fallback = this.voices.find(v => 
      v.lang.startsWith(language.split('-')[0]) && 
      v.name.toLowerCase().includes(gender)
    );
    
    if (fallback) return fallback;

    // Last resort: any voice matching language
    return this.voices.find(v => v.lang.startsWith(language.split('-')[0])) || this.voices[0] || null;
  }

  /**
   * Speak text with enhanced configuration
   */
  speak(
    text: string, 
    config: Partial<VoiceConfig> = {},
    callbacks: {
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (error: any) => void;
      onBoundary?: (event: SpeechSynthesisEvent) => void;
    } = {}
  ): void {
    // Cancel any ongoing speech
    this.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set voice
    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }

    // Apply configuration
    utterance.rate = config.rate ?? 0.95;
    utterance.pitch = config.pitch ?? 1.0;
    utterance.volume = config.volume ?? 1.0;
    utterance.lang = config.language ?? 'en-US';

    // Set callbacks
    utterance.onstart = () => callbacks.onStart?.();
    utterance.onend = () => callbacks.onEnd?.();
    utterance.onerror = (error) => callbacks.onError?.(error);
    utterance.onboundary = (event) => callbacks.onBoundary?.(event);

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  /**
   * Speak with word-level timing for better lip-sync
   */
  speakWithTiming(
    text: string,
    config: Partial<VoiceConfig> = {},
    onWordSpoken?: (word: string, index: number) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const words = text.split(/\s+/);
      let wordIndex = 0;

      this.speak(text, config, {
        onStart: () => {
          console.log('Speech started');
        },
        onEnd: () => {
          console.log('Speech ended');
          resolve();
        },
        onError: (error) => {
          console.error('Speech error:', error);
          reject(error);
        },
        onBoundary: (event) => {
          // Word boundary event
          if (event.name === 'word' && wordIndex < words.length) {
            onWordSpoken?.(words[wordIndex], wordIndex);
            wordIndex++;
          }
        }
      });
    });
  }

  /**
   * Cancel current speech
   */
  cancel(): void {
    this.synth.cancel();
    this.currentUtterance = null;
  }

  /**
   * Pause current speech
   */
  pause(): void {
    this.synth.pause();
  }

  /**
   * Resume paused speech
   */
  resume(): void {
    this.synth.resume();
  }

  /**
   * Check if currently speaking
   */
  isSpeaking(): boolean {
    return this.synth.speaking;
  }

  /**
   * Set the voice to use
   */
  setVoice(gender: 'male' | 'female', language: string = 'en-US'): void {
    this.selectedVoice = this.getBestVoice(gender, language);
  }

  /**
   * Get all available voices
   */
  getAvailableVoices(): SpeechSynthesisVoice[] {
    if (this.voices.length === 0) {
      this.loadVoices();
    }
    return this.voices;
  }

  /**
   * Estimate speech duration
   */
  estimateDuration(text: string, rate: number = 0.95): number {
    // Average speaking rate: ~150 words per minute at rate 1.0
    const words = text.split(/\s+/).length;
    const baseWPM = 150;
    const adjustedWPM = baseWPM * rate;
    const minutes = words / adjustedWPM;
    return minutes * 60 * 1000; // Convert to milliseconds
  }

  /**
   * Break text into natural speech chunks
   */
  breakIntoChunks(text: string): string[] {
    // Split by sentences
    return text
      .split(/([.!?]+\s+)/)
      .filter(chunk => chunk.trim().length > 0)
      .map(chunk => chunk.trim());
  }

  /**
   * Add natural pauses to text
   */
  addPauses(text: string): string {
    return text
      .replace(/\./g, '. ')
      .replace(/,/g, ', ')
      .replace(/;/g, '; ')
      .replace(/:/g, ': ')
      .replace(/\?/g, '? ')
      .replace(/!/g, '! ')
      .replace(/\s+/g, ' ')
      .trim();
  }
}

// Singleton instance
export const voiceManager = new EnhancedVoiceManager();

// Helper function for quick speech
export const speak = (
  text: string, 
  gender: 'male' | 'female' = 'female',
  onEnd?: () => void
): void => {
  voiceManager.setVoice(gender);
  voiceManager.speak(text, {}, { onEnd });
};

// Helper function to cancel speech
export const cancelSpeech = (): void => {
  voiceManager.cancel();
};
