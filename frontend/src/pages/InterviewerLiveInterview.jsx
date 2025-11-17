import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Calendar, CheckCircle, Clock, User } from 'lucide-react'
import { liveInterviewAPI, authAPI } from '../services/api'
import toast from 'react-hot-toast'

export default function InterviewerLiveInterview() {
  const [interviews, setInterviews] = useState([])
  const [filter, setFilter] = useState('ALL')

  useEffect(() => {
    fetchInterviews()
  }, [])

  const fetchInterviews = async () => {
    try {
      const { data } = await liveInterviewAPI.getAll()
      setInterviews(data.interviews)
    } catch (error) {
      toast.error('Failed to load interviews')
    }
  }

  const acceptInterview = async (interviewId) => {
    try {
      await liveInterviewAPI.accept(interviewId)
      toast.success('Interview accepted!')
      fetchInterviews()
    } catch (error) {
      toast.error('Failed to accept interview')
    }
  }

  const filteredInterviews = interviews.filter(interview => {
    if (filter === 'AVAILABLE') return !interview.interviewerId
    if (filter === 'ASSIGNED') return interview.interviewerId
    return true
  })

  return (
    <div className="px-4 lg:px-0">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 lg:gap-0 mb-6 lg:mb-8">
          <div className="flex items-center gap-3">
            <Users className="w-8 lg:w-10 h-8 lg:h-10 text-purple-500" />
            <div>
              <h1 className="text-2xl lg:text-4xl font-bold gradient-text">Interview Management</h1>
              <p className="text-gray-400 text-sm lg:text-base">Manage and conduct interviews</p>
            </div>
          </div>
          <div className="flex gap-2 w-full lg:w-auto overflow-x-auto">
            {['ALL', 'AVAILABLE', 'ASSIGNED'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 lg:px-4 py-2 rounded-lg transition-all text-sm lg:text-base whitespace-nowrap ${
                  filter === status ? 'bg-purple-600 text-white' : 'bg-slate-800/95 text-gray-300 hover:bg-slate-700'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="glass-card p-4 lg:p-8">
          <h2 className="text-xl lg:text-2xl font-bold mb-4 lg:mb-6 gradient-text">Interview Requests</h2>
          {filteredInterviews.length > 0 ? (
            <div className="space-y-4">
              {filteredInterviews.map((interview) => (
                <div key={interview.id} className="bg-slate-800/95 backdrop-blur-xl border border-slate-600/50 rounded-xl p-4 lg:p-6 shadow-lg">
                  <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg lg:text-xl font-semibold mb-2 text-white truncate">{interview.topic}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full overflow-hidden bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                          {interview.candidate?.profileImage ? (
                            <img 
                              src={authAPI.getProfilePhoto(interview.candidate.id)} 
                              alt={`${interview.candidate.firstName} ${interview.candidate.lastName}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none'
                                e.target.nextSibling.style.display = 'flex'
                              }}
                            />
                          ) : null}
                          <User className="w-3 h-3 text-white" style={{ display: interview.candidate?.profileImage ? 'none' : 'flex' }} />
                        </div>
                        <p className="text-purple-400 text-sm lg:text-base truncate">
                          Candidate: {interview.candidate?.firstName} {interview.candidate?.lastName}
                        </p>
                      </div>
                      <p className="text-gray-400 mb-2 text-xs lg:text-sm break-words">
                        {interview.interviewType} • {interview.duration} min • {interview.difficulty}
                      </p>
                      <div className="flex items-center gap-2 text-xs lg:text-sm text-gray-400">
                        <Calendar className="w-3 lg:w-4 h-3 lg:h-4" />
                        <span className="break-words">{new Date(interview.scheduledAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="text-left lg:text-right w-full lg:w-auto">
                      <span className={`px-2 lg:px-3 py-1 rounded-full text-xs lg:text-sm mb-3 inline-block ${
                        interview.status === 'SCHEDULED' ? 'bg-blue-500/20 text-blue-400' :
                        interview.status === 'IN_PROGRESS' ? 'bg-green-500/20 text-green-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {interview.status}
                      </span>
                      <div className="flex flex-col lg:flex-row gap-2 w-full lg:w-auto">
                        {interview.status === 'SCHEDULED' && !interview.interviewerId && (
                          <button 
                            onClick={() => acceptInterview(interview.id)}
                            className="btn-primary w-full lg:w-auto text-sm lg:text-base px-3 lg:px-6 py-2 lg:py-3"
                          >
                            <CheckCircle className="inline w-3 lg:w-4 h-3 lg:h-4 mr-2" />
                            Accept
                          </button>
                        )}
                        {interview.status === 'SCHEDULED' && interview.interviewerId && (
                          <a href={`/interview-room/${interview.roomId}`} className="btn-primary w-full lg:w-auto text-center text-sm lg:text-base px-3 lg:px-6 py-2 lg:py-3">
                            <Clock className="inline w-3 lg:w-4 h-3 lg:h-4 mr-2" />
                            Join Room
                          </a>
                        )}
                        {interview.status === 'IN_PROGRESS' && (
                          <a href={`/interview-room/${interview.roomId}`} className="btn-secondary w-full lg:w-auto text-center text-sm lg:text-base px-3 lg:px-6 py-2 lg:py-3">
                            <Clock className="inline w-3 lg:w-4 h-3 lg:h-4 mr-2" />
                            Rejoin
                          </a>
                        )}
                        {interview.status === 'COMPLETED' && (
                          <button disabled className="bg-gray-600 text-gray-400 px-3 lg:px-4 py-2 rounded-lg cursor-not-allowed w-full lg:w-auto text-sm lg:text-base">
                            <CheckCircle className="inline w-3 lg:w-4 h-3 lg:h-4 mr-2" />
                            Completed
                          </button>
                        )}
                        {interview.status === 'CANCELLED' && (
                          <button disabled className="bg-red-600/50 text-red-300 px-3 lg:px-4 py-2 rounded-lg cursor-not-allowed w-full lg:w-auto text-sm lg:text-base">
                            Cancelled
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8 text-lg">No interviews found</p>
          )}
        </div>
      </motion.div>
    </div>
  )
}