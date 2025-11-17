import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Calendar, Plus, User } from 'lucide-react'
import { liveInterviewAPI, authAPI } from '../services/api'
import QuickConnect from '../components/QuickConnect'
import toast from 'react-hot-toast'

export default function LiveInterview() {
  const [interviews, setInterviews] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    interviewType: 'TECHNICAL',
    topic: '',
    scheduledAt: '',
    duration: 60,
    difficulty: 'MEDIUM',
    interviewerId: '',
    interviewerEmail: ''
  })
  const [interviewers, setInterviewers] = useState([])

  useEffect(() => {
    fetchInterviews()
    fetchInterviewers()
  }, [])

  const fetchInterviewers = async () => {
    try {
      console.log('Fetching interviewers...')
      const { data } = await liveInterviewAPI.getInterviewers()
      setInterviewers(data.interviewers || [])
      console.log('Loaded interviewers:', data.interviewers)
    } catch (error) {
      console.error('Failed to load interviewers:', error.response?.data || error.message)
      console.error('Full error:', error)
      toast.error(`Failed to load interviewers: ${error.response?.status || 'Network Error'}`)
    }
  }

  const fetchInterviews = async () => {
    try {
      const { data } = await liveInterviewAPI.getAll()
      setInterviews(data.interviews)
    } catch (error) {
      toast.error('Failed to load interviews')
    }
  }

  const handleSchedule = async (e) => {
    e.preventDefault()
    try {
      console.log('Scheduling with data:', formData)
      await liveInterviewAPI.create(formData)
      toast.success('Interview scheduled!')
      setShowForm(false)
      setFormData({
        interviewType: 'TECHNICAL',
        topic: '',
        scheduledAt: '',
        duration: 60,
        difficulty: 'MEDIUM',
        interviewerId: '',
        interviewerEmail: ''
      })
      fetchInterviews()
    } catch (error) {
      console.error('Schedule error:', error.response?.data)
      toast.error(error.response?.data?.error || 'Failed to schedule')
    }
  }

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <Users className="w-10 h-10 text-primary-500" />
            <div>
              <h1 className="text-4xl font-bold">Live Interviews</h1>
              <p className="text-dark-400">Practice with real interviewers</p>
            </div>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            <Plus className="inline w-5 h-5 mr-2" />
            Schedule Interview
          </button>
        </div>

        {/* Quick Connect Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-2">
            <QuickConnect />
          </div>
          <div className="card">
            <h3 className="text-lg font-bold mb-2">How it works</h3>
            <ol className="text-sm text-dark-400 space-y-1">
              <li>1. Enter interviewer's email</li>
              <li>2. Click "Start Video Call"</li>
              <li>3. Join the video room</li>
              <li>4. Interviewer gets notified</li>
            </ol>
          </div>
        </div>

        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="card mb-8"
          >
            <h2 className="text-2xl font-bold mb-6">Schedule New Interview</h2>
            <form onSubmit={handleSchedule} className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Interview Type</label>
                <select
                  className="input"
                  value={formData.interviewType}
                  onChange={(e) => setFormData({ ...formData, interviewType: e.target.value })}
                >
                  <option value="TECHNICAL">Technical</option>
                  <option value="HR">HR</option>
                  <option value="BEHAVIORAL">Behavioral</option>
                  <option value="CODING">Coding</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Topic</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g., React Development"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Scheduled Date & Time</label>
                <input
                  type="datetime-local"
                  className="input"
                  value={formData.scheduledAt}
                  onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
                <input
                  type="number"
                  className="input"
                  min="30"
                  max="180"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Select Interviewer</label>
                <div className="space-y-2">
                  <select
                    className="input"
                    value={formData.interviewerId}
                    onChange={(e) => setFormData({ ...formData, interviewerId: e.target.value, interviewerEmail: '' })}
                  >
                    <option value="">Choose from available interviewers...</option>
                    {interviewers.length > 0 ? (
                      interviewers.map((interviewer) => (
                        <option key={interviewer._id || interviewer.id} value={interviewer._id || interviewer.id}>
                          {interviewer.firstName} {interviewer.lastName} - {interviewer.specialization || 'General'} ⭐ {interviewer.rating || 0}
                        </option>
                      ))
                    ) : (
                      <option disabled>No interviewers available</option>
                    )}
                  </select>
                  <div className="text-center text-dark-400">OR</div>
                  <input
                    type="email"
                    className="input"
                    placeholder="Enter interviewer's email directly"
                    value={formData.interviewerEmail || ''}
                    onChange={(e) => setFormData({ ...formData, interviewerEmail: e.target.value, interviewerId: '' })}
                  />
                </div>
              </div>
              <div className="md:col-span-2 flex gap-4">
                <button 
                  type="submit" 
                  disabled={!formData.interviewerId && !formData.interviewerEmail}
                  className="btn-primary disabled:opacity-50"
                >
                  Schedule
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </motion.div>
        )}

        <div className="card">
          <h2 className="text-2xl font-bold mb-6">Your Interviews</h2>
          {interviews.length > 0 ? (
            <div className="space-y-4">
              {interviews.map((interview) => (
                <div key={interview.id} className="bg-dark-700 rounded-lg p-6 flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-semibold mb-1">{interview.topic}</h3>
                    <p className="text-dark-400 mb-2">{interview.interviewType} • {interview.duration} minutes</p>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                        {interview.interviewer?.profileImage ? (
                          <img 
                            src={authAPI.getProfilePhoto(interview.interviewer.id)} 
                            alt={`${interview.interviewer.firstName} ${interview.interviewer.lastName}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none'
                              e.target.nextSibling.style.display = 'flex'
                            }}
                          />
                        ) : null}
                        <User className="w-4 h-4 text-white" style={{ display: interview.interviewer?.profileImage ? 'none' : 'flex' }} />
                      </div>
                      <p className="text-primary-400">Interviewer: {interview.interviewer?.firstName} {interview.interviewer?.lastName}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(interview.scheduledAt).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      interview.status === 'SCHEDULED' ? 'bg-blue-500/20 text-blue-400' :
                      interview.status === 'IN_PROGRESS' ? 'bg-green-500/20 text-green-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {interview.status}
                    </span>
                    {interview.status === 'SCHEDULED' && (
                      <a href={`/interview-room/${interview.roomId}`} className="btn-primary mt-3 inline-block text-center">Join Room</a>
                    )}
                    {interview.status === 'IN_PROGRESS' && (
                      <a href={`/interview-room/${interview.roomId}`} className="btn-secondary mt-3 inline-block text-center">Rejoin</a>
                    )}
                    {interview.status === 'COMPLETED' && (
                      <button disabled className="bg-gray-600 text-gray-400 px-4 py-2 rounded-lg cursor-not-allowed mt-3">
                        Interview Completed
                      </button>
                    )}
                    {interview.status === 'CANCELLED' && (
                      <button disabled className="bg-red-600/50 text-red-300 px-4 py-2 rounded-lg cursor-not-allowed mt-3">
                        Cancelled
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-dark-400 text-center py-8">No interviews scheduled yet</p>
          )}
        </div>
      </motion.div>
    </div>
  )
}
