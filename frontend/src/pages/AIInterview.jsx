import { useState } from 'react'
import { motion } from 'framer-motion'
import { Brain, Play, Loader } from 'lucide-react'
import { aiInterviewAPI } from '../services/api'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function AIInterview() {
  const [formData, setFormData] = useState({
    interviewType: 'TECHNICAL',
    topic: '',
    difficulty: 'MEDIUM',
    duration: 30
  })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleStart = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await aiInterviewAPI.create(formData)
      toast.success('Interview started!')
      navigate(`/ai-interview/${data.interview.id}`)
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to start interview')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4 lg:p-8 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />
        <motion.div
          className="absolute top-20 left-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.6, 0.3, 0.6],
          }}
          transition={{ duration: 4, repeat: Infinity, delay: 2 }}
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto relative z-10"
      >
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-6 mb-6 lg:mb-8"
        >
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold gradient-text mb-2">AI Mock Interview</h1>
            <p className="text-gray-400 text-lg">Practice with AI and get instant feedback</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-6 lg:p-8"
          >
            <h2 className="text-xl lg:text-2xl font-bold mb-6 gradient-text">Configure Interview</h2>
            <form onSubmit={handleStart} className="space-y-5 lg:space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <label className="block text-sm font-medium mb-2 text-gray-300">Interview Type</label>
                <select
                  className="input"
                  value={formData.interviewType}
                  onChange={(e) => setFormData({ ...formData, interviewType: e.target.value })}
                >
                  <option value="TECHNICAL">Technical</option>
                  <option value="HR">HR</option>
                  <option value="BEHAVIORAL">Behavioral</option>
                  <option value="CODING">Coding</option>
                  <option value="SYSTEM_DESIGN">System Design</option>
                </select>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <label className="block text-sm font-medium mb-2 text-gray-300">Topic</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g., JavaScript, React, Data Structures"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  required
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <label className="block text-sm font-medium mb-2 text-gray-300">Difficulty</label>
                <select
                  className="input"
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                >
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
              >
                <label className="block text-sm font-medium mb-2 text-gray-300">Duration (minutes)</label>
                <input
                  type="number"
                  className="input"
                  min="15"
                  max="120"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                />
              </motion.div>

              <motion.button 
                type="submit" 
                disabled={loading} 
                className="btn-primary w-full flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" /> 
                    Starting...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" /> 
                    Start Interview
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>

          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="glass-card p-6 lg:p-8"
            >
              <h3 className="text-xl font-bold mb-6 gradient-text">How it works</h3>
              <ol className="space-y-4 text-gray-300">
                {[
                  'Configure your interview settings',
                  'AI generates relevant questions', 
                  'Answer questions via text or voice',
                  'Get instant AI feedback and scores'
                ].map((step, index) => (
                  <motion.li 
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    className="flex gap-4 items-center"
                  >
                    <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-sm text-white font-semibold">
                      {index + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </motion.li>
                ))}
              </ol>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="glass-card p-6 lg:p-8 bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20"
            >
              <h3 className="text-xl font-bold mb-3 text-white flex items-center gap-2">
                💡 Pro Tip
              </h3>
              <p className="text-gray-300 leading-relaxed">
                Start with EASY difficulty to build confidence, then gradually increase to HARD for better preparation.
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
