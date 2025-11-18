import axios from 'axios';

class CalendarService {
  constructor() {
    // Don't load env vars in constructor - they may not be loaded yet
  }

  // Lazy-load credentials when needed
  get googleClientId() {
    return process.env.GOOGLE_CLIENT_ID;
  }

  get googleClientSecret() {
    return process.env.GOOGLE_CLIENT_SECRET;
  }

  get googleRedirectUri() {
    return process.env.GOOGLE_REDIRECT_URI || `${process.env.FRONTEND_URL}/calendar/callback`;
  }

  // Google Calendar Integration
  getGoogleAuthUrl() {
    if (!this.googleClientId || !this.googleClientSecret) {
      throw new Error('Google Calendar API credentials not configured');
    }

    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events'
    ].join(' ');

    return `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${this.googleClientId}&` +
      `redirect_uri=${encodeURIComponent(this.googleRedirectUri)}&` +
      `scope=${encodeURIComponent(scopes)}&` +
      `response_type=code&` +
      `access_type=offline&` +
      `prompt=consent&` +
      `state=google-calendar`;
  }

  async getGoogleAccessToken(code) {
    try {
      if (!this.googleClientId || !this.googleClientSecret) {
        return { success: false, error: 'Google Calendar API not configured' };
      }

      const response = await axios.post('https://oauth2.googleapis.com/token', {
        client_id: this.googleClientId,
        client_secret: this.googleClientSecret,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: this.googleRedirectUri
      });

      return { success: true, tokens: response.data };
    } catch (error) {
      console.error('Google OAuth Error:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.error_description || 'Failed to get Google access token' 
      };
    }
  }

  async createGoogleEvent(accessToken, eventData) {
    try {
      if (!this.googleClientId || !this.googleClientSecret) {
        return { success: false, error: 'Google Calendar API not configured' };
      }

      const response = await axios.post(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events',
        {
          summary: eventData.title,
          description: eventData.description,
          start: {
            dateTime: eventData.startTime,
            timeZone: eventData.timeZone || 'UTC'
          },
          end: {
            dateTime: eventData.endTime,
            timeZone: eventData.timeZone || 'UTC'
          },
          location: eventData.location,
          attendees: eventData.attendees?.map(email => ({ email })),
          reminders: {
            useDefault: false,
            overrides: [
              { method: 'email', minutes: 24 * 60 },
              { method: 'popup', minutes: 15 }
            ]
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return { success: true, event: response.data };
    } catch (error) {
      console.error('Google Calendar Event Error:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.error?.message || 'Failed to create Google Calendar event' 
      };
    }
  }

  // Check availability
  async checkGoogleAvailability(accessToken, startTime, endTime) {
    try {
      if (!this.googleClientId || !this.googleClientSecret) {
        return { success: false, error: 'Google Calendar API not configured' };
      }

      const response = await axios.post(
        'https://www.googleapis.com/calendar/v3/freeBusy',
        {
          timeMin: startTime,
          timeMax: endTime,
          items: [{ id: 'primary' }]
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const busy = response.data.calendars?.primary?.busy || [];
      return { success: true, available: busy.length === 0, busyTimes: busy };
    } catch (error) {
      console.error('Google Availability Error:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.error?.message || 'Failed to check availability' 
      };
    }
  }

  // Generate calendar event data for interviews
  generateInterviewEvent(interview, type = 'ai') {
    const startTime = new Date(interview.scheduledAt || Date.now());
    const endTime = new Date(startTime.getTime() + (60 * 60 * 1000)); // 1 hour duration

    const eventData = {
      title: type === 'ai' 
        ? `AI Mock Interview - ${interview.jobRole || 'General'}` 
        : `Live Interview - ${interview.jobRole || 'General'}`,
      description: type === 'ai'
        ? `PrepForge AI Interview Practice Session\n\nJob Role: ${interview.jobRole}\nDifficulty: ${interview.difficulty}\n\nJoin: ${process.env.FRONTEND_URL}/ai-interview/${interview._id}`
        : `PrepForge Live Interview Session\n\nJob Role: ${interview.jobRole}\nInterviewer: ${interview.interviewer?.firstName} ${interview.interviewer?.lastName}\n\nJoin: ${process.env.FRONTEND_URL}/interview-room/${interview.roomId}`,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      location: type === 'ai' 
        ? `${process.env.FRONTEND_URL}/ai-interview/${interview._id}`
        : `${process.env.FRONTEND_URL}/interview-room/${interview.roomId}`,
      attendees: type === 'live' && interview.interviewer?.email 
        ? [interview.interviewer.email] 
        : [],
      timeZone: 'UTC'
    };

    return eventData;
  }
}

export default new CalendarService();