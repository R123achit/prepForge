import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'

// Pages
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import InterviewerDashboard from './pages/InterviewerDashboard'
import AIInterview from './pages/AIInterview'
import AIInterviewSession from './pages/AIInterviewSession'
import LiveInterview from './pages/LiveInterview'
import InterviewerLiveInterview from './pages/InterviewerLiveInterview'
import InterviewRoom from './pages/InterviewRoom'
import InterviewVideo from './pages/InterviewVideo'
import ResumeMaker from './pages/ResumeMaker'
import ResumeBuilder from './pages/ResumeBuilder'
import Profile from './pages/Profile'
import JobBoard from './pages/JobBoard'
import CalendarSync from './pages/CalendarSync'
import CalendarCallback from './pages/CalendarCallback'
import NotFound from './pages/NotFound'

// Layout
import Layout from './components/Layout'

function ProtectedRoute({ children }) {
  const { user } = useAuthStore()
  return user ? children : <Navigate to="/login" />
}

function DashboardRoute() {
  const { user } = useAuthStore()
  if (!user) return <Navigate to="/login" />
  return user.role === 'INTERVIEWER' ? <InterviewerDashboard /> : <Dashboard />
}

function LiveInterviewRoute() {
  const { user } = useAuthStore()
  if (!user) return <Navigate to="/login" />
  return user.role === 'INTERVIEWER' ? <InterviewerLiveInterview /> : <LiveInterview />
}

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="dashboard" element={<DashboardRoute />} />
          <Route path="ai-interview" element={<AIInterview />} />
          <Route path="live-interview" element={<LiveInterviewRoute />} />
          <Route path="resume-maker" element={<ResumeBuilder />} />
          <Route path="job-board" element={<JobBoard />} />
          <Route path="calendar-sync" element={<CalendarSync />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        
        <Route path="/ai-interview/:id" element={<ProtectedRoute><AIInterviewSession /></ProtectedRoute>} />
        <Route path="/interview-video" element={<ProtectedRoute><InterviewVideo /></ProtectedRoute>} />
        <Route path="/interview-room/:roomId" element={<ProtectedRoute><InterviewRoom /></ProtectedRoute>} />
        <Route path="/calendar/callback" element={<ProtectedRoute><CalendarCallback /></ProtectedRoute>} />
        
        {/* Catch-all route for SPA */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
