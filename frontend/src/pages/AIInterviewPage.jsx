import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrainCircuit, Zap, Code, MessageSquare, Briefcase } from 'lucide-react';
import api from '../services/api';

export default function AIInterviewPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    interviewType: 'TECHNICAL',
    topic: '',
    difficulty: 'MEDIUM',
    duration: 30,
  });

  // Must match backend validator in routes: TECHNICAL, HR, APTITUDE, BEHAVIORAL, DOMAIN_SPECIFIC, CODING, SYSTEM_DESIGN
  const interviewTypes = [
    { value: 'TECHNICAL', label: 'Technical', icon: Code },
    { value: 'HR', label: 'HR', icon: MessageSquare },
    { value: 'APTITUDE', label: 'Aptitude', icon: BrainCircuit },
    { value: 'BEHAVIORAL', label: 'Behavioral', icon: MessageSquare },
    { value: 'DOMAIN_SPECIFIC', label: 'Domain Specific', icon: Briefcase },
    { value: 'CODING', label: 'Coding', icon: Code },
    { value: 'SYSTEM_DESIGN', label: 'System Design', icon: Briefcase },
  ];

  const difficulties = [
    { value: 'EASY', label: 'Easy', description: 'Entry level questions' },
    { value: 'MEDIUM', label: 'Medium', description: 'Intermediate concepts' },
    { value: 'HARD', label: 'Hard', description: 'Advanced topics' },
  ];

  const topicSuggestions = {
    TECHNICAL: ['Machine Learning', 'DSA', 'Web Development', 'Data Analytics', 'Cloud Computing', 'Cybersecurity'],
    HR: ['Culture Fit', 'Strengths & Weaknesses', 'Career Goals', 'Work-Life Balance'],
    APTITUDE: ['Logical Reasoning', 'Quantitative', 'Verbal Ability', 'Pattern Recognition'],
    BEHAVIORAL: ['Leadership', 'Teamwork', 'Communication', 'Conflict Resolution', 'Problem Solving'],
    DOMAIN_SPECIFIC: ['Machine Learning', 'Web Development', 'Mobile Development', 'DevOps', 'Data Science', 'AI/NLP'],
    CODING: ['DSA', 'Algorithms', 'Data Structures', 'Competitive Programming', 'Problem Solving'],
    SYSTEM_DESIGN: ['Scalability', 'Microservices', 'Databases', 'Caching', 'Load Balancing', 'API Design'],
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Backend expects: interviewType, topic, difficulty (optional), duration (15-120)
      const payload = {
        interviewType: formData.interviewType,
        topic: formData.topic,
        difficulty: formData.difficulty,
        duration: formData.duration,
      };
      const response = await api.post('/ai-interviews', payload);
      const interviewId = response.data?.interview?.id;
      if (interviewId) {
        navigate(`/ai-interview-room/${interviewId}`);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create interview. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#0a2540] to-[#1e3a5f] rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-2xl border border-blue-500/20">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white flex items-center gap-3 flex-wrap">
          <BrainCircuit className="w-7 h-7 sm:w-8 sm:h-8 text-blue-300" />
          AI-Powered Mock Interview
        </h1>
        <p className="text-blue-100 mt-2 text-sm sm:text-base">
          Practice with our AI interviewer and get instant feedback on your responses
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-br from-[#0a2540] to-[#1e3a5f] rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8 shadow-2xl border border-blue-500/20">
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-6">Create New Interview</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-500/10 text-red-300 p-3 rounded-lg text-sm border border-red-400/30">{error}</div>
              )}

              {/* Interview Type */}
              <div>
                <label className="block text-sm font-medium text-white mb-3">
                  Interview Type
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {interviewTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, interviewType: type.value, topic: '' })}
                        className={`p-3 sm:p-4 rounded-lg border-2 transition-all ${
                          formData.interviewType === type.value
                            ? 'border-blue-400 bg-blue-500/20'
                            : 'border-blue-500/30 hover:border-blue-400/50 bg-blue-500/5'
                        }`}
                      >
                        <Icon className={`w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2 ${
                          formData.interviewType === type.value ? 'text-blue-300' : 'text-blue-400'
                        }`} />
                        <div className={`text-xs sm:text-sm font-medium ${
                          formData.interviewType === type.value ? 'text-white' : 'text-blue-200'
                        }`}>{type.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Topic */}
              <div>
                <label htmlFor="topic" className="block text-sm font-medium text-white mb-2">
                  Domain / Focus Area
                </label>
                <input
                  id="topic"
                  type="text"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  className="w-full px-4 py-3 bg-blue-900/30 border-2 border-blue-500/30 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  placeholder="e.g., Machine Learning, DSA, Web Development, Data Analytics"
                  required
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  {topicSuggestions[formData.interviewType]?.map((topic) => (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => setFormData({ ...formData, topic })}
                      className="px-3 py-1 text-xs bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 rounded-full text-blue-200 transition-colors"
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-sm font-medium text-white mb-3">
                  Difficulty Level
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {difficulties.map((diff) => (
                    <button
                      key={diff.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, difficulty: diff.value })}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        formData.difficulty === diff.value
                          ? 'border-blue-400 bg-blue-500/20'
                          : 'border-blue-500/30 hover:border-blue-400/50 bg-blue-500/5'
                      }`}
                    >
                      <div className={`font-medium ${
                        formData.difficulty === diff.value ? 'text-blue-300' : 'text-white'
                      }`}>
                        {diff.label}
                      </div>
                      <div className="text-xs text-blue-200 mt-1">{diff.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-white mb-2">
                  Duration (minutes)
                </label>
                <select
                  id="duration"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 bg-blue-900/30 border-2 border-blue-500/30 rounded-lg text-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  required
                >
                  {[15, 30, 45, 60, 90, 120].map((d) => (
                    <option key={d} value={d} className="bg-[#0a2540]">{d} minutes</option>
                  ))}
                </select>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-base sm:text-lg"
              >
                {loading ? (
                  'Creating Interview...'
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Start AI Interview
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-[#0a2540] to-[#1e3a5f] rounded-xl p-5 sm:p-6 shadow-2xl border border-blue-500/20">
            <h3 className="font-semibold text-white mb-4 text-base sm:text-lg">How it works</h3>
            <ol className="space-y-4 text-sm text-blue-100">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-7 h-7 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-full flex items-center justify-center text-xs font-bold">
                  1
                </span>
                <span>Select your interview type and topic</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-7 h-7 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-full flex items-center justify-center text-xs font-bold">
                  2
                </span>
                <span>AI generates personalized questions</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-7 h-7 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-full flex items-center justify-center text-xs font-bold">
                  3
                </span>
                <span>Answer questions in the interview room</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-7 h-7 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-full flex items-center justify-center text-xs font-bold">
                  4
                </span>
                <span>Get instant AI feedback and scoring</span>
              </li>
            </ol>
          </div>

          <div className="card bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">💡 Pro Tips</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>• Be specific with your topic</li>
              <li>• Start with easier questions</li>
              <li>• Practice regularly for best results</li>
              <li>• Review feedback after each session</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}




