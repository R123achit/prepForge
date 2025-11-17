import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mic, MicOff, Send, Clock, Brain, CheckCircle } from 'lucide-react'
import { aiInterviewAPI, chatbotAPI } from '../services/api'
import toast from 'react-hot-toast'

export default function AIInterviewSession() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [interview, setInterview] = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [questions, setQuestions] = useState([])
  const [answer, setAnswer] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [responses, setResponses] = useState([])
  const [isCompleted, setIsCompleted] = useState(false)

  useEffect(() => {
    fetchInterview()
  }, [id])

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [timeLeft])

  const fetchInterview = async () => {
    try {
      const { data } = await aiInterviewAPI.getById(id)
      console.log('Interview data:', data)
      setInterview(data.interview)
      
      // Extract questions from the interview data (API generated)
      const interviewQuestions = data.interview.questions || []
      if (interviewQuestions.length > 0) {
        // Store question texts for display
        const questionTexts = interviewQuestions.map(q => q.questionText || q.question || q)
        setQuestions(questionTexts)
        setTimeLeft(data.interview.duration * 60)
      } else {
        // If no questions, there's an API issue
        console.error('No questions received from API')
        toast.error('Interview questions not generated. Please try again.')
        navigate('/ai-interview')
      }
    } catch (error) {
      console.error('Failed to load interview:', error)
      toast.error('Failed to load interview')
      navigate('/ai-interview')
    }
  }

  const generateQuestions = async () => {
    try {
      const { data } = await chatbotAPI.sendMessage({
        message: `Generate 5 ${interview.interviewType} interview questions for ${interview.topic} at ${interview.difficulty} level`,
        context: 'interview_generation'
      })
      
      const generatedQuestions = data.response.split('\n').filter(q => q.trim())
      setQuestions(generatedQuestions)
    } catch (error) {
      toast.error('Failed to generate questions')
    }
  }

  const submitAnswer = async () => {
    if (!answer.trim()) return

    try {
      const response = {
        questionIndex: currentQuestion,
        question: questions[currentQuestion],
        answer: answer.trim(),
        timestamp: new Date().toISOString()
      }

      // Use the question object's ID or create one based on index
      const questionObj = interview.questions?.[currentQuestion]
      const questionId = questionObj?._id || questionObj?.id || `question_${currentQuestion}`

      await aiInterviewAPI.submitResponse(id, {
        questionId,
        responseText: answer.trim(),
        responseTime: 0
      })
      
      setResponses([...responses, response])
      setAnswer('')

      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
      } else {
        completeInterview()
      }
    } catch (error) {
      console.error('Failed to submit answer:', error)
      toast.error('Failed to submit answer')
    }
  }

  const completeInterview = async () => {
    try {
      await aiInterviewAPI.complete(id)
      setIsCompleted(true)
      toast.success('Interview completed!')
    } catch (error) {
      toast.error('Failed to complete interview')
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card max-w-2xl text-center"
        >
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h1 className="text-4xl font-bold mb-4 text-white">Interview Completed!</h1>
          <p className="text-dark-400 mb-8">
            Great job! Your responses have been analyzed and feedback will be available shortly.
          </p>
          <div className="flex gap-4 justify-center">
            <button onClick={() => navigate('/dashboard')} className="btn-primary">
              View Dashboard
            </button>
            <button onClick={() => navigate('/ai-interview')} className="btn-secondary">
              Start New Interview
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  if (!interview) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-16 h-16 text-primary-500 mx-auto mb-4 animate-pulse" />
          <p className="text-xl text-white">Loading interview...</p>
        </div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-xl text-white mb-4">No questions available</p>
          <button onClick={() => navigate('/ai-interview')} className="btn-primary">
            Back to AI Interview
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">{interview.topic}</h1>
            <p className="text-dark-400">{interview.interviewType} Interview</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-primary-400">
              <Clock className="w-5 h-5" />
              <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
            </div>
            <div className="text-dark-300">
              Question {currentQuestion + 1} of {questions?.length || 0}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-dark-800 rounded-full h-2 mb-8">
          <div 
            className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${questions?.length ? ((currentQuestion + 1) / questions.length) * 100 : 0}%` }}
          />
        </div>

        {/* Question */}
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card mb-8"
        >
          <div className="flex items-start gap-4">
            <Brain className="w-8 h-8 text-primary-500 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-xl font-semibold mb-2 text-white">Question {currentQuestion + 1}</h2>
              <p className="text-lg text-dark-200">{questions[currentQuestion] || 'Loading question...'}</p>
            </div>
          </div>
        </motion.div>

        {/* Answer Input */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold">You</span>
            </div>
            <h3 className="text-lg font-semibold text-white">Your Answer</h3>
          </div>
          
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer here..."
            className="w-full bg-dark-700 border border-dark-600 rounded-lg p-4 text-white placeholder-dark-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all resize-none"
            rows="6"
          />
          
          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsRecording(!isRecording)}
                className={`p-3 rounded-full transition-all ${
                  isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-dark-700 hover:bg-dark-600'
                }`}
              >
                {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <span className="text-sm text-dark-400">
                {isRecording ? 'Recording...' : 'Click to record voice answer'}
              </span>
            </div>
            
            <button
              onClick={submitAnswer}
              disabled={!answer.trim()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="inline w-5 h-5 mr-2" />
              {currentQuestion < (questions?.length || 1) - 1 ? 'Next Question' : 'Complete Interview'}
            </button>
          </div>
        </div>

        {/* Previous Responses */}
        {responses.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-bold mb-4 text-white">Previous Responses</h3>
            <div className="space-y-4">
              {responses.map((response, i) => (
                <div key={i} className="bg-dark-800 rounded-lg p-4">
                  <p className="text-sm text-primary-400 mb-2">Q{response.questionIndex + 1}: {response.question}</p>
                  <p className="text-dark-200">{response.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}