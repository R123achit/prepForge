import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Save, Camera, Upload } from 'lucide-react'
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
  const [photoLoading, setPhotoLoading] = useState(false)
  const [photoPreview, setPhotoPreview] = useState(null)

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

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB')
      return
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPG, PNG, and GIF files are allowed')
      return
    }

    // Preview
    const reader = new FileReader()
    reader.onload = () => setPhotoPreview(reader.result)
    reader.readAsDataURL(file)

    // Upload
    setPhotoLoading(true)
    const formData = new FormData()
    formData.append('photo', file)

    try {
      console.log('Uploading photo...', file.name, file.size)
      const response = await authAPI.uploadProfilePhoto(formData)
      console.log('Upload response:', response)
      
      const { data } = await authAPI.getProfile()
      setAuth(data.user, useAuthStore.getState().token)
      toast.success('Profile photo updated!')
    } catch (error) {
      console.error('Photo upload error:', error)
      toast.error(error.response?.data?.error || 'Photo upload failed')
      setPhotoPreview(null)
    } finally {
      setPhotoLoading(false)
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
            {/* Profile Photo Section */}
            <div className="flex items-center gap-6 mb-8 pb-6 border-b border-white/10">
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                  {photoPreview || user?.profileImage ? (
                    <img 
                      src={photoPreview || authAPI.getProfilePhoto(user.id)} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-white" />
                  )}
                </div>
                {photoLoading && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Profile Photo</h3>
                <p className="text-sm text-gray-400 mb-3">Upload a photo to personalize your profile</p>
                <label className="btn-secondary text-sm cursor-pointer">
                  <Camera className="inline w-4 h-4 mr-2" />
                  Change Photo
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

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
                  className="input opacity-60"
                  value={user?.email}
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Role</label>
                <input
                  type="text"
                  className="input opacity-60"
                  value={user?.role}
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
