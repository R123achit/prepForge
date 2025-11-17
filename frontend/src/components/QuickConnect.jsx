import { useState } from 'react'
import { motion } from 'framer-motion'
import { Video, Mail, Users } from 'lucide-react'
import { liveInterviewAPI } from '../services/api'
import toast from 'react-hot-toast'

export default function QuickConnect() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleQuickConnect = async (e) => {
    e.preventDefault()
    if (!email.trim()) return

    setLoading(true)
    try {
      const { data } = await liveInterviewAPI.quickConnect({ interviewerEmail: email })
      toast.success('Connection request sent!')
      window.open(`/interview-room/${data.roomId}`, '_blank')
      setEmail('')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to connect')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card bg-gradient-to-br from-primary-500/10 to-primary-600/10 border-primary-500/20"
    >
      <div className="flex items-center gap-3 mb-4">
        <Video className="w-8 h-8 text-primary-500" />
        <div>
          <h3 className="text-xl font-bold">Quick Connect</h3>
          <p className="text-dark-400 text-sm">Connect instantly with any interviewer</p>
        </div>
      </div>

      <form onSubmit={handleQuickConnect} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Interviewer Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-400" />
            <input
              type="email"
              className="input pl-10"
              placeholder="interviewer@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !email.trim()}
          className="btn-primary w-full disabled:opacity-50"
        >
          {loading ? (
            'Connecting...'
          ) : (
            <>
              <Users className="inline w-5 h-5 mr-2" />
              Start Video Call
            </>
          )}
        </button>
      </form>

      <div className="mt-4 p-3 bg-dark-700 rounded-lg">
        <p className="text-xs text-dark-400">
          💡 The interviewer will receive a notification and can join the call instantly
        </p>
      </div>
    </motion.div>
  )
}