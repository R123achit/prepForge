import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Users, Clock, Star } from 'lucide-react'
import { dashboardAPI } from '../services/api'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

export default function InterviewerDashboard() {
  const [data, setData] = useState(null)
  const { user } = useAuthStore()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const { data: dashRes } = await dashboardAPI.getUnified()
      setData(dashRes)
    } catch (error) {
      toast.error('Failed to load dashboard')
    }
  }

  const statCards = [
    { icon: Users, label: 'Interviews Conducted', value: user?.totalInterviewsConducted || 0, color: 'text-blue-500' },
    { icon: Calendar, label: 'Upcoming', value: data?.interviewer?.upcoming?.length || 0, color: 'text-green-500' },
    { icon: Star, label: 'Rating', value: `${user?.rating || 0}/5`, color: 'text-yellow-500' },
    { icon: Clock, label: 'Today', value: data?.stats?.todayTotal || 0, color: 'text-purple-500' },
  ]

  return (
    <div className="px-4 lg:px-0">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl lg:text-4xl font-bold mb-2 gradient-text">Interviewer Dashboard 👨‍💼</h1>
        <p className="text-gray-400 mb-6 lg:mb-8 text-lg">Manage your interviews and help candidates succeed</p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
          {statCards.map((stat, i) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-4 lg:p-6 group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <Icon className={`w-8 lg:w-10 h-8 lg:h-10 ${stat.color} group-hover:scale-110 transition-transform`} />
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full" />
                </div>
                <p className="text-gray-400 text-xs lg:text-sm font-medium mb-1">{stat.label}</p>
                <p className="text-xl lg:text-3xl font-bold text-white">{stat.value}</p>
              </motion.div>
            )
          })}
        </div>

        {/* Upcoming Interviews */}
        <div className="glass-card p-6 lg:p-8 mb-6 lg:mb-8">
          <h2 className="text-xl lg:text-2xl font-bold mb-4 gradient-text">Your Upcoming Interviews</h2>
          {data?.interviewer?.upcoming?.length > 0 ? (
            <div className="space-y-4">
              {data.interviewer.upcoming.map((interview) => (
                <div key={interview.id} className="bg-slate-800/95 backdrop-blur-xl border border-slate-600/50 rounded-xl p-3 lg:p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 lg:gap-4 shadow-lg overflow-hidden">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white text-base lg:text-lg mb-2 truncate">{interview.topic}</h3>
                    <p className="text-xs lg:text-sm text-gray-400 mb-1 truncate">
                      Candidate: {interview.candidate?.firstName} {interview.candidate?.lastName}
                    </p>
                    <p className="text-xs lg:text-sm text-gray-500 break-words">
                      {interview.interviewType} • {new Date(interview.scheduledAt).toLocaleDateString()}
                    </p>
                  </div>
                  <a href={`/interview-room/${interview.roomId}`} className="btn-primary w-full lg:w-auto text-center text-sm lg:text-base px-3 lg:px-6 py-2 lg:py-3 whitespace-nowrap">
                    Join Interview
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8 text-lg">No upcoming interviews scheduled</p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          <motion.a
            href="/live-interview"
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            className="glass-card p-6 lg:p-8 text-center cursor-pointer group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg lg:text-xl font-bold mb-2 text-white">View All Interviews</h3>
              <p className="text-gray-400">Manage your interview schedule</p>
            </div>
          </motion.a>
          <motion.a
            href="/profile"
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            className="glass-card p-6 lg:p-8 text-center cursor-pointer group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg lg:text-xl font-bold mb-2 text-white">Update Profile</h3>
              <p className="text-gray-400">Manage your specialization</p>
            </div>
          </motion.a>
        </div>
      </motion.div>
    </div>
  )
}