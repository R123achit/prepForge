import { useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { calendarAPI } from '../services/api'
import toast from 'react-hot-toast'

export default function CalendarCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code')
      const error = searchParams.get('error')
      const state = searchParams.get('state')

      if (error) {
        toast.error('Calendar connection cancelled')
        navigate('/calendar-sync')
        return
      }

      if (!code) {
        toast.error('No authorization code received')
        navigate('/calendar-sync')
        return
      }

      try {
        await calendarAPI.connectGoogle({ code })
        toast.success('Google Calendar connected successfully!')
        navigate('/calendar-sync')
      } catch (error) {
        console.error('Calendar callback error:', error)
        toast.error('Failed to connect calendar')
        navigate('/calendar-sync')
      }
    }

    handleCallback()
  }, [searchParams, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold mb-2">Connecting Calendar...</h2>
        <p className="text-gray-400">Please wait while we complete the connection.</p>
      </div>
    </div>
  )
}