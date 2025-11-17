import OpenAI from 'openai';
import axios from 'axios';

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

class InterviewWebSocketHandler {
  constructor() {
    this.sessions = new Map();
  }

  handleConnection(socket) {
    const sessionId = this.generateSessionId();
    console.log(`New interview session: ${sessionId}`);

    const session = {
      id: sessionId,
      socket,
      conversationHistory: [],
      isActive: true,
      avatarSessionId: null
    };

    this.sessions.set(sessionId, session);

    socket.on('interview_message', async (data) => {
      try {
        await this.handleMessage(session, data);
      } catch (error) {
        console.error('Socket message error:', error);
        socket.emit('interview_error', { message: 'Processing error' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`Session closed: ${sessionId}`);
      this.sessions.delete(sessionId);
    });

    // Send initial greeting
    this.sendInitialGreeting(session);
  }

  async handleMessage(session, message) {
    switch (message.type) {
      case 'audio_chunk':
        await this.processAudioChunk(session, message.data);
        break;
      case 'start_interview':
        await this.startInterview(session, message.data);
        break;
      default:
        console.log('Unknown message type:', message.type);
    }
  }

  async processAudioChunk(session, audioData) {
    try {
      if (!openai) {
        session.socket.emit('interview_error', { message: 'OpenAI API not configured' });
        return;
      }

      // Convert audio to text using OpenAI Whisper
      const audioBuffer = Buffer.from(audioData, 'base64');
      
      const transcription = await openai.audio.transcriptions.create({
        file: new File([audioBuffer], 'audio.wav', { type: 'audio/wav' }),
        model: 'whisper-1',
      });

      const userText = transcription.text;
      console.log('User said:', userText);

      // Add to conversation history
      session.conversationHistory.push({ role: 'user', content: userText });

      // Generate AI response
      const aiResponse = await this.generateAIResponse(session);
      
      // Convert AI text to speech and avatar
      await this.generateAvatarResponse(session, aiResponse);

    } catch (error) {
      console.error('Audio processing error:', error);
      session.socket.emit('interview_error', { 
        message: 'Failed to process audio' 
      });
    }
  }

  async generateAIResponse(session) {
    if (!openai) {
      const fallbackResponse = "Hello! I'm your AI interviewer. Please tell me about yourself and your experience.";
      session.conversationHistory.push({ role: 'assistant', content: fallbackResponse });
      return fallbackResponse;
    }

    const systemPrompt = "You are an AI interviewer. Ask one question at a time, wait for user response, then continue. Maintain a professional tone. Keep responses concise and engaging.";
    
    const messages = [
      { role: 'system', content: systemPrompt },
      ...session.conversationHistory.slice(-10) // Keep last 10 messages
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages,
      max_tokens: 150,
      temperature: 0.7,
    });

    const aiText = completion.choices[0].message.content;
    session.conversationHistory.push({ role: 'assistant', content: aiText });
    
    return aiText;
  }

  async generateAvatarResponse(session, text) {
    try {
      if (!openai) {
        // Fallback: send text-only response
        session.socket.emit('text_response', {
          text: text
        });
        return;
      }

      // Generate TTS audio
      const ttsResponse = await openai.audio.speech.create({
        model: 'tts-1',
        voice: 'alloy',
        input: text,
      });

      const audioBuffer = Buffer.from(await ttsResponse.arrayBuffer());

      // Send to HeyGen for avatar video generation
      const avatarVideo = await this.generateHeyGenAvatar(text, audioBuffer);
      
      // Send avatar video chunks to client
      session.socket.emit('avatar_response', {
        text: text,
        videoUrl: avatarVideo.videoUrl
      });

    } catch (error) {
      console.error('Avatar generation error:', error);
      // Fallback: send text-only response
      session.socket.emit('text_response', {
        text: text
      });
    }
  }

  async generateHeyGenAvatar(text, audioBuffer) {
    try {
      // HeyGen API integration
      const response = await axios.post('https://api.heygen.com/v2/video/generate', {
        video_inputs: [{
          character: {
            type: 'avatar',
            avatar_id: 'default_avatar', // Use your HeyGen avatar ID
          },
          voice: {
            type: 'audio',
            audio_data: audioBuffer.toString('base64')
          }
        }]
      }, {
        headers: {
          'X-API-Key': process.env.HEYGEN_API_KEY,
          'Content-Type': 'application/json'
        }
      });

      return {
        videoUrl: response.data.data.video_url,
        sessionId: response.data.data.video_id
      };

    } catch (error) {
      console.error('HeyGen API error:', error);
      throw error;
    }
  }

  async sendInitialGreeting(session) {
    const greeting = "Hello! I'm your AI interviewer. I'll be conducting your interview today. Please tell me about yourself to get started.";
    
    try {
      await this.generateAvatarResponse(session, greeting);
    } catch (error) {
      // Fallback to text greeting
      session.socket.emit('text_response', {
        text: greeting
      });
    }
  }

  generateSessionId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}

export default InterviewWebSocketHandler;