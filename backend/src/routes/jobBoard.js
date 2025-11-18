import express from 'express';
import jobBoardService from '../services/jobBoardService.js';
import { protect as auth } from '../middleware/auth.js';

const router = express.Router();

// Search jobs from multiple sources
router.get('/search', auth, async (req, res) => {
  try {
    const { query, location, sources, limit } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const sourcesArray = sources ? sources.split(',') : ['indeed'];
    const jobLimit = parseInt(limit) || 25;

    const result = await jobBoardService.searchJobs(
      query,
      location || '',
      sourcesArray,
      jobLimit
    );

    res.json(result);
  } catch (error) {
    console.error('Job search error:', error);
    res.status(500).json({ error: 'Failed to search jobs' });
  }
});

// Get LinkedIn authorization URL
router.get('/linkedin/auth-url', auth, (req, res) => {
  try {
    const redirectUri = `${process.env.FRONTEND_URL}/job-integration/callback`;
    const authUrl = jobBoardService.getLinkedInAuthUrl(redirectUri);
    res.json({ authUrl });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate LinkedIn auth URL' });
  }
});

// Handle LinkedIn OAuth callback
router.post('/linkedin/callback', auth, async (req, res) => {
  try {
    const { code } = req.body;
    const redirectUri = `${process.env.FRONTEND_URL}/job-integration/callback`;
    
    const result = await jobBoardService.getLinkedInAccessToken(code, redirectUri);
    
    if (result.success) {
      // Store token in user profile or session
      res.json({ success: true, message: 'LinkedIn connected successfully' });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to connect LinkedIn' });
  }
});

export default router;