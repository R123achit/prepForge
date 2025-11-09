import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { Home, BrainCircuit, Video, User, LogOut, BarChart3, Moon, Sun, Sparkles } from 'lucide-react';
import Chatbot from './Chatbot';

export default function Layout({ children }) {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900 transition-all duration-500">
      <header className="card-glass sticky top-0 z-50 border-b border-white/20 dark:border-gray-700/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/dashboard" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-xl">
                  <BrainCircuit className="w-6 h-6 text-white" />
                </div>
              </div>
              <span className="text-2xl font-bold text-gradient">PrepForge</span>
              <span className="badge-gradient text-xs">AI</span>
            </Link>

            <nav className="hidden md:flex space-x-1">
              <Link
                to="/dashboard"
                className="flex items-center space-x-2 px-4 py-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all duration-300 group"
              >
                <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Dashboard</span>
              </Link>
              <Link
                to="/ai-interview"
                className="flex items-center space-x-2 px-4 py-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all duration-300 group"
              >
                <BrainCircuit className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="font-medium">AI Interview</span>
              </Link>
              <Link
                to="/live-interview"
                className="flex items-center space-x-2 px-4 py-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all duration-300 group"
              >
                <Video className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="font-medium">
                  {user?.role === 'INTERVIEWER' ? 'Requests' : 'Schedule'}
                </span>
              </Link>
              {user?.role === 'ADMIN' && (
                <Link
                  to="/admin"
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all duration-300 group"
                >
                  <BarChart3 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Admin</span>
                </Link>
              )}
            </nav>

            <div className="flex items-center space-x-3">
              <button
                onClick={toggleTheme}
                className="relative p-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:scale-105 transition-all duration-300"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 animate-spin-slow" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>
              
              <Link
                to="/profile"
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 group"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="hidden md:inline font-medium text-gray-900 dark:text-white">
                  {user?.firstName}
                </span>
              </Link>
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden md:inline font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl float-animation"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl float-animation" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl float-animation" style={{ animationDelay: '4s' }}></div>
        </div>
        
        <div className="relative z-10">
          {children}
        </div>
      </main>

      {user?.role === 'CANDIDATE' && <Chatbot />}

      <footer className="card-glass border-t border-white/20 dark:border-gray-700/20 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <p className="text-center text-gray-600 dark:text-gray-400 text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              © 2025 PrepForge. Powered by AI
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-600 dark:text-green-400 font-medium">
                ● Online
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
