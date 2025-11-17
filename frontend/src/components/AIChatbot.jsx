import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Loader, Bot } from 'lucide-react'
import { chatbotAPI, dashboardAPI } from '../services/api'
import toast from 'react-hot-toast'

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi! I\'m PrepForge AI Assistant. How can I help you with interview preparation today?',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [userStats, setUserStats] = useState(null)

  useEffect(() => {
    fetchUserStats()
  }, [])

  const fetchUserStats = async () => {
    try {
      const { data } = await dashboardAPI.getStats()
      setUserStats({
        totalAIInterviews: data.totalAIInterviews || 0,
        totalLiveInterviews: data.totalLiveInterviews || 0,
        averageScore: data.averageScore || 0,
        recentPerformance: data.recentPerformance || 'No data',
        completedInterviews: data.completedInterviews || 0,
        pendingInterviews: data.pendingInterviews || 0
      })
    } catch (error) {
      console.error('Failed to fetch user stats:', error)
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const { data } = await chatbotAPI.sendMessage({
        message: input.trim(),
        context: 'interview_preparation',
        userStats: userStats
      })

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      }])
    } catch (error) {
      toast.error('Failed to get response')
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Chat Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 lg:bottom-6 right-4 lg:right-6 w-14 h-14 lg:w-16 lg:h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full shadow-2xl flex items-center justify-center text-white z-50 neon-glow"
        whileHover={{ scale: 1.1, boxShadow: "0 0 30px rgba(168, 85, 247, 0.6)" }}
        whileTap={{ scale: 0.9 }}
        animate={{
          boxShadow: [
            "0 0 20px rgba(168, 85, 247, 0.3)",
            "0 0 30px rgba(168, 85, 247, 0.6)",
            "0 0 20px rgba(168, 85, 247, 0.3)"
          ]
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {isOpen ? <X className="w-7 h-7" /> : <MessageCircle className="w-7 h-7" />}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.8 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-36 lg:bottom-28 right-2 lg:right-6 w-80 lg:w-96 h-[400px] lg:h-[550px] glass-card backdrop-blur-2xl border border-white/20 flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 p-5 flex items-center gap-3 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 animate-gradient" />
              <div className="relative z-10 flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">PrepForge AI</h3>
                  <p className="text-xs text-white/80">Your interview preparation assistant</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gradient-to-b from-transparent to-black/10">
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-4 rounded-2xl shadow-xl ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                        : 'bg-slate-800/95 backdrop-blur-xl border border-slate-600/50 text-white'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">{msg.content}</p>
                    <p className="text-xs opacity-70 mt-2">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}
              {loading && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-slate-800/95 backdrop-blur-xl border border-slate-600/50 p-4 rounded-2xl shadow-xl">
                    <div className="flex items-center gap-2">
                      <Loader className="w-5 h-5 text-purple-400 animate-spin" />
                      <span className="text-sm text-white font-medium">AI is thinking...</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="p-5 border-t border-white/10 bg-black/20">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me about interviews, tips, or practice..."
                  className="flex-1 backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all text-sm"
                  disabled={loading}
                />
                <motion.button
                  type="submit"
                  disabled={loading || !input.trim()}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white p-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                >
                  <Send className="w-5 h-5" />
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
