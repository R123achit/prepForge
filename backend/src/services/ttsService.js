// Text-to-Speech Service for AI Interviewer
// This service can be extended to use cloud TTS APIs like Google Cloud TTS, Amazon Polly, or ElevenLabs

class TTSService {
  constructor() {
    // Configuration for different TTS providers
    this.providers = {
      browser: true, // Web Speech API (client-side)
      google: process.env.GOOGLE_TTS_API_KEY || null,
      elevenlabs: process.env.ELEVENLABS_API_KEY || null,
    };
  }

  /**
   * Get voice recommendations based on gender and language
   */
  getVoiceRecommendations(gender = 'female', language = 'en-US') {
    const voices = {
      female: {
        'en-US': [
          'Google US English Female',
          'Microsoft Zira Desktop',
          'Samantha',
          'Victoria',
          'Karen',
        ],
        'en-GB': [
          'Google UK English Female',
          'Microsoft Hazel Desktop',
          'Kate',
          'Serena',
        ],
      },
      male: {
        'en-US': [
          'Google US English Male',
          'Microsoft David Desktop',
          'Alex',
          'Daniel',
          'Fred',
        ],
        'en-GB': [
          'Google UK English Male',
          'Microsoft George Desktop',
          'Oliver',
          'Daniel',
        ],
      },
    };

    return voices[gender]?.[language] || voices.female['en-US'];
  }

  /**
   * Generate speech configuration for client-side TTS
   */
  getSpeechConfig(text, options = {}) {
    const {
      gender = 'female',
      rate = 0.95,
      pitch = 1.0,
      volume = 1.0,
      language = 'en-US',
    } = options;

    return {
      text,
      voicePreferences: this.getVoiceRecommendations(gender, language),
      rate,
      pitch,
      volume,
      language,
    };
  }

  /**
   * Generate interview-specific speech patterns
   */
  generateInterviewSpeech(questionText, context = {}) {
    const { isFirstQuestion, isLastQuestion, candidateName } = context;

    let fullText = '';

    if (isFirstQuestion) {
      fullText = `Hello${candidateName ? ` ${candidateName}` : ''}! Let's begin with the first question. ${questionText}`;
    } else if (isLastQuestion) {
      fullText = `Here's our final question. ${questionText}`;
    } else {
      fullText = `Next question. ${questionText}`;
    }

    return fullText;
  }

  /**
   * Generate feedback speech
   */
  generateFeedbackSpeech(evaluation) {
    const { technicalScore, communicationScore, feedback } = evaluation;

    let speechText = '';

    if (technicalScore >= 80) {
      speechText = 'Excellent answer! ';
    } else if (technicalScore >= 60) {
      speechText = 'Good response. ';
    } else {
      speechText = 'Thank you for your answer. ';
    }

    if (feedback) {
      speechText += feedback;
    }

    return speechText;
  }

  /**
   * Generate completion speech
   */
  generateCompletionSpeech(finalFeedback) {
    const { overallScore, technicalAverage, communicationAverage } = finalFeedback;

    let speechText = `Excellent work! We've completed the interview. `;
    speechText += `Your overall score is ${overallScore} percent. `;
    speechText += `You scored ${technicalAverage} percent on technical skills, `;
    speechText += `and ${communicationAverage} percent on communication. `;

    if (overallScore >= 80) {
      speechText += 'Outstanding performance! You demonstrated strong knowledge and excellent communication skills.';
    } else if (overallScore >= 60) {
      speechText += 'Good job! With some practice, you can further improve your interview skills.';
    } else {
      speechText += 'Keep practicing! Focus on the improvement areas mentioned in your feedback.';
    }

    return speechText;
  }

  /**
   * Break text into natural speech chunks for better lip-sync
   */
  breakIntoSpeechChunks(text) {
    // Split by sentences and pauses
    const chunks = text
      .split(/([.!?]+\s+)/)
      .filter(chunk => chunk.trim().length > 0);

    return chunks.map(chunk => ({
      text: chunk.trim(),
      duration: this.estimateDuration(chunk),
    }));
  }

  /**
   * Estimate speech duration (rough calculation)
   */
  estimateDuration(text) {
    // Average speaking rate: ~150 words per minute
    const words = text.split(/\s+/).length;
    const minutes = words / 150;
    return minutes * 60 * 1000; // Convert to milliseconds
  }

  /**
   * Add natural pauses and emphasis to text
   */
  addSpeechMarkup(text, type = 'question') {
    // Add SSML-like markup for better prosody (if using cloud TTS)
    if (type === 'question') {
      // Questions should have rising intonation at the end
      return text.replace(/\?/g, '? <break time="500ms"/>');
    } else if (type === 'feedback') {
      // Feedback should have pauses between points
      return text.replace(/\./g, '. <break time="300ms"/>');
    }
    return text;
  }
}

export default new TTSService();
