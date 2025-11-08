# Dashboard Statistics Enhancement

## Overview
Enhanced the dashboard to properly track and display interview statistics including completed interviews, awaiting confirmation, and today's sessions.

## Changes Made

### Backend Changes (`backend/src/routes/dashboard.js`)

#### 1. Enhanced Statistics Counting
- **Completed Interviews**: Now counts BOTH AI interviews and Live interviews
  - For Candidates: `completedLiveCount + completedAICount`
  - For Interviewers: `completedLiveCount + completedAICount`
  
- **Awaiting Confirmation**: Counts live interviews without an assigned interviewer
  - Query: `LiveInterview.find({ candidateId: userId, status: 'SCHEDULED', interviewerId: null })`
  
- **Today's Sessions**: Counts interviews scheduled for today
  - Query: `LiveInterview.find({ scheduledAt: { $gte: today, $lt: tomorrow } })`

#### 2. New Endpoints Added
- `POST /api/dashboard/interviewer/requests/:id/accept` - Accept interview request
- `POST /api/dashboard/interviewer/requests/:id/decline` - Decline interview request

### Frontend Changes (`frontend/src/pages/DashboardPage.tsx`)

#### 1. Fixed API Endpoint Paths
- Changed from `/api/dashboard/unified` to `/dashboard/unified`
- Changed from `/api/dashboard/interviewer/requests/...` to `/dashboard/interviewer/requests/...`
- (The `/api` prefix is already included in the axios base URL)

## Dashboard Statistics Display

### For Candidates:
1. **My Interviews** - Total upcoming live interviews
2. **Completed** - Total completed (AI + Live interviews)
3. **Awaiting Confirmation** - Live interviews waiting for interviewer assignment
4. **Today's Sessions** - Interviews scheduled for today

### For Interviewers:
1. **Sessions to Conduct** - Total upcoming interviews to conduct
2. **Conducted** - Total completed (AI + Live interviews conducted)
3. **Pending Requests** - Interview requests awaiting acceptance
4. **Today's Sessions** - Interviews scheduled for today

## How It Works

### Statistics Calculation Flow:

1. **User logs in** → Dashboard loads
2. **Frontend calls** `/dashboard/unified` endpoint
3. **Backend queries**:
   - Live interviews (upcoming, today, completed)
   - AI interviews (completed count)
   - Pending requests (no interviewer assigned)
4. **Backend calculates**:
   - `totalCompleted = completedLiveCount + completedAICount`
   - `pendingRequests = interviews with interviewerId: null`
   - `todayTotal = interviews scheduled between today 00:00 and tomorrow 00:00`
5. **Frontend displays** statistics in dashboard cards

## Testing Checklist

- [ ] Candidate can see total completed interviews (AI + Live)
- [ ] Candidate can see awaiting confirmation count
- [ ] Candidate can see today's sessions
- [ ] Interviewer can see pending requests
- [ ] Interviewer can accept interview requests
- [ ] Interviewer can decline interview requests
- [ ] Statistics update after accepting/declining
- [ ] Today's sessions show correct count

## Database Queries Used

```javascript
// Completed AI Interviews
AIInterview.countDocuments({ userId, status: 'COMPLETED' })

// Completed Live Interviews (Candidate)
LiveInterview.countDocuments({ candidateId: userId, status: 'COMPLETED' })

// Completed Live Interviews (Interviewer)
LiveInterview.countDocuments({ interviewerId: userId, status: 'COMPLETED' })

// Awaiting Confirmation
LiveInterview.countDocuments({ 
  candidateId: userId, 
  status: 'SCHEDULED', 
  interviewerId: null 
})

// Today's Sessions
LiveInterview.find({ 
  scheduledAt: { $gte: today, $lt: tomorrow },
  status: 'SCHEDULED'
})
```

## Notes

- All statistics now include both AI and Live interviews for accurate tracking
- Pending requests are only shown for candidates (awaiting confirmation) and interviewers (requests to accept)
- Today's sessions use timezone-aware date calculations
- Statistics refresh automatically after accepting/declining interviews
