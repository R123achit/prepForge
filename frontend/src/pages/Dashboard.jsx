import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, TrendingUp, Award, Clock, Video } from 'lucide-react'
import { dashboardAPI } from '../services/api'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [stats, setStats] = useState(null)
  const { user } = useAuthStore()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [dashRes, statsRes] = await Promise.all([
        dashboardAPI.getUnified(),
        dashboardAPI.getStats()
      ])
      setData(dashRes.data)
      setStats(statsRes.data)
    } catch (error) {
      toast.error('Failed to load dashboard')
    }
  }

  const statCards = [
    { icon: Award, label: 'AI Interviews', value: stats?.overall?.completedInterviews || 0, color: 'text-green-500' },
    { icon: Calendar, label: 'Live Interviews', value: user?.totalLiveInterviews || 0, color: 'text-blue-500' },
    { icon: TrendingUp, label: 'AI Score', value: `${stats?.ai?.averageScore || 0}%`, color: 'text-purple-500' },
    { icon: Clock, label: 'Upcoming', value: data?.candidate?.upcoming?.length || 0, color: 'text-orange-500' },
  ]

  return (
    <div className="relative">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-bold mb-3 gradient-text">Welcome back, {user?.firstName}! 👋</h1>
          <p className="text-gray-400 text-xl">Here's your interview preparation progress</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          {statCards.map((stat, i) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="glass-card p-6 group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-4">
                  <Icon className={`w-10 h-10 ${stat.color} group-hover:scale-110 transition-transform`} />
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center">
                    <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full opacity-60" />
                  </div>
                </div>
                <p className="text-gray-400 text-sm font-medium mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
              </motion.div>
            )
          })}
        </div>

        {/* Upcoming Interviews */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-8 mb-8"
        >
          <h2 className="text-3xl font-bold mb-6 gradient-text">Upcoming Interviews</h2>
          {data?.candidate?.upcoming?.length > 0 ? (
            <div className="space-y-4">
              {data.candidate.upcoming.map((interview, index) => (
                <motion.div 
                  key={interview.id} 
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6 flex justify-between items-center hover:bg-white/10 transition-all"
                >
                  <div>
                    <h3 className="font-semibold text-lg text-white mb-1">{interview.topic}</h3>
                    <p className="text-sm text-gray-400 mb-1">
                      Interviewer: {interview.interviewer?.firstName} {interview.interviewer?.lastName}
                    </p>
                    <p className="text-sm text-gray-500">{interview.interviewType} • {new Date(interview.scheduledAt).toLocaleString()}</p>
                  </div>
                  <span className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-300 rounded-full text-sm font-medium border border-purple-500/30">
                    {interview.status}
                  </span>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-gray-400 text-center py-8 text-lg"
            >
              No upcoming interviews scheduled
            </motion.p>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6"
        >
          <motion.a
            href="/interview-video"
            whileHover={{ scale: 1.05, y: -10 }}
            whileTap={{ scale: 0.95 }}
            className="glass-card p-4 lg:p-8 text-center cursor-pointer group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Video className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">Live AI Video Interview</h3>
              <p className="text-gray-400">Real-time conversation with AI avatar</p>
            </div>
          </motion.a>
          <motion.a
            href="/live-interview"
            whileHover={{ scale: 1.05, y: -10 }}
            whileTap={{ scale: 0.95 }}
            className="glass-card p-4 lg:p-8 text-center cursor-pointer group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">Schedule Live Interview</h3>
              <p className="text-gray-400">Book with real interviewer</p>
            </div>
          </motion.a>
          <motion.a
            href="/resume-maker"
            whileHover={{ scale: 1.05, y: -10 }}
            whileTap={{ scale: 0.95 }}
            className="glass-card p-4 lg:p-8 text-center cursor-pointer group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">Analyze Resume</h3>
              <p className="text-gray-400">Get AI feedback and optimization</p>
            </div>
          </motion.a>
        </motion.div>
      </motion.div>
    </div>
  )
}
