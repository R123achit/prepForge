import { useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Download, Plus, Trash2, Eye } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ResumeBuilder() {
  const [resumeData, setResumeData] = useState({
    name: '',
    email: '',
    phone: '',
    website: '',
    linkedin: '',
    github: '',
    summary: '',
    experience: [{ designation: '', company: '', duration: '', description: '' }],
    education: [{ degree: '', institution: '', year: '', gpa: '' }],
    projects: [{ title: '', link: '', description: '' }],
    skills: [''],
    publications: [{ title: '', journal: '', year: '', link: '' }]
  })

  const [showPreview, setShowPreview] = useState(true)

  const updateField = (section, index, field, value) => {
    const newData = { ...resumeData }
    if (index !== undefined) {
      newData[section][index][field] = value
    } else {
      newData[section] = value
    }
    setResumeData(newData)
  }

  const addItem = (section) => {
    const newData = { ...resumeData }
    const templates = {
      experience: { designation: '', company: '', duration: '', description: '' },
      education: { degree: '', institution: '', year: '', gpa: '' },
      projects: { title: '', link: '', description: '' },
      skills: '',
      publications: { title: '', journal: '', year: '', link: '' }
    }
    newData[section].push(templates[section])
    setResumeData(newData)
  }

  const removeItem = (section, index) => {
    const newData = { ...resumeData }
    newData[section].splice(index, 1)
    setResumeData(newData)
  }

  const downloadPDF = () => {
    // For mobile compatibility, use a different approach
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    
    if (isMobile) {
      // On mobile, open print dialog directly
      window.print()
      toast.success('Use your browser\'s print option to save as PDF')
    } else {
      // Desktop: use the existing print window approach
      const printWindow = window.open('', '', 'width=800,height=600')
      const resumeContent = document.getElementById('resume-preview').innerHTML
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${resumeData.name || 'Resume'}</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { 
                font-family: 'Times New Roman', Times, serif; 
                margin: 0; 
                padding: 32px; 
                line-height: 1.4;
                color: #000;
                font-size: 11px;
              }
              h1 { font-size: 24px; margin-bottom: 16px; text-align: center; }
              h2 { 
                font-size: 11px; 
                margin-top: 16px; 
                margin-bottom: 8px;
                border-bottom: 1px solid #000;
                padding-bottom: 2px;
                text-transform: uppercase;
                letter-spacing: 1px;
                font-weight: bold;
              }
              h3 { font-size: 10px; margin-bottom: 2px; font-weight: bold; }
              p, li { font-size: 10px; line-height: 1.4; }
              a { color: #0066cc; text-decoration: none; }
              .text-center { text-align: center; }
              .flex { display: flex; }
              .justify-between { justify-content: space-between; }
              .justify-center { justify-content: center; }
              .flex-wrap { flex-wrap: wrap; }
              .gap-1 { gap: 4px; }
              .gap-3 { gap: 12px; }
              .items-center { align-items: center; }
              .w-4 { width: 16px; }
              .h-4 { height: 16px; }
              svg { display: inline-block; vertical-align: middle; }
              .mb-2 { margin-bottom: 8px; }
              .mb-3 { margin-bottom: 12px; }
              .mb-4 { margin-bottom: 16px; }
              .mb-6 { margin-bottom: 24px; }
              .mt-1 { margin-top: 4px; }
              .mt-8 { margin-top: 32px; }
              .ml-4 { margin-left: 16px; }
              .text-sm { font-size: 11px; }
              .text-xs { font-size: 10px; }
              .italic { font-style: italic; }
              .font-bold { font-weight: bold; }
              .text-blue-600 { color: #0066cc; }
              .text-gray-600 { color: #666; }
              .whitespace-pre-wrap { white-space: pre-wrap; }
              @media print {
                body { margin: 0; padding: 32px; font-size: 10px; }
                @page { margin: 0.75in; size: A4; }
                h1 { font-size: 20px; }
                h2 { font-size: 10px; }
                h3 { font-size: 9px; }
                p, li { font-size: 9px; }
              }
            </style>
          </head>
          <body>
            ${resumeContent}
          </body>
        </html>
      `)
      
      printWindow.document.close()
      printWindow.focus()
      
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
        toast.success('Resume ready to download!')
      }, 250)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 lg:p-8 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />
        <motion.div
          className="absolute top-20 left-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.6, 0.3, 0.6],
          }}
          transition={{ duration: 4, repeat: Infinity, delay: 2 }}
        />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 lg:gap-0 mb-6 lg:mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold gradient-text">Resume Builder</h1>
              <p className="text-gray-400 text-lg">Create your professional resume</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="btn-secondary flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <Eye className="w-5 h-5" />
              {showPreview ? 'Hide' : 'Show'} Preview
            </button>
            <div className="w-full sm:w-auto">
              <button onClick={downloadPDF} className="btn-primary flex items-center justify-center gap-2 w-full">
                <Download className="w-5 h-5" />
                Download PDF
              </button>
              <p className="mobile-download-hint">
                On mobile: Use "Save as PDF" in print options
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-4 lg:p-6"
            >
              <h2 className="text-xl lg:text-2xl font-bold mb-4 gradient-text">Personal Information</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Your Name"
                  className="input"
                  value={resumeData.name}
                  onChange={(e) => updateField('name', undefined, undefined, e.target.value)}
                />
                <input
                  type="email"
                  placeholder="email@example.com"
                  className="input"
                  value={resumeData.email}
                  onChange={(e) => updateField('email', undefined, undefined, e.target.value)}
                />
                <input
                  type="tel"
                  placeholder="+00.00.000.000"
                  className="input"
                  value={resumeData.phone}
                  onChange={(e) => updateField('phone', undefined, undefined, e.target.value)}
                />
                <input
                  type="text"
                  placeholder="mysite.com"
                  className="input"
                  value={resumeData.website}
                  onChange={(e) => updateField('website', undefined, undefined, e.target.value)}
                />
                <input
                  type="text"
                  placeholder="LinkedIn username"
                  className="input"
                  value={resumeData.linkedin}
                  onChange={(e) => updateField('linkedin', undefined, undefined, e.target.value)}
                />
                <input
                  type="text"
                  placeholder="GitHub username"
                  className="input"
                  value={resumeData.github}
                  onChange={(e) => updateField('github', undefined, undefined, e.target.value)}
                />
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card p-4 lg:p-6"
            >
              <h2 className="text-xl lg:text-2xl font-bold mb-4 gradient-text">Summary</h2>
              <textarea
                placeholder="Brief professional summary..."
                className="input resize-none"
                rows="4"
                value={resumeData.summary}
                onChange={(e) => updateField('summary', undefined, undefined, e.target.value)}
              />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card p-4 lg:p-6"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-4">
                <h2 className="text-xl lg:text-2xl font-bold gradient-text">Work Experience</h2>
                <button onClick={() => addItem('experience')} className="btn-secondary text-sm w-full sm:w-auto">
                  <Plus className="w-4 h-4 inline mr-1" /> Add
                </button>
              </div>
              {resumeData.experience.map((exp, idx) => (
                <div key={idx} className="mb-4 p-3 lg:p-4 bg-slate-800/95 backdrop-blur-xl border border-slate-600/50 rounded-xl relative">
                  <button onClick={() => removeItem('experience', idx)} className="absolute top-2 right-2 text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="pr-8">
                    <input
                      type="text"
                      placeholder="Designation"
                      className="input mb-2"
                      value={exp.designation}
                      onChange={(e) => updateField('experience', idx, 'designation', e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Company"
                      className="input mb-2"
                      value={exp.company}
                      onChange={(e) => updateField('experience', idx, 'company', e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Jan 2021 - present"
                      className="input mb-2"
                      value={exp.duration}
                      onChange={(e) => updateField('experience', idx, 'duration', e.target.value)}
                    />
                    <textarea
                      placeholder="Description..."
                      className="input resize-none"
                      rows="3"
                      value={exp.description}
                      onChange={(e) => updateField('experience', idx, 'description', e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="glass-card p-4 lg:p-6"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-4">
                <h2 className="text-xl lg:text-2xl font-bold gradient-text">Education</h2>
                <button onClick={() => addItem('education')} className="btn-secondary text-sm w-full sm:w-auto">
                  <Plus className="w-4 h-4 inline mr-1" /> Add
                </button>
              </div>
              {resumeData.education.map((edu, idx) => (
                <div key={idx} className="mb-4 p-4 bg-slate-800/95 backdrop-blur-xl border border-slate-600/50 rounded-xl relative">
                  <button onClick={() => removeItem('education', idx)} className="absolute top-2 right-2 text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="pr-8">
                    <input
                      type="text"
                      placeholder="Degree"
                      className="input mb-2"
                      value={edu.degree}
                      onChange={(e) => updateField('education', idx, 'degree', e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Institution"
                      className="input mb-2"
                      value={edu.institution}
                      onChange={(e) => updateField('education', idx, 'institution', e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="2020 - 2024"
                        className="input"
                        value={edu.year}
                        onChange={(e) => updateField('education', idx, 'year', e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="GPA: 4.0/4.0"
                        className="input"
                        value={edu.gpa}
                        onChange={(e) => updateField('education', idx, 'gpa', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="glass-card p-4 lg:p-6"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-4">
                <h2 className="text-xl lg:text-2xl font-bold gradient-text">Projects</h2>
                <button onClick={() => addItem('projects')} className="btn-secondary text-sm w-full sm:w-auto">
                  <Plus className="w-4 h-4 inline mr-1" /> Add
                </button>
              </div>
              {resumeData.projects.map((proj, idx) => (
                <div key={idx} className="mb-4 p-4 bg-slate-800/95 backdrop-blur-xl border border-slate-600/50 rounded-xl relative">
                  <button onClick={() => removeItem('projects', idx)} className="absolute top-2 right-2 text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="pr-8">
                    <input
                      type="text"
                      placeholder="Project Title"
                      className="input mb-2"
                      value={proj.title}
                      onChange={(e) => updateField('projects', idx, 'title', e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Link to Demo"
                      className="input mb-2"
                      value={proj.link}
                      onChange={(e) => updateField('projects', idx, 'link', e.target.value)}
                    />
                    <textarea
                      placeholder="Description..."
                      className="input resize-none"
                      rows="2"
                      value={proj.description}
                      onChange={(e) => updateField('projects', idx, 'description', e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="glass-card p-4 lg:p-6"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-4">
                <h2 className="text-xl lg:text-2xl font-bold gradient-text">Skills</h2>
                <button onClick={() => addItem('skills')} className="btn-secondary text-sm w-full sm:w-auto">
                  <Plus className="w-4 h-4 inline mr-1" /> Add
                </button>
              </div>
              {resumeData.skills.map((skill, idx) => (
                <div key={idx} className="mb-2 p-3 bg-slate-800/95 backdrop-blur-xl border border-slate-600/50 rounded-xl relative">
                  <button onClick={() => removeItem('skills', idx)} className="absolute top-2 right-2 text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="pr-8">
                    <input
                      type="text"
                      placeholder="Skill"
                      className="input"
                      value={skill}
                      onChange={(e) => {
                        const newSkills = [...resumeData.skills]
                        newSkills[idx] = e.target.value
                        setResumeData({ ...resumeData, skills: newSkills })
                      }}
                    />
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {showPreview && (
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:sticky lg:top-8 h-fit"
            >
              <div id="resume-preview" className="bg-white text-black p-8 lg:p-12 rounded-2xl shadow-2xl overflow-hidden" style={{ fontFamily: 'Times, serif', fontSize: '11px', lineHeight: '1.4' }}>
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold mb-4" style={{ fontSize: '24px' }}>{resumeData.name || 'Your Name'}</h1>
                  <div className="flex justify-center flex-wrap gap-4 text-xs" style={{ color: '#0066cc' }}>
                    {resumeData.github && (
                      <span className="flex items-center gap-1">
                        <span style={{ color: '#0066cc' }}>⚬</span> {resumeData.github}
                      </span>
                    )}
                    {resumeData.linkedin && (
                      <span className="flex items-center gap-1">
                        <span style={{ color: '#0066cc' }}>⚬</span> {resumeData.linkedin}
                      </span>
                    )}
                    {resumeData.website && (
                      <span className="flex items-center gap-1">
                        <span style={{ color: '#0066cc' }}>⚬</span> {resumeData.website}
                      </span>
                    )}
                    {resumeData.email && (
                      <span className="flex items-center gap-1">
                        <span style={{ color: '#0066cc' }}>⚬</span> {resumeData.email}
                      </span>
                    )}
                    {resumeData.phone && (
                      <span className="flex items-center gap-1">
                        <span style={{ color: '#0066cc' }}>⚬</span> {resumeData.phone}
                      </span>
                    )}
                  </div>
                </div>

                {resumeData.summary && (
                  <div className="mb-6">
                    <h2 className="text-sm font-bold mb-3" style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>Summary</h2>
                    <p className="text-xs leading-relaxed" style={{ textAlign: 'justify' }}>{resumeData.summary}</p>
                  </div>
                )}

                {resumeData.experience.some(e => e.designation) && (
                  <div className="mb-6">
                    <h2 className="text-sm font-bold mb-3" style={{ textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid black', paddingBottom: '2px' }}>Work Experience</h2>
                    {resumeData.experience.map((exp, idx) => exp.designation && (
                      <div key={idx} className="mb-4">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-bold text-xs">{exp.designation}</h3>
                          <span className="text-xs" style={{ color: '#0066cc' }}>{exp.duration}</span>
                        </div>
                        <p className="text-xs italic mb-2">{exp.company}</p>
                        <div className="text-xs leading-relaxed" style={{ textAlign: 'justify', marginLeft: '15px' }}>
                          {exp.description.split('\n').map((line, i) => (
                            <p key={i} className="mb-1">– {line}</p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {resumeData.projects.some(p => p.title) && (
                  <div className="mb-6">
                    <h2 className="text-sm font-bold mb-3" style={{ textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid black', paddingBottom: '2px' }}>Projects</h2>
                    {resumeData.projects.map((proj, idx) => proj.title && (
                      <div key={idx} className="mb-4">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-bold text-xs">{proj.title}</h3>
                          {proj.link && <a href={proj.link} className="text-xs" style={{ color: '#0066cc' }}>Link to Demo</a>}
                        </div>
                        <div className="text-xs leading-relaxed" style={{ textAlign: 'justify', marginLeft: '15px' }}>
                          {proj.description.split('\n').map((line, i) => (
                            <p key={i} className="mb-1">– {line}</p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {resumeData.education.some(e => e.degree) && (
                  <div className="mb-6">
                    <h2 className="text-sm font-bold mb-3" style={{ textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid black', paddingBottom: '2px' }}>Education</h2>
                    {resumeData.education.map((edu, idx) => edu.degree && (
                      <div key={idx} className="mb-2 text-xs">
                        <div className="flex justify-between items-start">
                          <div>
                            <span style={{ color: '#0066cc' }}>{edu.year}</span>
                            <span className="ml-4">{edu.degree} at <strong>{edu.institution}</strong></span>
                          </div>
                          {edu.gpa && <span>({edu.gpa})</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {resumeData.skills.some(s => s) && (
                  <div className="mb-6">
                    <h2 className="text-sm font-bold mb-3" style={{ textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid black', paddingBottom: '2px' }}>Skills</h2>
                    <div className="text-xs">
                      <div className="mb-2">
                        <span className="font-semibold">Technical Skills:</span>
                        <span className="ml-2">{resumeData.skills.filter(s => s).slice(0, Math.ceil(resumeData.skills.length/2)).join(', ')}</span>
                      </div>
                      {resumeData.skills.length > 1 && (
                        <div>
                          <span className="font-semibold">Additional Skills:</span>
                          <span className="ml-2">{resumeData.skills.filter(s => s).slice(Math.ceil(resumeData.skills.length/2)).join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {resumeData.publications && resumeData.publications.some(p => p.title) && (
                  <div className="mb-6">
                    <h2 className="text-sm font-bold mb-3" style={{ textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid black', paddingBottom: '2px' }}>Publications</h2>
                    {resumeData.publications.map((pub, idx) => pub.title && (
                      <div key={idx} className="mb-3 text-xs">
                        <p>
                          <span className="font-semibold">{resumeData.name}</span> ({pub.year}). "{pub.title}". 
                          <em>{pub.journal}</em>. 
                          {pub.link && (
                            <span>
                              <span className="font-semibold">URL:</span> 
                              <a href={pub.link} style={{ color: '#0066cc' }}>{pub.link}</a>
                            </span>
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="text-center text-xs mt-8" style={{ color: '#666' }}>
                  Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  )
}