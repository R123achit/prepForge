import { Link } from 'react-router-dom';
import { BrainCircuit, Video, BarChart3, Users, Zap, Shield } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <BrainCircuit className="w-6 h-6 sm:w-8 sm:h-8 text-primary-700 dark:text-primary-400" />
              <span className="text-lg sm:text-xl md:text-2xl font-extrabold text-primary-700 dark:text-primary-400 tracking-tight drop-shadow-lg">PrepForge</span>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link
                to="/login"
                className="btn btn-secondary border-2 border-primary-700 text-sm sm:text-base px-3 py-1.5 sm:px-4 sm:py-2"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="btn btn-primary border-2 border-primary-700 text-sm sm:text-base px-3 py-1.5 sm:px-4 sm:py-2"
              >
                <span className="hidden sm:inline">Get Started</span>
                <span className="sm:hidden">Start</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

  {/* Hero Section */}
  <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 md:py-20">
        <div className="text-center">
          <h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 px-2"
            style={{
              color: '#0a2540',
              textShadow: '0 2px 8px rgba(0,0,0,0.10), 0 1px 0 #fff',
            }}
          >
            Master Your Interview Skills with{' '}
            <span style={{ color: '#0284c7', textShadow: '0 2px 8px rgba(0,0,0,0.10)' }}>AI-Powered</span> Practice
          </h1>
          <p
            className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 max-w-3xl mx-auto px-4"
            style={{
              color: '#1e293b',
              textShadow: '0 1px 4px rgba(0,0,0,0.08)',
              fontWeight: 500,
            }}
          >
            PrepForge combines cutting-edge AI technology with real-time human interviews to
            help you ace your next job interview. Practice, improve, and succeed.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Link
              to="/register"
              className="btn btn-primary text-base sm:text-lg px-6 sm:px-8 py-2.5 sm:py-3 border-2 border-primary-700 w-full sm:w-auto"
            >
              Start Free Trial
            </Link>
            <Link
              to="/login"
              className="btn btn-secondary text-base sm:text-lg px-6 sm:px-8 py-2.5 sm:py-3 border-2 border-primary-700 w-full sm:w-auto"
            >
              View Demo
            </Link>
          </div>
        </div>
      </section>

  {/* Features */}
  <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12 px-2">Why Choose PrepForge?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          <div className="card text-center p-4 sm:p-6">
            <div className="flex justify-center mb-3 sm:mb-4">
              <BrainCircuit className="w-10 h-10 sm:w-12 sm:h-12 text-primary-600" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2">AI-Powered Interviews</h3>
            <p className="text-sm sm:text-base text-gray-600">
              Practice with advanced AI that provides instant feedback on your responses,
              communication, and confidence.
            </p>
          </div>

          <div className="card text-center p-4 sm:p-6">
            <div className="flex justify-center mb-3 sm:mb-4">
              <Video className="w-10 h-10 sm:w-12 sm:h-12 text-primary-600" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2">Live Human Interviews</h3>
            <p className="text-sm sm:text-base text-gray-600">
              Connect with experienced interviewers for realistic practice sessions via
              secure video calls.
            </p>
          </div>

          <div className="card text-center p-4 sm:p-6">
            <div className="flex justify-center mb-3 sm:mb-4">
              <BarChart3 className="w-10 h-10 sm:w-12 sm:h-12 text-primary-600" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2">Detailed Analytics</h3>
            <p className="text-sm sm:text-base text-gray-600">
              Track your progress with comprehensive performance reports and personalized
              improvement suggestions.
            </p>
          </div>

          <div className="card text-center p-4 sm:p-6">
            <div className="flex justify-center mb-3 sm:mb-4">
              <Users className="w-10 h-10 sm:w-12 sm:h-12 text-primary-600" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2">Multiple Interview Types</h3>
            <p className="text-sm sm:text-base text-gray-600">
              Practice technical, HR, behavioral, coding, and domain-specific interviews
              tailored to your needs.
            </p>
          </div>

          <div className="card text-center p-4 sm:p-6">
            <div className="flex justify-center mb-3 sm:mb-4">
              <Zap className="w-10 h-10 sm:w-12 sm:h-12 text-primary-600" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2">Instant Feedback</h3>
            <p className="text-sm sm:text-base text-gray-600">
              Get real-time analysis on your answers, including technical accuracy and
              communication skills.
            </p>
          </div>

          <div className="card text-center p-4 sm:p-6">
            <div className="flex justify-center mb-3 sm:mb-4">
              <Shield className="w-10 h-10 sm:w-12 sm:h-12 text-primary-600" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2">Secure & Private</h3>
            <p className="text-sm sm:text-base text-gray-600">
              Your interview sessions and data are completely secure and private. We prioritize
              your confidentiality.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
  <section className="bg-primary-600 text-white py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Ready to Ace Your Next Interview?</h2>
          <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 opacity-90">
            Join thousands of successful candidates who prepared with PrepForge
          </p>
          <Link to="/register" className="btn btn-secondary bg-white text-primary-600 px-6 sm:px-8 py-2.5 sm:py-3 font-semibold hover:bg-gray-100 inline-block text-sm sm:text-base">
            Start Your Free Trial
          </Link>
        </div>
      </section>

      {/* Contact/Support Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3 sm:mb-4 dark:text-gray-100">Need Help or Have Questions?</h2>
            <p className="text-base sm:text-lg max-w-2xl mx-auto text-gray-700 font-medium dark:text-gray-200 px-2">
              Our team is here to support you. Reach out for queries, feedback, or collaboration opportunities.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-3xl mx-auto">
            <a 
              href="mailto:prepforge563@gmail.com"
              className="card hover:shadow-lg transition-shadow flex items-center space-x-3 sm:space-x-4 group p-4 sm:p-6"
            >
              <div className="bg-primary-100 p-3 sm:p-4 rounded-lg group-hover:bg-primary-200 transition-colors flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-gray-500 font-medium">Email Support</p>
                <p className="text-sm sm:text-base text-gray-900 font-semibold truncate">prepforge563@gmail.com</p>
              </div>
            </a>

            <a 
              href="tel:+917232915352"
              className="card hover:shadow-lg transition-shadow flex items-center space-x-3 sm:space-x-4 group p-4 sm:p-6"
            >
              <div className="bg-secondary-100 p-3 sm:p-4 rounded-lg group-hover:bg-secondary-200 transition-colors flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-gray-500 font-medium">Phone Support</p>
                <p className="text-sm sm:text-base text-gray-900 font-semibold">+91 7232915352</p>
              </div>
            </a>
          </div>

          <div className="text-center mt-6 sm:mt-8 px-2">
            <p className="text-sm sm:text-base text-gray-600">
              <span className="font-medium">Business Hours:</span> Monday - Saturday, 9:00 AM - 6:00 PM IST
            </p>
            <p className="text-gray-500 text-xs sm:text-sm mt-2">
              We typically respond within 24 hours
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-3 sm:mb-4">
                <BrainCircuit className="w-5 h-5 sm:w-6 sm:h-6 text-primary-400" />
                <span className="text-base sm:text-lg font-bold text-white dark:text-primary-400">PrepForge</span>
              </div>
              <p className="text-gray-300 text-xs sm:text-sm dark:text-gray-400">
                AI-powered interview preparation platform helping candidates ace their dream jobs.
              </p>
            </div>
            <div>
              <h3 className="text-gray-100 font-semibold mb-3 sm:mb-4 text-sm sm:text-base dark:text-primary-300">Quick Links</h3>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li><Link to="/login" className="text-gray-300 hover:text-primary-400 dark:text-gray-200 block py-1">Login</Link></li>
                <li><Link to="/register" className="text-gray-300 hover:text-primary-400 dark:text-gray-200 block py-1">Sign Up</Link></li>
                <li><a href="#features" className="text-gray-300 hover:text-primary-400 dark:text-gray-200 block py-1">Features</a></li>
              </ul>
            </div>
            <div className="sm:col-span-2 lg:col-span-1">
              <h3 className="text-gray-100 font-semibold mb-3 sm:mb-4 text-sm sm:text-base dark:text-primary-300">Contact Us</h3>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li>
                  <a href="mailto:prepforge563@gmail.com" className="text-gray-300 hover:text-primary-400 dark:text-gray-200 block py-1 break-all">
                    prepforge563@gmail.com
                  </a>
                </li>
                <li>
                  <a href="tel:+917232915352" className="text-gray-300 hover:text-primary-400 dark:text-gray-200 block py-1">
                    +91 7232915352
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 sm:pt-8 text-center">
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">© 2025 PrepForge. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}


