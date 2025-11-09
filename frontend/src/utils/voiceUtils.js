export class EnhancedVoiceManager {
  constructor() {
    this.synth = window.speechSynthesis;
    this.currentUtterance = null;
    this.voices = [];
    this.selectedVoice = null;
    this.loadVoices();
  }

  loadVoices() {
    this.voices = this.synth.getVoices();
    
    if (this.voices.length === 0) {
      this.synth.onvoiceschanged = () => {
        this.voices = this.synth.getVoices();
      };
    }
  }

  getBestVoice(gender = 'female', language = 'en-US') {
    if (this.voices.length === 0) {
      this.loadVoices();
    }

    const preferences = gender === 'female' 
      ? ['Google US English Female', 'Microsoft Zira', 'Samantha', 'Victoria', 'Karen', 'female']
      : ['Google US English Male', 'Microsoft David', 'Alex', 'Daniel', 'Fred', 'male'];

    for (const pref of preferences) {
      const voice = this.voices.find(v => 
        v.name.toLowerCase().includes(pref.toLowerCase()) && 
        v.lang.startsWith(language.split('-')[0])
      );
      if (voice) return voice;
    }

    const fallback = this.voices.find(v => 
      v.lang.startsWith(language.split('-')[0]) && 
      v.name.toLowerCase().includes(gender)
    );
    
    if (fallback) return fallback;

    return this.voices.find(v => v.lang.startsWith(language.split('-')[0])) || this.voices[0] || null;
  }

  speak(text, config = {}, callbacks = {}) {
    this.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }

    utterance.rate = config.rate ?? 0.95;
    utterance.pitch = config.pitch ?? 1.0;
    utterance.volume = config.volume ?? 1.0;
    utterance.lang = config.language ?? 'en-US';

    utterance.onstart = () => callbacks.onStart?.();
    utterance.onend = () => callbacks.onEnd?.();
    utterance.onerror = (error) => callbacks.onError?.(error);
    utterance.onboundary = (event) => callbacks.onBoundary?.(event);

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  cancel() {
    this.synth.cancel();
    this.currentUtterance = null;
  }

  pause() {
    this.synth.pause();
  }

  resume() {
    this.synth.resume();
  }

  isSpeaking() {
    return this.synth.speaking;
  }

  setVoice(gender, language = 'en-US') {
    this.selectedVoice = this.getBestVoice(gender, language);
  }

  getAvailableVoices() {
    if (this.voices.length === 0) {
      this.loadVoices();
    }
    return this.voices;
  }
}

export const voiceManager = new EnhancedVoiceManager();

export const speak = (text, gender = 'female', onEnd) => {
  voiceManager.setVoice(gender);
  voiceManager.speak(text, {}, { onEnd });
};

export const cancelSpeech = () => {
  voiceManager.cancel();
};
