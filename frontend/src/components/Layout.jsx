import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { Home, BrainCircuit, Video, User, LogOut, BarChart3, Moon, Sun, Sparkles } from 'lucide-react';
import Chatbot from './Chatbot';

export default function Layout({ children }) {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900 transition-all duration-500">
      <header className="card-glass sticky top-0 z-50 border-b border-white/20 dark:border-gray-700/20">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center space-x-2 sm:space-x-3 group flex-shrink-0">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg sm:rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 p-1.5 sm:p-2 rounded-lg sm:rounded-xl">
                  <BrainCircuit className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
              <span className="text-lg sm:text-2xl font-bold text-gradient">PrepForge</span>
              <span className="badge-gradient text-xs hidden xs:inline-block">AI</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex space-x-1">
              <Link
                to="/dashboard"
                className="flex items-center space-x-2 px-3 xl:px-4 py-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all duration-300 group"
              >
                <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="font-medium text-sm xl:text-base">Dashboard</span>
              </Link>
              <Link
                to="/ai-interview"
                className="flex items-center space-x-2 px-3 xl:px-4 py-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all duration-300 group"
              >
                <BrainCircuit className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="font-medium text-sm xl:text-base">AI Interview</span>
              </Link>
              <Link
                to="/live-interview"
                className="flex items-center space-x-2 px-3 xl:px-4 py-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all duration-300 group"
              >
                <Video className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="font-medium text-sm xl:text-base">
                  {user?.role === 'INTERVIEWER' ? 'Requests' : 'Schedule'}
                </span>
              </Link>
              {user?.role === 'ADMIN' && (
                <Link
                  to="/admin"
                  className="flex items-center space-x-2 px-3 xl:px-4 py-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all duration-300 group"
                >
                  <BarChart3 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span className="font-medium text-sm xl:text-base">Admin</span>
                </Link>
              )}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="relative p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:scale-105 transition-all duration-300"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <Moon className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </button>
              
              {/* Profile Link - Desktop */}
              <Link
                to="/profile"
                className="hidden sm:flex items-center space-x-2 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 group"
              >
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
                  <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
                <span className="hidden lg:inline font-medium text-gray-900 dark:text-white text-sm">
                  {user?.firstName}
                </span>
              </Link>
              
              {/* Logout - Desktop */}
              <button
                onClick={handleLogout}
                className="hidden sm:flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300"
              >
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden lg:inline font-medium text-sm">Logout</span>
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all"
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-white/20 dark:border-gray-700/20 animate-fade-in">
              <nav className="flex flex-col space-y-2">
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all"
                >
                  <Home className="w-5 h-5" />
                  <span className="font-medium">Dashboard</span>
                </Link>
                <Link
                  to="/ai-interview"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all"
                >
                  <BrainCircuit className="w-5 h-5" />
                  <span className="font-medium">AI Interview</span>
                </Link>
                <Link
                  to="/live-interview"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all"
                >
                  <Video className="w-5 h-5" />
                  <span className="font-medium">
                    {user?.role === 'INTERVIEWER' ? 'Requests' : 'Schedule'}
                  </span>
                </Link>
                {user?.role === 'ADMIN' && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all"
                  >
                    <BarChart3 className="w-5 h-5" />
                    <span className="font-medium">Admin</span>
                  </Link>
                )}
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex sm:hidden items-center space-x-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all"
                >
                  <User className="w-5 h-5" />
                  <span className="font-medium">Profile</span>
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex sm:hidden items-center space-x-3 px-4 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all text-left"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </nav>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 relative">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-48 sm:w-72 h-48 sm:h-72 bg-purple-500/10 rounded-full blur-3xl float-animation"></div>
          <div className="absolute bottom-20 right-10 w-64 sm:w-96 h-64 sm:h-96 bg-pink-500/10 rounded-full blur-3xl float-animation" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-48 sm:w-64 h-48 sm:h-64 bg-blue-500/10 rounded-full blur-3xl float-animation" style={{ animationDelay: '4s' }}></div>
        </div>
        
        <div className="relative z-10">
          {children}
        </div>
      </main>

      {user?.role === 'CANDIDATE' && <Chatbot />}

      <footer className="card-glass border-t border-white/20 dark:border-gray-700/20 mt-auto">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
            <p className="text-center sm:text-left text-gray-600 dark:text-gray-400 text-xs sm:text-sm flex items-center gap-2">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500" />
              © 2025 PrepForge. Powered by AI
            </p>
            <div className="flex items-center gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              <span className="px-2 sm:px-3 py-1 rounded-full bg-green-500/20 text-green-600 dark:text-green-400 font-medium">
                ● Online
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
