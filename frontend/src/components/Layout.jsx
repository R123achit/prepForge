import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, Brain, Users, FileText, User, LogOut, Sparkles, Briefcase, Calendar, Menu, X } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { authAPI } from '../services/api'
import AIChatbot from './AIChatbot'
import { useState } from 'react'

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const candidateNavItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/ai-interview', icon: Brain, label: 'AI Interview' },
    { path: '/live-interview', icon: Users, label: 'Live Interview' },
    { path: '/resume-maker', icon: FileText, label: 'Resume' },
    { path: '/job-board', icon: Briefcase, label: 'Jobs' },
    { path: '/calendar-sync', icon: Calendar, label: 'Calendar' },
    { path: '/profile', icon: User, label: 'Profile' },
  ]

  const interviewerNavItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/live-interview', icon: Users, label: 'Interviews' },
    { path: '/profile', icon: User, label: 'Profile' },
  ]

  const navItems = user?.role === 'INTERVIEWER' ? interviewerNavItems : candidateNavItems

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-64 backdrop-blur-xl bg-white/5 border-r border-white/10 fixed h-full z-10 hidden lg:block"
      >
        <div className="p-6">
          <Link to="/dashboard" className="flex items-center gap-2 mb-8 group">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">PrepForge</span>
          </Link>

          <nav className="space-y-2">
            {navItems.map((item, index) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <motion.div
                  key={item.path}
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/25'
                        : 'text-gray-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-gray-400'
                    }`} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </motion.div>
              )
            })}
          </nav>

          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="absolute bottom-6 left-6 right-6"
          >
            <div className="glass-card p-4 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                  {user?.profileImage ? (
                    <img 
                      src={authAPI.getProfilePhoto(user.id)} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-6 h-6 text-white" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-white truncate">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
              </div>
              <div className="text-xs text-center">
                <span className="px-2 py-1 bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-300 rounded-full border border-purple-500/30">
                  {user?.role}
                </span>
              </div>
            </div>
            <motion.button 
              onClick={handleLogout} 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-secondary w-full flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </motion.button>
          </motion.div>
        </div>
      </motion.aside>

      {/* Mobile Header with Hamburger */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/10 border-b border-white/20">
        <div className="flex items-center justify-between p-4">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">PrepForge</span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMobileMenu}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
            />
            
            {/* Sidebar */}
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-64 backdrop-blur-xl bg-slate-900/95 border-r border-white/10 z-50 overflow-y-auto"
            >
              <div className="p-6">
                <Link to="/dashboard" onClick={closeMobileMenu} className="flex items-center gap-2 mb-8">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-2xl font-bold gradient-text">PrepForge</span>
                </Link>

                {/* User Profile Card */}
                <div className="glass-card p-4 mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                      {user?.profileImage ? (
                        <img 
                          src={authAPI.getProfilePhoto(user.id)} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-white truncate">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                    </div>
                  </div>
                  <div className="text-xs text-center">
                    <span className="px-2 py-1 bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-300 rounded-full border border-purple-500/30">
                      {user?.role}
                    </span>
                  </div>
                </div>

                {/* Navigation Items */}
                <nav className="space-y-2 mb-6">
                  {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = location.pathname === item.path
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={closeMobileMenu}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                          isActive
                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/25'
                            : 'text-gray-300 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    )
                  })}
                </nav>

                {/* Logout Button */}
                <button 
                  onClick={() => {
                    closeMobileMenu()
                    handleLogout()
                  }}
                  className="btn-secondary w-full flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-4 lg:p-8 relative z-10 pt-20 lg:pt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Outlet />
        </motion.div>
      </main>

      {/* AI Chatbot */}
      <AIChatbot />
    </div>
  )
}
