import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Settings, ExternalLink, Check, X, Clock, Bell } from 'lucide-react'
import { calendarAPI } from '../services/api'
import toast from 'react-hot-toast'

export default function CalendarSync() {
  const [integrations, setIntegrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(null)

  useEffect(() => {
    fetchIntegrations()
  }, [])

  const fetchIntegrations = async () => {
    try {
      const response = await calendarAPI.getIntegrations()
      setIntegrations(response.data.integrations)
    } catch (error) {
      console.error('Failed to fetch integrations:', error)
    } finally {
      setLoading(false)
    }
  }

  const connectCalendar = async (provider) => {
    setConnecting(provider)
    try {
      const response = await calendarAPI.getAuthUrl(provider)
      const authUrl = response.data.authUrl
      
      // Open OAuth flow in popup
      const popup = window.open(authUrl, 'Calendar OAuth', 'width=600,height=700,left=200,top=100')
      
      if (!popup) {
        toast.error('Please allow popups for this site')
        setConnecting(null)
        return
      }
      
      // Listen for callback completion
      const checkConnection = setInterval(async () => {
        try {
          const response = await fetchIntegrations()
          const hasIntegration = integrations.some(i => i.provider === provider && i.isActive)
          if (hasIntegration) {
            clearInterval(checkConnection)
            toast.success('Google Calendar connected!')
            setConnecting(null)
            if (popup && !popup.closed) {
              popup.close()
            }
          }
        } catch (error) {
          // Continue checking
        }
      }, 2000)

      // Stop checking after 2 minutes
      setTimeout(() => {
        clearInterval(checkConnection)
        if (connecting === provider) {
          setConnecting(null)
          toast.error('Connection timeout. Please try again.')
        }
      }, 120000)
    } catch (error) {
      console.error('Calendar connection error:', error)
      toast.error(error.response?.data?.error || `Failed to connect ${provider} calendar`)
      setConnecting(null)
    }
  }

  const disconnectCalendar = async (provider) => {
    try {
      await calendarAPI.disconnect(provider)
      setIntegrations(prev => prev.filter(i => i.provider !== provider))
      toast.success('Google Calendar disconnected')
    } catch (error) {
      toast.error('Failed to disconnect calendar')
    }
  }

  const updateSettings = async (provider, newSettings) => {
    try {
      const response = await calendarAPI.updateSettings(provider, newSettings)
      setIntegrations(prev => 
        prev.map(i => i.provider === provider ? response.data.integration : i)
      )
      toast.success('Settings updated')
    } catch (error) {
      toast.error('Failed to update settings')
    }
  }

  const createTestEvent = async (provider) => {
    try {
      await calendarAPI.createEvent({
        interviewId: 'test-123',
        interviewType: 'ai',
        provider
      })
      toast.success('Test event created in your calendar!')
    } catch (error) {
      toast.error('Failed to create test event')
    }
  }

  const getIntegration = (provider) => {
    return integrations.find(i => i.provider === provider)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-8">
          <Calendar className="w-10 h-10 text-primary-500" />
          <div>
            <h1 className="text-4xl font-bold">Calendar Sync</h1>
            <p className="text-dark-400">Connect your calendar to sync interview schedules</p>
          </div>
        </div>

        <div className="max-w-2xl">
          {/* Google Calendar */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Google Calendar</h3>
                  <p className="text-gray-400 text-sm">Sync with Google Calendar</p>
                </div>
              </div>
              {getIntegration('google')?.isActive ? (
                <div className="flex items-center gap-2 text-green-400">
                  <Check className="w-5 h-5" />
                  <span className="text-sm">Connected</span>
                </div>
              ) : (
                <X className="w-5 h-5 text-gray-500" />
              )}
            </div>

            {getIntegration('google')?.isActive ? (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => createTestEvent('google')}
                    className="btn-secondary text-sm"
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Test Event
                  </button>
                  <button
                    onClick={() => disconnectCalendar('google')}
                    className="btn-secondary text-sm text-red-400 hover:text-red-300"
                  >
                    Disconnect
                  </button>
                </div>

                <CalendarSettings
                  integration={getIntegration('google')}
                  onUpdate={(settings) => updateSettings('google', settings)}
                />
              </div>
            ) : (
              <button
                onClick={() => connectCalendar('google')}
                disabled={connecting === 'google'}
                className="btn-primary w-full"
              >
                {connecting === 'google' ? 'Connecting...' : 'Connect Google Calendar'}
              </button>
            )}
          </div>

        </div>

        {/* Features Info */}
        <div className="card mt-8">
          <h3 className="text-xl font-semibold mb-4">Calendar Sync Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Bell className="w-5 h-5 text-purple-400 mt-1" />
              <div>
                <h4 className="font-medium">Auto Reminders</h4>
                <p className="text-sm text-gray-400">Get notified before interviews</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-purple-400 mt-1" />
              <div>
                <h4 className="font-medium">Schedule Sync</h4>
                <p className="text-sm text-gray-400">Interviews appear in your calendar</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ExternalLink className="w-5 h-5 text-purple-400 mt-1" />
              <div>
                <h4 className="font-medium">Direct Links</h4>
                <p className="text-sm text-gray-400">Join interviews from calendar events</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Settings className="w-5 h-5 text-purple-400 mt-1" />
              <div>
                <h4 className="font-medium">Custom Settings</h4>
                <p className="text-sm text-gray-400">Configure sync preferences</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function CalendarSettings({ integration, onUpdate }) {
  const [settings, setSettings] = useState(integration?.settings || {})

  const handleSettingChange = (key, value) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    onUpdate(newSettings)
  }

  return (
    <div className="space-y-3 p-4 bg-white/5 rounded-lg">
      <h4 className="font-medium text-sm">Sync Settings</h4>
      
      <label className="flex items-center justify-between">
        <span className="text-sm">Auto-sync interviews</span>
        <input
          type="checkbox"
          checked={settings.autoSync}
          onChange={(e) => handleSettingChange('autoSync', e.target.checked)}
          className="toggle"
        />
      </label>

      <label className="flex items-center justify-between">
        <span className="text-sm">Sync AI interviews</span>
        <input
          type="checkbox"
          checked={settings.syncAIInterviews}
          onChange={(e) => handleSettingChange('syncAIInterviews', e.target.checked)}
          className="toggle"
        />
      </label>

      <label className="flex items-center justify-between">
        <span className="text-sm">Sync live interviews</span>
        <input
          type="checkbox"
          checked={settings.syncLiveInterviews}
          onChange={(e) => handleSettingChange('syncLiveInterviews', e.target.checked)}
          className="toggle"
        />
      </label>

      <div className="flex items-center justify-between">
        <span className="text-sm">Reminder (minutes)</span>
        <select
          value={settings.reminderMinutes}
          onChange={(e) => handleSettingChange('reminderMinutes', parseInt(e.target.value))}
          className="bg-white/10 border border-white/20 rounded px-2 py-1 text-sm"
        >
          <option value={5}>5 minutes</option>
          <option value={15}>15 minutes</option>
          <option value={30}>30 minutes</option>
          <option value={60}>1 hour</option>
        </select>
      </div>
    </div>
  )
}