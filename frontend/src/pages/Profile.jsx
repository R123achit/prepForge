import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Save } from 'lucide-react'
import { authAPI } from '../services/api'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

export default function Profile() {
  const { user, setAuth } = useAuthStore()
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    bio: user?.bio || '',
    skills: user?.skills || ''
  })
  const [loading, setLoading] = useState(false)

  const handleUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await authAPI.updateProfile(formData)
      setAuth(data, useAuthStore.getState().token)
      toast.success('Profile updated!')
    } catch (error) {
      toast.error('Update failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-8">
          <User className="w-10 h-10 text-primary-500" />
          <div>
            <h1 className="text-4xl font-bold">Profile Settings</h1>
            <p className="text-dark-400">Manage your account information</p>
          </div>
        </div>

        <div className="max-w-2xl">
          <div className="card">
            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">First Name</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Last Name</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  className="input bg-dark-700"
                  value={user?.email}
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Bio</label>
                <textarea
                  className="input"
                  rows="4"
                  placeholder="Tell us about yourself..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Skills</label>
                <input
                  type="text"
                  className="input"
                  placeholder="JavaScript, React, Node.js"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                />
              </div>

              <button type="submit" disabled={loading} className="btn-primary">
                <Save className="inline w-5 h-5 mr-2" />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
