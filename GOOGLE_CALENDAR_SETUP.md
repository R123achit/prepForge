# Google Calendar Integration - Production Setup

## ✅ Changes Made

### 1. Removed Demo Mode
- ❌ Removed all demo/mock responses
- ✅ Now uses real Google Calendar API only
- ✅ Proper error handling with detailed messages

### 2. Updated Configuration

**Your Current Credentials:**
```env
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
GOOGLE_REDIRECT_URI=https://prepforge-frontend.vercel.app/calendar/callback
```

### 3. Google Cloud Console Setup Required

⚠️ **IMPORTANT**: You must add the redirect URI to your Google Cloud Console:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or the one with Client ID: 135018093970)
3. Navigate to: **APIs & Services** → **Credentials**
4. Click on your OAuth 2.0 Client ID
5. Under **Authorized redirect URIs**, add:
   - `https://prepforge-frontend.vercel.app/calendar/callback` (Production)
   - `http://localhost:5173/calendar/callback` (Development)
6. Click **Save**

### 4. How It Works Now

#### OAuth Flow:
1. User clicks "Connect Google Calendar"
2. Frontend requests auth URL from backend
3. Backend generates real Google OAuth URL
4. User redirects to Google for authorization
5. Google redirects back to: `https://prepforge-frontend.vercel.app/calendar/callback?code=...`
6. Frontend sends code to backend
7. Backend exchanges code for access token
8. Token saved in MongoDB
9. Calendar integration active!

#### Event Creation:
1. User creates interview (AI or Live)
2. If calendar integration active and auto-sync enabled
3. Backend creates event in Google Calendar via API
4. Event includes:
   - Title: "AI Mock Interview - [Role]" or "Live Interview - [Role]"
   - Description: Interview details + join link
   - Start/End time
   - Location: Interview room URL
   - Reminders: Email (24h) + Popup (15min)

## 🔧 API Endpoints

### Calendar Routes
```
GET  /api/calendar/google/auth-url          - Get OAuth URL
POST /api/calendar/google/callback          - Exchange code for token
GET  /api/calendar/integrations             - Get user's integrations
PUT  /api/calendar/integrations/google/settings - Update settings
DELETE /api/calendar/integrations/google    - Disconnect
POST /api/calendar/create-event             - Create calendar event
POST /api/calendar/check-availability       - Check availability
```

## 🧪 Testing

### Local Development:
1. Update `.env` redirect URI for local testing:
   ```env
   GOOGLE_REDIRECT_URI=http://localhost:5173/calendar/callback
   ```

2. Add to Google Cloud Console authorized redirect URIs:
   ```
   http://localhost:5173/calendar/callback
   ```

3. Start backend: `cd backend && npm run dev`
4. Start frontend: `cd frontend && npm run dev`
5. Navigate to: `http://localhost:5173/calendar-sync`
6. Click "Connect Google Calendar"
7. Complete OAuth flow
8. Test event creation

### Production:
1. Ensure redirect URI is: `https://prepforge-frontend.vercel.app/calendar/callback`
2. Add to Google Cloud Console
3. Deploy backend and frontend
4. Test OAuth flow
5. Verify events appear in Google Calendar

## 🔐 Security

### Token Storage:
- Access tokens encrypted in MongoDB
- Refresh tokens for automatic renewal
- Tokens scoped to calendar access only
- User can disconnect anytime

### Permissions Requested:
- `https://www.googleapis.com/auth/calendar` - Full calendar access
- `https://www.googleapis.com/auth/calendar.events` - Event management

## 📝 User Settings

Users can configure:
- ✅ Auto-sync interviews to calendar
- ✅ Sync AI interviews (on/off)
- ✅ Sync Live interviews (on/off)
- ✅ Reminder time (5min, 15min, 30min, 1hr)

## ❌ Error Handling

### Common Errors:
1. **"Google Calendar API not configured"**
   - Missing CLIENT_ID or CLIENT_SECRET in .env
   - Solution: Add credentials to .env

2. **"Failed to get Google access token"**
   - Invalid authorization code
   - Redirect URI mismatch
   - Solution: Check Google Cloud Console redirect URIs

3. **"Failed to create Google Calendar event"**
   - Invalid or expired access token
   - Insufficient permissions
   - Solution: Reconnect calendar integration

4. **"redirect_uri_mismatch"**
   - Redirect URI not authorized in Google Cloud Console
   - Solution: Add URI to authorized list

## 🚀 Next Steps

1. ✅ Add redirect URIs to Google Cloud Console
2. ✅ Test OAuth flow in development
3. ✅ Test event creation
4. ✅ Deploy to production
5. ✅ Test production OAuth flow
6. ✅ Monitor for errors

## 📊 Monitoring

Check backend logs for:
- OAuth errors: `Google OAuth Error:`
- Event creation errors: `Google Calendar Event Error:`
- Availability check errors: `Google Availability Error:`

## 🔄 Token Refresh

The system automatically refreshes expired tokens using the refresh token. If refresh fails, user must reconnect their calendar.

## 📞 Support

If issues persist:
1. Check Google Cloud Console quota limits
2. Verify API is enabled
3. Check OAuth consent screen configuration
4. Review backend logs for detailed errors

---

**Status**: ✅ Production Ready (after adding redirect URIs to Google Cloud Console)
