import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = JSON.parse(localStorage.getItem('auth-storage'))?.state?.token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  uploadProfilePhoto: (formData) => {
    console.log('API: Uploading profile photo...');
    return api.post('/users/profile-photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getProfilePhoto: (userId) => `${API_URL}/users/profile-photo/${userId}`,
}

export const dashboardAPI = {
  getUnified: () => api.get('/dashboard/unified'),
  getStats: () => api.get('/dashboard/stats'),
}

export const aiInterviewAPI = {
  create: (data) => api.post('/ai-interviews', data),
  getAll: () => api.get('/ai-interviews'),
  getById: (id) => api.get(`/ai-interviews/${id}`),
  submitResponse: (id, data) => api.post(`/ai-interviews/${id}/responses`, data),
  complete: (id) => api.post(`/ai-interviews/${id}/complete`),
}

export const liveInterviewAPI = {
  create: (data) => api.post('/live-interviews', data),
  getAll: (params) => api.get('/live-interviews', { params }),
  getByRoomId: (roomId) => api.get(`/live-interviews/room/${roomId}`),
  getInterviewers: () => {
    console.log('API call: GET /live-interviews/interviewers')
    return api.get('/live-interviews/interviewers')
  },
  quickConnect: (data) => api.post('/live-interviews/quick-connect', data),
  accept: (id) => api.post(`/live-interviews/${id}/accept`),
  start: (id) => api.post(`/live-interviews/${id}/start`),
  complete: (id, data) => api.put(`/live-interviews/${id}/complete`, data),
}

export const resumeAPI = {
  upload: (formData) => api.post('/resumes/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getAll: () => api.get('/resumes'),
  getById: (id) => api.get(`/resumes/${id}`),
  delete: (id) => api.delete(`/resumes/${id}`),
  download: (id) => {
    const token = JSON.parse(localStorage.getItem('auth-storage'))?.state?.token
    const url = `${API_URL}/resumes/${id}/download`
    
    // Create a temporary link for download
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', '')
    
    // Add authorization header for mobile compatibility
    if (token) {
      link.href = `${url}?token=${encodeURIComponent(token)}`
    }
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  },
}

export const chatbotAPI = {
  sendMessage: (data) => api.post('/chatbot', data),
}

export default api
