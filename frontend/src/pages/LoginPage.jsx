import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { BrainCircuit, Moon, Sun, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-4 md:p-6 bg-gradient-animated relative overflow-hidden">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-48 sm:w-72 h-48 sm:h-72 bg-purple-500/20 rounded-full blur-3xl float-animation"></div>
        <div className="absolute bottom-20 right-10 w-64 sm:w-96 h-64 sm:h-96 bg-pink-500/20 rounded-full blur-3xl float-animation" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 sm:p-3 rounded-lg sm:rounded-xl btn-gradient-primary shadow-lg hover:scale-110 transition-transform tap-target"
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? (
          <Sun className="w-5 h-5 sm:w-6 sm:h-6" />
        ) : (
          <Moon className="w-5 h-5 sm:w-6 sm:h-6" />
        )}
      </button>

      <div className="max-w-md w-full relative z-10">
        {/* Logo */}
        <div className="text-center mb-6 sm:mb-8 animate-fade-in">
          <div className="flex justify-center mb-3 sm:mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl sm:rounded-2xl blur-xl opacity-50 animate-pulse"></div>
              <div className="relative p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 shadow-2xl">
                <BrainCircuit className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gradient mb-2 flex items-center justify-center gap-2 flex-wrap px-2">
            Welcome Back
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2 px-2">Sign in to continue your interview preparation</p>
        </div>

        {/* Login Form */}
        <div className="card-glass p-5 sm:p-6 md:p-8 animate-slide-up">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {error && (
              <div className="bg-red-500/10 text-red-600 dark:text-red-400 p-3 sm:p-4 rounded-lg sm:rounded-xl text-xs sm:text-sm border-2 border-red-500/20 backdrop-blur-sm animate-fade-in">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-modern text-sm sm:text-base"
                required
                placeholder="your@email.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-modern text-sm sm:text-base"
                required
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-gradient-primary py-3 sm:py-4 text-base sm:text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed tap-target"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-5 sm:mt-6 text-center">
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-gradient font-semibold hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-5 sm:mt-6 text-center">
          <Link to="/" className="text-sm sm:text-base text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors inline-block py-2">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}


