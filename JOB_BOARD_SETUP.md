# Job Board Integration Setup Guide

## Overview
The Job Board feature allows users to search for relevant jobs from multiple job boards (Indeed, LinkedIn) directly within PrepForge. This helps users find positions to prepare for.

## API Keys Required

### 1. Indeed Publisher ID
1. Visit [Indeed Publisher Portal](https://ads.indeed.com/jobroll)
2. Sign up for a publisher account
3. Get your Publisher ID from the dashboard
4. Add to `.env`: `INDEED_PUBLISHER_ID=your-publisher-id`

### 2. LinkedIn API (Optional - for LinkedIn Jobs)
1. Visit [LinkedIn Developer Portal](https://developer.linkedin.com/)
2. Create a new app
3. Get Client ID and Client Secret
4. Add to `.env`:
   ```
   LINKEDIN_CLIENT_ID=your-client-id
   LINKEDIN_CLIENT_SECRET=your-client-secret
   ```

### 3. RapidAPI (For LinkedIn Jobs Alternative)
1. Visit [RapidAPI](https://rapidapi.com/)
2. Subscribe to "LinkedIn Jobs Search" API
3. Get your RapidAPI key
4. Update `jobBoardService.js` with your key

## Features Implemented

### Backend
- ✅ Job search service with Indeed API integration
- ✅ LinkedIn OAuth flow setup
- ✅ Combined job search from multiple sources
- ✅ RESTful API endpoints for job operations
- ✅ Authentication middleware integration

### Frontend
- ✅ Job Board page with search interface
- ✅ Multi-source job search (Indeed, LinkedIn)
- ✅ Responsive job results display
- ✅ External job link integration
- ✅ Mobile-friendly design
- ✅ Navigation integration

## API Endpoints

### Job Search
- `GET /api/job-board/search` - Search jobs across platforms
  - Query params: `query`, `location`, `sources`, `limit`

### LinkedIn Integration
- `GET /api/job-board/linkedin/auth-url` - Get LinkedIn OAuth URL
- `POST /api/job-board/linkedin/callback` - Handle OAuth callback

## Usage

1. Navigate to "Jobs" in the sidebar
2. Enter job title/keywords and location
3. Select job sources (Indeed, LinkedIn)
4. Click "Search Jobs"
5. Browse results and click "View Job" to apply

## Configuration

Update your `.env` file:
```env
# Job Board Integration
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret
INDEED_PUBLISHER_ID=your-indeed-publisher-id
```

## Testing

1. Start the backend server
2. Navigate to `/job-board` in the frontend
3. Search for "Software Engineer" in "New York"
4. Verify job results are displayed correctly

## Future Enhancements

- [ ] Save favorite jobs
- [ ] Job application tracking
- [ ] Email job alerts
- [ ] Company research integration
- [ ] Salary information display
- [ ] Job matching based on user profile

## Troubleshooting

### Common Issues
1. **No jobs found**: Check API keys are correctly set
2. **CORS errors**: Ensure frontend URL is in CORS whitelist
3. **Rate limiting**: Indeed API has rate limits, implement caching if needed

### API Limits
- Indeed: 1000 queries per month (free tier)
- LinkedIn: Varies by app approval status
- RapidAPI: Based on subscription plan

## Support

For issues with job board integration, check:
1. API key validity
2. Network connectivity
3. Rate limit status
4. Console logs for detailed errors