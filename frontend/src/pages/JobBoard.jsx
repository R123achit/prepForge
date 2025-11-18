import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, MapPin, Briefcase, ExternalLink, Filter, Linkedin, Building } from 'lucide-react'
import { jobBoardAPI } from '../services/api'
import toast from 'react-hot-toast'

export default function JobBoard() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [location, setLocation] = useState('')
  const [selectedSources, setSelectedSources] = useState(['indeed'])

  const searchJobs = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a job title or keyword')
      return
    }

    setLoading(true)
    try {
      console.log('Searching jobs with:', { searchQuery, location, selectedSources })
      const response = await jobBoardAPI.searchJobs({
        query: searchQuery,
        location,
        sources: selectedSources.join(','),
        limit: 25
      })

      console.log('Job search response:', response.data)
      
      if (response.data.success) {
        setJobs(response.data.jobs)
        toast.success(`Found ${response.data.jobs.length} jobs`)
      } else {
        console.error('Job search failed:', response.data.error)
        toast.error(response.data.error || 'Failed to search jobs')
      }
    } catch (error) {
      console.error('Job search error:', error)
      toast.error(error.response?.data?.error || 'Error searching jobs')
    } finally {
      setLoading(false)
    }
  }

  const handleSourceToggle = (source) => {
    setSelectedSources(prev => 
      prev.includes(source) 
        ? prev.filter(s => s !== source)
        : [...prev, source]
    )
  }

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-8">
          <Briefcase className="w-10 h-10 text-primary-500" />
          <div>
            <h1 className="text-4xl font-bold">Job Board</h1>
            <p className="text-dark-400">Find relevant jobs from top job boards</p>
          </div>
        </div>

        {/* Search Section */}
        <div className="card mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">Job Title / Keywords</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  className="input pl-10"
                  placeholder="e.g. Software Engineer, Data Analyst"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchJobs()}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Location (Optional)</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  className="input pl-10"
                  placeholder="e.g. New York, Remote"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchJobs()}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Job Sources</label>
              <div className="flex gap-2">
                <button
                  onClick={() => handleSourceToggle('indeed')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                    selectedSources.includes('indeed')
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <Building className="w-4 h-4" />
                  Indeed
                </button>
                <button
                  onClick={() => handleSourceToggle('linkedin')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                    selectedSources.includes('linkedin')
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={searchJobs}
            disabled={loading || !searchQuery.trim()}
            className="btn-primary w-full md:w-auto"
          >
            <Search className="inline w-5 h-5 mr-2" />
            {loading ? 'Searching...' : 'Search Jobs'}
          </button>
        </div>

        {/* Results Section */}
        {jobs.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Job Results ({jobs.length})</h2>
            {jobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card hover:bg-white/10 transition-all cursor-pointer"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-semibold text-white">{job.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        job.source === 'linkedin' 
                          ? 'bg-blue-600/20 text-blue-300' 
                          : 'bg-green-600/20 text-green-300'
                      }`}>
                        {job.source}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-gray-400 mb-3">
                      <span className="flex items-center gap-1">
                        <Building className="w-4 h-4" />
                        {job.company}
                      </span>
                      {job.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {job.location}
                        </span>
                      )}
                      {job.date && (
                        <span className="text-sm">{job.date}</span>
                      )}
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {job.snippet}
                    </p>
                  </div>
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary ml-4 flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Job
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && jobs.length === 0 && searchQuery && (
          <div className="text-center py-12">
            <Briefcase className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No jobs found</h3>
            <p className="text-gray-400">Try adjusting your search criteria or keywords</p>
          </div>
        )}

        {/* Initial State */}
        {!searchQuery && jobs.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Search for Jobs</h3>
            <p className="text-gray-400">Enter a job title or keywords to find relevant positions</p>
          </div>
        )}
      </motion.div>
    </div>
  )
}