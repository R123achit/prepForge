import { useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Upload, Loader } from 'lucide-react'
import { resumeAPI } from '../services/api'
import toast from 'react-hot-toast'

export default function ResumeMaker() {
  const [file, setFile] = useState(null)
  const [formData, setFormData] = useState({ jobRole: '', targetCompany: '' })
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState(null)

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file) return toast.error('Please select a file')

    setLoading(true)
    const data = new FormData()
    data.append('resume', file)
    data.append('jobRole', formData.jobRole)
    data.append('targetCompany', formData.targetCompany)

    try {
      const { data: result } = await resumeAPI.upload(data)
      toast.success('Resume uploaded! Analysis in progress...')
      
      // Poll for analysis result
      setTimeout(async () => {
        try {
          const { data: resume } = await resumeAPI.getById(result.resumeId)
          setAnalysis(resume.resume)
          toast.success('Analysis complete!')
        } catch (error) {
          toast.error('Analysis taking longer than expected')
        }
      }, 5000)
    } catch (error) {
      toast.error(error.response?.data?.error || 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-8">
          <FileText className="w-10 h-10 text-primary-500" />
          <div>
            <h1 className="text-4xl font-bold">Resume Analyzer</h1>
            <p className="text-dark-400">Get AI-powered feedback on your resume</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="card">
            <h2 className="text-2xl font-bold mb-6">Upload Resume</h2>
            <form onSubmit={handleUpload} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Resume File</label>
                <div className="border-2 border-dashed border-dark-600 rounded-lg p-8 text-center hover:border-primary-500 transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="hidden"
                    id="resume-upload"
                  />
                  <label htmlFor="resume-upload" className="cursor-pointer">
                    <Upload className="w-12 h-12 text-dark-400 mx-auto mb-3" />
                    <p className="text-dark-300">{file ? file.name : 'Click to upload PDF, DOC, or DOCX'}</p>
                    <p className="text-sm text-dark-500 mt-2">Max size: 5MB</p>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Target Job Role</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g., Frontend Developer"
                  value={formData.jobRole}
                  onChange={(e) => setFormData({ ...formData, jobRole: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Target Company (Optional)</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g., Google"
                  value={formData.targetCompany}
                  onChange={(e) => setFormData({ ...formData, targetCompany: e.target.value })}
                />
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? <><Loader className="inline w-5 h-5 mr-2 animate-spin" /> Analyzing...</> : <><Upload className="inline w-5 h-5 mr-2" /> Analyze Resume</>}
              </button>
            </form>
          </div>

          {analysis && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="card">
                <h3 className="text-2xl font-bold mb-4">Analysis Results</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Overall Score</span>
                      <span className="font-bold text-primary-400">{analysis.overallScore}%</span>
                    </div>
                    <div className="w-full bg-dark-700 rounded-full h-3">
                      <div className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full" style={{ width: `${analysis.overallScore}%` }} />
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2 text-green-400">✓ Strengths</h4>
                    <ul className="space-y-1 text-sm text-dark-300">
                      {analysis.strengths?.map((s, i) => <li key={i}>• {s}</li>)}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2 text-orange-400">⚠ Improvements</h4>
                    <ul className="space-y-1 text-sm text-dark-300">
                      {analysis.improvements?.map((s, i) => <li key={i}>• {s}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
