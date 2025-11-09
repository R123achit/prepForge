import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { BrainCircuit, Moon, Sun } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'CANDIDATE', // Default to CANDIDATE
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-4 md:p-6 transition-colors duration-200" style={{
      background: theme === 'dark' 
        ? 'linear-gradient(to bottom right, #0a0e27, #1a1a2e)' 
        : 'linear-gradient(to bottom right, #f0f9ff, #faf5ff)'
    }}>
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 sm:p-3 rounded-lg bg-white dark:bg-dark-card text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all shadow-lg tap-target"
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? (
          <Sun className="w-5 h-5 sm:w-6 sm:h-6" />
        ) : (
          <Moon className="w-5 h-5 sm:w-6 sm:h-6" />
        )}
      </button>

      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex justify-center mb-3 sm:mb-4">
            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-xl shadow-primary-500/30">
              <BrainCircuit className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white px-2">Create Your Account</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2 px-2">Start your interview preparation journey</p>
        </div>

        {/* Register Form */}
        <div className="card p-5 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-xs sm:text-sm border border-red-200 dark:border-red-800">{error}</div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label htmlFor="firstName" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="input text-sm sm:text-base"
                  required
                  autoComplete="given-name"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="input text-sm sm:text-base"
                  required
                  autoComplete="family-name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="input text-sm sm:text-base"
                required
                placeholder="your@email.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
                I want to register as
              </label>
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'CANDIDATE' })}
                  className={`p-3 sm:p-4 rounded-lg border-2 text-left transition-all transform hover:scale-105 tap-target ${
                    formData.role === 'CANDIDATE'
                      ? 'border-primary-500 bg-gradient-to-br from-primary-600 to-primary-700 shadow-lg shadow-primary-500/30'
                      : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500 bg-white dark:bg-gray-800 hover:shadow-md'
                  }`}
                >
                  <div className={`text-xl sm:text-2xl mb-1 sm:mb-2`}>👤</div>
                  <div className={`text-sm sm:text-base font-semibold mb-1 ${
                    formData.role === 'CANDIDATE' ? 'text-white' : 'text-gray-900 dark:text-white'
                  }`}>
                    Candidate
                  </div>
                  <div className={`text-xs ${
                    formData.role === 'CANDIDATE' ? 'text-white/90' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    Take interviews and practice
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'INTERVIEWER' })}
                  className={`p-3 sm:p-4 rounded-lg border-2 text-left transition-all transform hover:scale-105 tap-target ${
                    formData.role === 'INTERVIEWER'
                      ? 'border-primary-500 bg-gradient-to-br from-primary-600 to-primary-700 shadow-lg shadow-primary-500/30'
                      : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500 bg-white dark:bg-gray-800 hover:shadow-md'
                  }`}
                >
                  <div className={`text-xl sm:text-2xl mb-1 sm:mb-2`}>👨‍🏫</div>
                  <div className={`text-sm sm:text-base font-semibold mb-1 ${
                    formData.role === 'INTERVIEWER' ? 'text-white' : 'text-gray-900 dark:text-white'
                  }`}>
                    Interviewer
                  </div>
                  <div className={`text-xs ${
                    formData.role === 'INTERVIEWER' ? 'text-white/90' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    Conduct interviews and help others
                  </div>
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {formData.role === 'CANDIDATE' 
                  ? '✓ You can schedule and take interviews to practice your skills'
                  : '✓ You can accept interview requests and help others prepare'}
              </p>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="input text-sm sm:text-base"
                required
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="input text-sm sm:text-base"
                required
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn btn-primary text-sm sm:text-base py-2.5 sm:py-3 tap-target"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-5 sm:mt-6 text-center">
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}



