import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'
import LoadingSpinner from './components/LoadingSpinner'

// Eager load critical routes
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Layout from './components/Layout'

// Lazy load non-critical routes
const Dashboard = lazy(() => import('./pages/Dashboard'))
const InterviewerDashboard = lazy(() => import('./pages/InterviewerDashboard'))
const AIInterview = lazy(() => import('./pages/AIInterview'))
const AIInterviewSession = lazy(() => import('./pages/AIInterviewSession'))
const LiveInterview = lazy(() => import('./pages/LiveInterview'))
const InterviewerLiveInterview = lazy(() => import('./pages/InterviewerLiveInterview'))
const InterviewRoom = lazy(() => import('./pages/InterviewRoom'))
const InterviewVideo = lazy(() => import('./pages/InterviewVideo'))
const ResumeBuilder = lazy(() => import('./pages/ResumeBuilder'))
const Profile = lazy(() => import('./pages/Profile'))
const JobBoard = lazy(() => import('./pages/JobBoard'))
const CalendarSync = lazy(() => import('./pages/CalendarSync'))
const CalendarCallback = lazy(() => import('./pages/CalendarCallback'))

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
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
          },
        }}
      />
      <Suspense fallback={<LoadingSpinner />}>
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
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </Suspense>
    </Router>
  )
}

export default App
