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
              font-family: 'Computer Modern', 'Times New Roman', serif; 
              margin: 0; 
              padding: 48px; 
              line-height: 1.6;
              color: #000;
            }
            h1 { font-size: 32px; margin-bottom: 12px; }
            h2 { 
              font-size: 18px; 
              margin-top: 20px; 
              margin-bottom: 8px;
              border-bottom: 2px solid #000;
              padding-bottom: 2px;
            }
            h3 { font-size: 14px; margin-bottom: 4px; }
            p, li { font-size: 12px; }
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
              body { margin: 0; padding: 48px; }
              @page { margin: 0.5in; }
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
            <button onClick={downloadPDF} className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto">
              <Download className="w-5 h-5" />
              Download PDF
            </button>
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
              <div id="resume-preview" className="bg-white text-black p-6 lg:p-12 rounded-2xl shadow-2xl overflow-hidden" style={{ fontFamily: 'serif' }}>
                <div className="text-center mb-6">
                  <h1 className="text-4xl font-bold mb-3">{resumeData.name || 'Your Name'}</h1>
                  <div className="flex justify-center flex-wrap gap-3 text-sm text-blue-600">
                    {resumeData.github && (
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                        {resumeData.github}
                      </span>
                    )}
                    {resumeData.linkedin && (
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                        </svg>
                        {resumeData.linkedin}
                      </span>
                    )}
                    {resumeData.website && (
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm1 16.057v-3.057h2.994c-.059 1.143-.212 2.24-.456 3.279-.823-.12-1.674-.188-2.538-.222zm1.957 2.162c-.499 1.33-1.159 2.497-1.957 3.456v-3.62c.666.028 1.319.081 1.957.164zm-1.957-7.219v-3.015c.868-.034 1.721-.103 2.548-.224.238 1.027.389 2.111.446 3.239h-2.994zm0-5.014v-3.661c.806.969 1.471 2.15 1.971 3.496-.642.084-1.3.137-1.971.165zm2.703-3.267c1.237.496 2.354 1.228 3.29 2.146-.642.234-1.311.442-2.019.607-.344-.992-.775-1.91-1.271-2.753zm-7.241 13.56c-.244-1.039-.398-2.136-.456-3.279h2.994v3.057c-.865.034-1.714.102-2.538.222zm2.538 1.776v3.62c-.798-.959-1.458-2.126-1.957-3.456.638-.083 1.291-.136 1.957-.164zm-2.994-7.055c.057-1.128.207-2.212.446-3.239.827.121 1.68.19 2.548.224v3.015h-2.994zm1.024-5.179c.5-1.346 1.165-2.527 1.97-3.496v3.661c-.671-.028-1.329-.081-1.97-.165zm-2.005-.35c-.708-.165-1.377-.373-2.018-.607.937-.918 2.053-1.65 3.29-2.146-.496.844-.927 1.762-1.272 2.753zm-.549 1.918c-.264 1.151-.434 2.36-.492 3.611h-3.933c.165-1.658.739-3.197 1.617-4.518.88.361 1.816.67 2.808.907zm.009 9.262c-.988.236-1.92.542-2.797.9-.89-1.328-1.471-2.879-1.637-4.551h3.934c.058 1.265.231 2.488.5 3.651zm.553 1.917c.342.976.768 1.881 1.257 2.712-1.223-.49-2.326-1.211-3.256-2.115.636-.229 1.299-.435 1.999-.597zm9.924 0c.7.163 1.362.367 1.999.597-.931.903-2.034 1.625-3.257 2.116.489-.832.915-1.737 1.258-2.713zm.553-1.917c.27-1.163.442-2.386.501-3.651h3.934c-.167 1.672-.748 3.223-1.638 4.551-.877-.358-1.81-.664-2.797-.9zm.501-5.651c-.058-1.251-.229-2.46-.492-3.611.992-.237 1.929-.546 2.809-.907.877 1.321 1.451 2.86 1.616 4.518h-3.933z"/>
                        </svg>
                        {resumeData.website}
                      </span>
                    )}
                    {resumeData.email && (
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M0 3v18h24v-18h-24zm6.623 7.929l-4.623 5.712v-9.458l4.623 3.746zm-4.141-5.929h19.035l-9.517 7.713-9.518-7.713zm5.694 7.188l3.824 3.099 3.83-3.104 5.612 6.817h-18.779l5.513-6.812zm9.208-1.264l4.616-3.741v9.348l-4.616-5.607z"/>
                        </svg>
                        {resumeData.email}
                      </span>
                    )}
                    {resumeData.phone && (
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20 22.621l-3.521-6.795c-.008.004-1.974.97-2.064 1.011-2.24 1.086-6.799-7.82-4.609-8.994l2.083-1.026-3.493-6.817-2.106 1.039c-7.202 3.755 4.233 25.982 11.6 22.615.121-.055 2.102-1.029 2.11-1.033z"/>
                        </svg>
                        {resumeData.phone}
                      </span>
                    )}
                  </div>
                </div>

                {resumeData.summary && (
                  <div className="mb-6">
                    <h2 className="text-xl font-bold border-b-2 border-black mb-2">SUMMARY</h2>
                    <p className="text-sm">{resumeData.summary}</p>
                  </div>
                )}

                {resumeData.experience.some(e => e.designation) && (
                  <div className="mb-6">
                    <h2 className="text-xl font-bold border-b-2 border-black mb-2">WORK EXPERIENCE</h2>
                    {resumeData.experience.map((exp, idx) => exp.designation && (
                      <div key={idx} className="mb-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold">{exp.designation}</h3>
                            <p className="text-sm italic">{exp.company}</p>
                          </div>
                          <span className="text-sm">{exp.duration}</span>
                        </div>
                        <p className="text-sm mt-1 whitespace-pre-wrap">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                )}

                {resumeData.projects.some(p => p.title) && (
                  <div className="mb-6">
                    <h2 className="text-xl font-bold border-b-2 border-black mb-2">PROJECTS</h2>
                    {resumeData.projects.map((proj, idx) => proj.title && (
                      <div key={idx} className="mb-3">
                        <div className="flex justify-between">
                          <h3 className="font-bold">{proj.title}</h3>
                          {proj.link && <a href={proj.link} className="text-sm text-blue-600">Link to Demo</a>}
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{proj.description}</p>
                      </div>
                    ))}
                  </div>
                )}

                {resumeData.education.some(e => e.degree) && (
                  <div className="mb-6">
                    <h2 className="text-xl font-bold border-b-2 border-black mb-2">EDUCATION</h2>
                    {resumeData.education.map((edu, idx) => edu.degree && (
                      <div key={idx} className="mb-2">
                        <div className="flex justify-between">
                          <div>
                            <span className="font-bold">{edu.year}</span>
                            <span className="ml-4">{edu.degree} at <strong>{edu.institution}</strong></span>
                          </div>
                          {edu.gpa && <span className="text-sm">{edu.gpa}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {resumeData.skills.some(s => s) && (
                  <div className="mb-6">
                    <h2 className="text-xl font-bold border-b-2 border-black mb-2">SKILLS</h2>
                    <p className="text-sm">{resumeData.skills.filter(s => s).join(', ')}</p>
                  </div>
                )}

                <div className="text-center text-xs text-gray-600 mt-8">
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