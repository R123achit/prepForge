import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  BrainCircuit, 
  Video, 
  Calendar, 
  TrendingUp, 
  Bell, 
  Clock, 
  User, 
  CheckCircle, 
  XCircle,
  UserCheck
} from 'lucide-react';
import api from '../services/api';

export default function DashboardPage() {
  const { user } = useAuthStore();
  // Show only the view for user's role (no toggle)
  const viewMode = user?.role === 'INTERVIEWER' ? 'interviewer' : 'candidate';
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/dashboard/unified');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInterview = async (interviewId) => {
    try {
      await api.post(`/dashboard/interviewer/requests/${interviewId}/accept`);
      fetchDashboardData();
      alert('Interview accepted successfully!');
    } catch (error) {
      console.error('Failed to accept interview:', error);
      alert('Failed to accept interview. Please try again.');
    }
  };

  const handleDeclineInterview = async (interviewId) => {
    if (!confirm('Are you sure you want to decline this interview?')) return;
    
    try {
      await api.post(`/dashboard/interviewer/requests/${interviewId}/decline`);
      fetchDashboardData();
      alert('Interview declined.');
    } catch (error) {
      console.error('Failed to decline interview:', error);
      alert('Failed to decline interview. Please try again.');
    }
  };

  const getTimeUntil = (scheduledAt) => {
    const now = new Date();
    const scheduled = new Date(scheduledAt);
    const diff = scheduled.getTime() - now.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 0) return 'Started';
    if (minutes < 60) return `${minutes} min`;
    if (hours < 24) return `${hours}h ${minutes % 60}m`;
    return `${days} days`;
  };

  const getUrgencyColor = (scheduledAt) => {
    const now = new Date();
    const scheduled = new Date(scheduledAt);
    const diff = scheduled.getTime() - now.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 30) return 'bg-red-100 text-red-800 border-red-300';
    if (minutes < 240) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-green-100 text-green-800 border-green-300';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-br from-[#0a2540] to-[#1e3a5f] rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-2xl border border-blue-500/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
              Welcome back, {user?.firstName}! 👋
            </h1>
            <p className="text-blue-100 text-sm sm:text-base">
              {user?.role === 'INTERVIEWER' 
                ? 'Manage interview requests and conduct sessions with candidates.'
                : user?.role === 'CANDIDATE'
                ? 'Schedule interviews and practice your skills to ace your next job!'
                : 'Manage your interviews and track your progress from both perspectives.'}
            </p>
          </div>
          <div className="text-left sm:text-right">
            <span className={`px-4 py-2 rounded-full text-sm font-semibold inline-block ${
              user?.role === 'INTERVIEWER' 
                ? 'bg-purple-500/20 text-purple-200 border border-purple-400/30' 
                : 'bg-blue-500/20 text-blue-200 border border-blue-400/30'
            }`}>
              {user?.role === 'INTERVIEWER' ? '👨‍🏫 Interviewer' : '👤 Candidate'}
            </span>
          </div>
        </div>
      </div>



      {/* Stats Overview - Role Specific */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-gradient-to-br from-[#0a2540] to-[#1e3a5f] rounded-xl p-5 sm:p-6 shadow-xl border border-blue-500/20 hover:border-blue-400/40 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-xs sm:text-sm font-medium mb-1">
                {user?.role === 'INTERVIEWER' ? 'Sessions to Conduct' : 'My Interviews'}
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-white">{dashboardData?.stats.totalUpcoming || 0}</p>
            </div>
            <Calendar className="w-10 h-10 sm:w-12 sm:h-12 text-blue-400 opacity-30" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#0a2540] to-[#1e3a5f] rounded-xl p-5 sm:p-6 shadow-xl border border-green-500/20 hover:border-green-400/40 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-200 text-xs sm:text-sm font-medium mb-1">
                {user?.role === 'INTERVIEWER' ? 'Conducted' : 'Completed'}
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-white">{dashboardData?.stats.totalCompleted || 0}</p>
            </div>
            <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-green-400 opacity-30" />
          </div>
        </div>

        {user?.role === 'INTERVIEWER' ? (
          <div className="bg-gradient-to-br from-[#0a2540] to-[#1e3a5f] rounded-xl p-5 sm:p-6 shadow-xl border border-orange-500/20 hover:border-orange-400/40 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-200 text-xs sm:text-sm font-medium mb-1">Pending Requests</p>
                <p className="text-2xl sm:text-3xl font-bold text-white">{dashboardData?.stats.pendingRequests || 0}</p>
              </div>
              <Bell className="w-10 h-10 sm:w-12 sm:h-12 text-orange-400 opacity-30" />
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-[#0a2540] to-[#1e3a5f] rounded-xl p-5 sm:p-6 shadow-xl border border-yellow-500/20 hover:border-yellow-400/40 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-200 text-xs sm:text-sm font-medium mb-1">Awaiting Confirmation</p>
                <p className="text-2xl sm:text-3xl font-bold text-white">{dashboardData?.stats.pendingRequests || 0}</p>
              </div>
              <Clock className="w-10 h-10 sm:w-12 sm:h-12 text-yellow-400 opacity-30" />
            </div>
          </div>
        )}

        <div className="bg-gradient-to-br from-[#0a2540] to-[#1e3a5f] rounded-xl p-5 sm:p-6 shadow-xl border border-purple-500/20 hover:border-purple-400/40 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-xs sm:text-sm font-medium mb-1">Today's Sessions</p>
              <p className="text-2xl sm:text-3xl font-bold text-white">{dashboardData?.stats.todayTotal || 0}</p>
            </div>
            <Clock className="w-10 h-10 sm:w-12 sm:h-12 text-purple-400 opacity-30" />
          </div>
        </div>
      </div>

      {/* Quick Actions - Role Specific */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <Link
          to="/ai-interview"
          className="bg-gradient-to-br from-[#0a2540] to-[#1e3a5f] rounded-xl p-5 sm:p-6 shadow-xl border border-blue-500/20 hover:border-blue-400/50 hover:shadow-2xl transition-all cursor-pointer group"
        >
          <div className="flex items-start space-x-3 sm:space-x-4">
            <div className="p-3 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors border border-blue-400/30">
              <BrainCircuit className="w-7 h-7 sm:w-8 sm:h-8 text-blue-300" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
                {user?.role === 'INTERVIEWER' ? 'Practice with AI' : 'Start AI Interview'}
              </h3>
              <p className="text-blue-100 text-sm sm:text-base">
                {user?.role === 'INTERVIEWER' 
                  ? 'Improve your interviewing skills with AI practice sessions.'
                  : 'Practice with our AI interviewer and get instant feedback.'}
              </p>
              <span className="inline-block mt-3 text-blue-300 font-semibold group-hover:text-blue-200 transition-colors">
                Get Started →
              </span>
            </div>
          </div>
        </Link>

        <Link
          to="/live-interview"
          className="bg-gradient-to-br from-[#0a2540] to-[#1e3a5f] rounded-xl p-5 sm:p-6 shadow-xl border-2 border-blue-500/30 hover:border-blue-400/60 hover:shadow-2xl transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-start space-x-3 sm:space-x-4 relative z-10">
            <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-all shadow-sm border border-blue-400/30">
              <Video className="w-7 h-7 sm:w-8 sm:h-8 text-blue-300" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2 group-hover:text-blue-200 transition-colors">
                {user?.role === 'INTERVIEWER' ? 'Interview Requests' : 'Schedule Interview'}
              </h3>
              <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
                {user?.role === 'INTERVIEWER'
                  ? 'View and manage pending interview requests from candidates.'
                  : 'Book a session with an experienced interviewer.'}
              </p>
              {user?.role === 'INTERVIEWER' && dashboardData && dashboardData.stats.pendingRequests > 0 && (
                <span className="inline-flex items-center mt-3 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md animate-pulse">
                  <Bell className="w-3 h-3 mr-1" />
                  {dashboardData.stats.pendingRequests} Pending
                </span>
              )}
              {user?.role === 'CANDIDATE' && (
                <span className="inline-block mt-3 text-blue-300 font-semibold group-hover:text-blue-200 transition-colors">
                  Schedule Now →
                </span>
              )}
            </div>
          </div>
        </Link>
      </div>

      {/* Resume Tools Section - Only for Candidates */}
      {user?.role === 'CANDIDATE' && (
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-white mb-4">Resume Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <Link
              to="/resume-maker"
              className="bg-gradient-to-br from-[#0a2540] to-[#1e3a5f] rounded-xl p-5 sm:p-6 shadow-xl border border-green-500/20 hover:border-green-400/50 hover:shadow-2xl transition-all cursor-pointer group"
            >
              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="p-3 bg-green-500/20 rounded-lg group-hover:bg-green-500/30 transition-colors border border-green-400/30">
                  <svg className="w-7 h-7 sm:w-8 sm:h-8 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
                    Resume Maker
                  </h3>
                  <p className="text-green-100 text-sm sm:text-base">
                    Create a professional resume with our easy-to-use builder. Choose from multiple templates.
                  </p>
                  <span className="inline-block mt-3 text-green-300 font-medium group-hover:text-green-200 transition-colors">
                    Create Resume →
                  </span>
                </div>
              </div>
            </Link>

            <Link
              to="/resume-matcher"
              className="bg-gradient-to-br from-[#0a2540] to-[#1e3a5f] rounded-xl p-5 sm:p-6 shadow-xl border border-purple-500/20 hover:border-purple-400/50 hover:shadow-2xl transition-all cursor-pointer group"
            >
              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="p-3 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-colors border border-purple-400/30">
                  <svg className="w-7 h-7 sm:w-8 sm:h-8 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
                    Resume Matcher
                  </h3>
                  <p className="text-purple-100 text-sm sm:text-base">
                    Upload your resume and get AI-powered analysis with job role matching and improvement suggestions.
                  </p>
                  <span className="inline-block mt-3 text-purple-300 font-medium group-hover:text-purple-200 transition-colors">
                    Analyze Resume →
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* Candidate View */}
      {viewMode === 'candidate' && dashboardData && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-[#0a2540] to-[#1e3a5f] rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8 shadow-2xl border border-blue-500/20">
            <h2 className="text-xl sm:text-2xl font-semibold text-white mb-4 sm:mb-6 flex items-center flex-wrap gap-2">
              <User className="w-5 h-5 sm:w-6 sm:h-6" />
              <span>My Interviews</span>
              <span className="text-blue-300 text-base sm:text-lg">({dashboardData.candidate.total} total)</span>
            </h2>

            {dashboardData.candidate.today.length > 0 && (
              <div className="mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  📅 Today's Interviews
                </h3>
                <div className="space-y-3">
                  {dashboardData.candidate.today.map((interview) => {
                    const timeUntil = getTimeUntil(interview.scheduledAt);
                    const isUrgent = timeUntil.includes('min') || timeUntil === 'Started';
                    return (
                      <div 
                        key={interview.id}
                        className={`border-2 rounded-xl p-4 sm:p-5 ${
                          isUrgent 
                            ? 'bg-red-500/10 border-red-400/50' 
                            : 'bg-yellow-500/10 border-yellow-400/50'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                          <div className="flex-1">
                            <h4 className="font-semibold text-base sm:text-lg text-white">{interview.topic}</h4>
                            <p className="text-xs sm:text-sm text-blue-200 mt-1">
                              With: {interview.interviewer?.firstName} {interview.interviewer?.lastName}
                            </p>
                            <p className="text-xs sm:text-sm text-blue-200 mt-1">
                              {new Date(interview.scheduledAt).toLocaleTimeString()} • {interview.duration} min • {interview.interviewType}
                            </p>
                          </div>
                          <div className="text-left sm:text-right flex sm:flex-col items-center sm:items-end gap-3">
                            <div className={`font-bold text-base sm:text-lg ${isUrgent ? 'text-red-300' : 'text-yellow-300'}`}>
                              {timeUntil}
                            </div>
                            <Link
                              to={`/interview-room/${interview.id}`}
                              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all text-sm sm:text-base"
                            >
                              🎥 Join Room
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {dashboardData.candidate.upcoming.length > 0 ? (
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-white mb-3">Upcoming Interviews</h3>
                <div className="space-y-3">
                  {dashboardData.candidate.upcoming.filter(i => !dashboardData.candidate.today.includes(i)).map((interview) => (
                    <div key={interview.id} className="border border-blue-500/30 bg-blue-500/5 rounded-xl p-4 sm:p-5 hover:border-blue-400/50 hover:bg-blue-500/10 transition-all">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-base sm:text-lg text-white">{interview.topic}</h4>
                          <p className="text-xs sm:text-sm text-blue-200 mt-1">
                            With: {interview.interviewer?.firstName} {interview.interviewer?.lastName}
                          </p>
                          <p className="text-xs sm:text-sm text-blue-300 mt-1">
                            {new Date(interview.scheduledAt).toLocaleDateString()} at {new Date(interview.scheduledAt).toLocaleTimeString()} • {interview.duration} min
                          </p>
                        </div>
                        <span className="px-3 py-1 bg-green-500/20 text-green-300 border border-green-400/30 rounded-full text-xs sm:text-sm font-medium self-start">
                          Confirmed
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-blue-400 opacity-50 mx-auto mb-4" />
                <p className="text-blue-200 mb-4">No upcoming interviews scheduled.</p>
                <Link to="/live-interview" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all inline-block">
                  Schedule Interview
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Interviewer View */}
      {viewMode === 'interviewer' && dashboardData && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-[#0a2540] to-[#1e3a5f] rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8 shadow-2xl border border-blue-500/20">
            <h2 className="text-xl sm:text-2xl font-semibold text-white mb-4 sm:mb-6 flex flex-wrap items-center gap-2">
              <UserCheck className="w-5 h-5 sm:w-6 sm:h-6" />
              <span>Interview Sessions</span>
              <span className="text-blue-300 text-base sm:text-lg">({dashboardData.interviewer.total} total)</span>
              {dashboardData.interviewer.averageRating > 0 && (
                <span className="ml-auto flex items-center text-base sm:text-lg bg-green-500/20 px-3 py-1 rounded-full border border-green-400/30">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 mr-1 text-green-300" />
                  <span className="font-bold text-green-200">{dashboardData.interviewer.averageRating.toFixed(1)}</span>
                  <span className="text-green-300 text-xs sm:text-sm ml-1">/5.0</span>
                </span>
              )}
            </h2>

            {dashboardData.interviewer.upcoming.length > 0 && (
              <div className="mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                  Pending Requests ({dashboardData.interviewer.upcoming.length})
                </h3>
                <div className="space-y-3">
                  {dashboardData.interviewer.upcoming.map((interview) => (
                    <div key={interview.id} className="border-2 border-orange-400/50 bg-orange-500/10 rounded-xl p-4 sm:p-5">
                      <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2 flex-wrap gap-2">
                            <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded animate-pulse">NEW</span>
                            <h4 className="font-semibold text-base sm:text-lg text-white">{interview.topic}</h4>
                          </div>
                          <p className="text-xs sm:text-sm text-blue-200">
                            From: <span className="font-medium text-white">{interview.candidate?.firstName} {interview.candidate?.lastName}</span>
                            <span className="text-blue-300"> ({interview.candidate?.email})</span>
                          </p>
                          <p className="text-xs sm:text-sm text-blue-200 mt-1">
                            📅 {new Date(interview.scheduledAt).toLocaleDateString()} at {new Date(interview.scheduledAt).toLocaleTimeString()}
                          </p>
                          <p className="text-xs sm:text-sm text-blue-200">
                            ⏱️ {interview.duration} minutes • {interview.interviewType}
                          </p>
                        </div>
                        <div className="flex flex-row lg:flex-col space-x-2 lg:space-x-0 lg:space-y-2 w-full lg:w-auto">
                          <button
                            onClick={() => handleAcceptInterview(interview.id)}
                            className="flex-1 lg:flex-none flex items-center justify-center space-x-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold text-sm sm:text-base"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Accept</span>
                          </button>
                          <button
                            onClick={() => handleDeclineInterview(interview.id)}
                            className="flex-1 lg:flex-none flex items-center justify-center space-x-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors font-semibold text-sm sm:text-base"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Decline</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {dashboardData.interviewer.today.length > 0 && (
              <div className="mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-white mb-3">Today's Interviews to Conduct</h3>
                <div className="space-y-3">
                  {dashboardData.interviewer.today.map((interview) => {
                    const timeUntil = getTimeUntil(interview.scheduledAt);
                    const isUrgent = timeUntil.includes('min') || timeUntil === 'Started';
                    return (
                      <div 
                        key={interview.id}
                        className={`border-2 rounded-xl p-4 sm:p-5 ${
                          isUrgent 
                            ? 'bg-red-500/10 border-red-400/50' 
                            : 'bg-yellow-500/10 border-yellow-400/50'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                          <div className="flex-1">
                            <h4 className="font-semibold text-base sm:text-lg text-white">{interview.topic}</h4>
                            <p className="text-xs sm:text-sm text-blue-200 mt-1">
                              Candidate: {interview.candidate?.firstName} {interview.candidate?.lastName}
                            </p>
                            <p className="text-xs sm:text-sm text-blue-200 mt-1">
                              {new Date(interview.scheduledAt).toLocaleTimeString()} • {interview.duration} min • {interview.interviewType}
                            </p>
                          </div>
                          <div className="text-left sm:text-right flex sm:flex-col items-center sm:items-end gap-3">
                            <div className={`font-bold text-base sm:text-lg ${isUrgent ? 'text-red-300' : 'text-yellow-300'}`}>
                              {timeUntil}
                            </div>
                            <Link
                              to={`/interview-room/${interview.id}`}
                              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all text-sm sm:text-base"
                            >
                              🎥 Join Room
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {dashboardData.interviewer.upcoming.length === 0 && dashboardData.interviewer.today.length === 0 && (
              <div className="text-center py-12">
                <UserCheck className="w-12 h-12 sm:w-16 sm:h-16 text-blue-400 opacity-50 mx-auto mb-4" />
                <p className="text-blue-200 mb-2">No pending interview requests.</p>
                <p className="text-blue-300 text-xs sm:text-sm">You'll be notified when someone schedules an interview with you.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}



