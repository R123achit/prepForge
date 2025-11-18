import express from 'express';
import calendarService from '../services/calendarService.js';
import CalendarIntegration from '../models/CalendarIntegration.js';
import { protect as auth } from '../middleware/auth.js';

const router = express.Router();

// Get Google Calendar auth URL
router.get('/google/auth-url', auth, (req, res) => {
  try {
    const authUrl = calendarService.getGoogleAuthUrl();
    res.json({ authUrl });
  } catch (error) {
    console.error('Google auth URL error:', error.message);
    res.status(500).json({ error: error.message || 'Failed to generate Google auth URL' });
  }
});

// Handle Google OAuth callback
router.post('/google/callback', auth, async (req, res) => {
  try {
    const { code } = req.body;
    const result = await calendarService.getGoogleAccessToken(code);
    
    if (result.success) {
      // Save or update calendar integration
      await CalendarIntegration.findOneAndUpdate(
        { userId: req.user.id, provider: 'google' },
        {
          userId: req.user.id,
          provider: 'google',
          accessToken: result.tokens.access_token,
          refreshToken: result.tokens.refresh_token,
          tokenExpiry: new Date(Date.now() + (result.tokens.expires_in * 1000)),
          isActive: true
        },
        { upsert: true, new: true }
      );

      res.json({ success: true, message: 'Google Calendar connected successfully' });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Google callback error:', error);
    res.status(500).json({ error: 'Failed to connect Google Calendar' });
  }
});

// Get user's calendar integrations
router.get('/integrations', auth, async (req, res) => {
  try {
    const integrations = await CalendarIntegration.find({ userId: req.user.id })
      .select('-accessToken -refreshToken');
    
    res.json({ integrations });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch calendar integrations' });
  }
});

// Update calendar integration settings
router.put('/integrations/:provider/settings', auth, async (req, res) => {
  try {
    const { provider } = req.params;
    const { settings } = req.body;

    const integration = await CalendarIntegration.findOneAndUpdate(
      { userId: req.user.id, provider },
      { $set: { settings } },
      { new: true }
    ).select('-accessToken -refreshToken');

    if (!integration) {
      return res.status(404).json({ error: 'Calendar integration not found' });
    }

    res.json({ integration });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Disconnect calendar integration
router.delete('/integrations/:provider', auth, async (req, res) => {
  try {
    const { provider } = req.params;
    
    await CalendarIntegration.findOneAndDelete({
      userId: req.user.id,
      provider
    });

    res.json({ success: true, message: `${provider} calendar disconnected` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to disconnect calendar' });
  }
});

// Create calendar event for interview
router.post('/create-event', auth, async (req, res) => {
  try {
    const { interviewId, interviewType, provider } = req.body;

    const integration = await CalendarIntegration.findOne({
      userId: req.user.id,
      provider,
      isActive: true
    });

    if (!integration) {
      return res.status(404).json({ error: 'Calendar integration not found' });
    }

    // Mock interview data - in real app, fetch from database
    const mockInterview = {
      _id: interviewId,
      jobRole: 'Software Engineer',
      difficulty: 'Medium',
      scheduledAt: new Date(),
      roomId: 'room-123'
    };

    const eventData = calendarService.generateInterviewEvent(mockInterview, interviewType);

    if (provider !== 'google') {
      return res.status(400).json({ error: 'Only Google Calendar is supported' });
    }

    const result = await calendarService.createGoogleEvent(integration.accessToken, eventData);

    if (result.success) {
      res.json({ success: true, event: result.event });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Failed to create calendar event' });
  }
});

// Check availability
router.post('/check-availability', auth, async (req, res) => {
  try {
    const { startTime, endTime, provider } = req.body;

    const integration = await CalendarIntegration.findOne({
      userId: req.user.id,
      provider,
      isActive: true
    });

    if (!integration) {
      return res.status(404).json({ error: 'Calendar integration not found' });
    }

    if (provider !== 'google') {
      return res.status(400).json({ error: 'Only Google Calendar is supported' });
    }

    const result = await calendarService.checkGoogleAvailability(
      integration.accessToken,
      startTime,
      endTime
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to check availability' });
  }
});

export default router;