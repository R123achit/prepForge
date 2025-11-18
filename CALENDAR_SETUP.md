# Calendar Sync Setup Guide

## Overview
The Calendar Sync feature allows users to connect their Google Calendar and Microsoft Outlook calendars to automatically sync interview schedules, set reminders, and check availability.

## API Setup Required

### 1. Google Calendar API Setup

#### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google Calendar API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Calendar API"
   - Click "Enable"

#### Step 2: Create OAuth Credentials
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Configure OAuth consent screen if prompted
4. Choose "Web application"
5. Add authorized redirect URIs:
   - `http://localhost:5173/calendar/callback` (development)
   - `https://yourdomain.com/calendar/callback` (production)
6. Copy Client ID and Client Secret

#### Step 3: Update Environment Variables
```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 2. Microsoft Outlook API Setup

#### Step 1: Register Azure App
1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to "Azure Active Directory" > "App registrations"
3. Click "New registration"
4. Fill in app details:
   - Name: "PrepForge Calendar Integration"
   - Supported account types: "Accounts in any organizational directory and personal Microsoft accounts"
   - Redirect URI: `http://localhost:5173/calendar/callback`

#### Step 2: Configure API Permissions
1. Go to "API permissions"
2. Add permissions:
   - Microsoft Graph > Delegated permissions
   - Add: `Calendars.ReadWrite`, `User.Read`
3. Grant admin consent

#### Step 3: Create Client Secret
1. Go to "Certificates & secrets"
2. Click "New client secret"
3. Copy the secret value immediately

#### Step 4: Update Environment Variables
```env
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
```

## Features Implemented

### Backend
- ✅ Google Calendar OAuth integration
- ✅ Microsoft Outlook OAuth integration
- ✅ Calendar event creation
- ✅ Availability checking
- ✅ Token management and refresh
- ✅ User settings and preferences
- ✅ Database models for calendar integrations

### Frontend
- ✅ Calendar connection interface
- ✅ OAuth flow handling
- ✅ Settings management
- ✅ Test event creation
- ✅ Integration status display
- ✅ Responsive design

## API Endpoints

### Authentication
- `GET /api/calendar/google/auth-url` - Get Google OAuth URL
- `GET /api/calendar/outlook/auth-url` - Get Outlook OAuth URL
- `POST /api/calendar/google/callback` - Handle Google OAuth callback
- `POST /api/calendar/outlook/callback` - Handle Outlook OAuth callback

### Management
- `GET /api/calendar/integrations` - Get user's calendar integrations
- `PUT /api/calendar/integrations/:provider/settings` - Update settings
- `DELETE /api/calendar/integrations/:provider` - Disconnect calendar

### Events
- `POST /api/calendar/create-event` - Create calendar event
- `POST /api/calendar/check-availability` - Check availability

## Usage Flow

### 1. Connect Calendar
1. Navigate to "Calendar" in sidebar (desktop only)
2. Click "Connect Google Calendar" or "Connect Outlook Calendar"
3. Complete OAuth flow in popup window
4. Calendar will show as "Connected"

### 2. Configure Settings
- Toggle auto-sync for interviews
- Set reminder preferences (5min, 15min, 30min, 1hr)
- Choose which interview types to sync

### 3. Test Integration
- Click "Test Event" to create a sample calendar event
- Verify event appears in your calendar app

### 4. Automatic Sync
- New interviews automatically create calendar events
- Reminders are set based on user preferences
- Events include join links and interview details

## Calendar Event Details

### AI Interview Events
- **Title**: "AI Mock Interview - [Job Role]"
- **Description**: Job role, difficulty, join link
- **Duration**: 1 hour
- **Location**: PrepForge interview room URL

### Live Interview Events
- **Title**: "Live Interview - [Job Role]"
- **Description**: Interviewer details, join link
- **Attendees**: Interviewer email (if available)
- **Duration**: 1 hour
- **Location**: PrepForge interview room URL

## Security & Privacy

### Data Access
- **Read Access**: Only to check availability (optional)
- **Write Access**: Only for PrepForge-created events
- **No Access**: To personal calendar details or other events

### Token Storage
- Access tokens encrypted in database
- Refresh tokens for automatic renewal
- Tokens can be revoked anytime

### User Control
- Connect/disconnect anytime
- Granular sync settings
- Delete all calendar events when disconnecting

## Troubleshooting

### Common Issues
1. **OAuth popup blocked**: Allow popups for PrepForge domain
2. **Connection fails**: Check API credentials and redirect URIs
3. **Events not syncing**: Verify auto-sync is enabled in settings
4. **Token expired**: Reconnect calendar integration

### Error Messages
- "Calendar integration not found": User needs to connect calendar first
- "Failed to create event": Check API permissions and token validity
- "OAuth error": Verify client credentials and redirect URIs

## Future Enhancements

- [ ] Calendar conflict detection before scheduling
- [ ] Bulk event management
- [ ] Calendar sharing with team members
- [ ] Integration with other calendar providers (Apple Calendar)
- [ ] Advanced availability suggestions
- [ ] Meeting room booking integration

## Testing

### Development Testing
1. Set up OAuth apps with localhost redirect URIs
2. Test connection flow with both Google and Outlook
3. Verify event creation and settings updates
4. Test disconnect functionality

### Production Deployment
1. Update redirect URIs to production domain
2. Configure proper OAuth consent screens
3. Test with real user accounts
4. Monitor API usage and rate limits

## Support

For calendar integration issues:
1. Check OAuth app configuration
2. Verify API permissions are granted
3. Test with different user accounts
4. Check browser console for detailed errors