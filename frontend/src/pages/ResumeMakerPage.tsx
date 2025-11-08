import { useState } from 'react';
import { FileText, Download, Eye, ArrowLeft, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';

export default function ResumeMakerPage() {
  const navigate = useNavigate();
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    linkedIn: '',
    portfolio: '',
    summary: '',
    
    // Professional Experience
    experiences: [
      { company: '', position: '', location: '', startDate: '', endDate: '', current: false, description: '' }
    ],
    
    // Education
    education: [
      { institution: '', degree: '', field: '', startDate: '', endDate: '', gpa: '' }
    ],
    
    // Skills
    skills: '',
    
    // Projects
    projects: [
      { name: '', description: '', technologies: '', link: '' }
    ],
    
    // Certifications
    certifications: [
      { name: '', issuer: '', date: '', link: '' }
    ]
  });

  const [template, setTemplate] = useState<'modern' | 'classic' | 'minimal'>('modern');

  const addExperience = () => {
    setFormData({
      ...formData,
      experiences: [...formData.experiences, { company: '', position: '', location: '', startDate: '', endDate: '', current: false, description: '' }]
    });
  };

  const addEducation = () => {
    setFormData({
      ...formData,
      education: [...formData.education, { institution: '', degree: '', field: '', startDate: '', endDate: '', gpa: '' }]
    });
  };

  const addProject = () => {
    setFormData({
      ...formData,
      projects: [...formData.projects, { name: '', description: '', technologies: '', link: '' }]
    });
  };

  const addCertification = () => {
    setFormData({
      ...formData,
      certifications: [...formData.certifications, { name: '', issuer: '', date: '', link: '' }]
    });
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    // Set up colors and fonts
    const primaryColor: [number, number, number] = [34, 197, 94]; // green-600
    const textColor: [number, number, number] = [31, 41, 55]; // gray-800
    const secondaryColor: [number, number, number] = [107, 114, 128]; // gray-500
    
    let yPos = 20;
    const leftMargin = 20;
    const rightMargin = 190;
    const lineHeight = 7;

    // Helper function to add text with word wrap
    const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 10) => {
      doc.setFontSize(fontSize);
      const lines = doc.splitTextToSize(text, maxWidth);
      doc.text(lines, x, y);
      return lines.length * lineHeight;
    };

    // Header Section
    doc.setFontSize(24);
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text(`${formData.firstName} ${formData.lastName}`, leftMargin, yPos);
    yPos += 10;

    // Contact Information
    doc.setFontSize(10);
    doc.setTextColor(...secondaryColor);
    doc.setFont('helvetica', 'normal');
    const contactInfo = [];
    if (formData.email) contactInfo.push(formData.email);
    if (formData.phone) contactInfo.push(formData.phone);
    if (formData.location) contactInfo.push(formData.location);
    doc.text(contactInfo.join(' | '), leftMargin, yPos);
    yPos += lineHeight;

    if (formData.linkedIn || formData.portfolio) {
      const links = [];
      if (formData.linkedIn) links.push(formData.linkedIn);
      if (formData.portfolio) links.push(formData.portfolio);
      doc.text(links.join(' | '), leftMargin, yPos);
      yPos += lineHeight;
    }

    yPos += 5;

    // Professional Summary
    if (formData.summary) {
      doc.setFontSize(14);
      doc.setTextColor(...primaryColor);
      doc.setFont('helvetica', 'bold');
      doc.text('Professional Summary', leftMargin, yPos);
      yPos += lineHeight;

      doc.setFontSize(10);
      doc.setTextColor(...textColor);
      doc.setFont('helvetica', 'normal');
      yPos += addWrappedText(formData.summary, leftMargin, yPos, rightMargin - leftMargin);
      yPos += 5;
    }

    // Professional Experience
    if (formData.experiences.length > 0 && formData.experiences[0].company) {
      doc.setFontSize(14);
      doc.setTextColor(...primaryColor);
      doc.setFont('helvetica', 'bold');
      doc.text('Professional Experience', leftMargin, yPos);
      yPos += lineHeight;

      formData.experiences.forEach((exp) => {
        if (exp.company) {
          doc.setFontSize(12);
          doc.setTextColor(...textColor);
          doc.setFont('helvetica', 'bold');
          doc.text(exp.position, leftMargin, yPos);
          yPos += lineHeight;

          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.text(exp.company, leftMargin, yPos);
          
          const dateText = `${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}`;
          doc.text(dateText, rightMargin, yPos, { align: 'right' });
          yPos += lineHeight;

          if (exp.location) {
            doc.setTextColor(...secondaryColor);
            doc.text(exp.location, leftMargin, yPos);
            yPos += lineHeight;
          }

          if (exp.description) {
            doc.setTextColor(...textColor);
            yPos += addWrappedText(exp.description, leftMargin, yPos, rightMargin - leftMargin);
          }
          yPos += 5;
        }
      });
      yPos += 5;
    }

    // Education
    if (formData.education.length > 0 && formData.education[0].institution) {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setTextColor(...primaryColor);
      doc.setFont('helvetica', 'bold');
      doc.text('Education', leftMargin, yPos);
      yPos += lineHeight;

      formData.education.forEach((edu) => {
        if (edu.institution) {
          doc.setFontSize(12);
          doc.setTextColor(...textColor);
          doc.setFont('helvetica', 'bold');
          doc.text(edu.degree, leftMargin, yPos);
          yPos += lineHeight;

          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.text(edu.institution, leftMargin, yPos);
          
          const dateText = `${edu.startDate} - ${edu.endDate}`;
          doc.text(dateText, rightMargin, yPos, { align: 'right' });
          yPos += lineHeight;

          if (edu.field) {
            doc.text(`Field: ${edu.field}`, leftMargin, yPos);
            yPos += lineHeight;
          }

          if (edu.gpa) {
            doc.text(`GPA: ${edu.gpa}`, leftMargin, yPos);
            yPos += lineHeight;
          }
          yPos += 3;
        }
      });
      yPos += 5;
    }

    // Skills
    if (formData.skills) {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setTextColor(...primaryColor);
      doc.setFont('helvetica', 'bold');
      doc.text('Skills', leftMargin, yPos);
      yPos += lineHeight;

      doc.setFontSize(10);
      doc.setTextColor(...textColor);
      doc.setFont('helvetica', 'normal');
      yPos += addWrappedText(formData.skills, leftMargin, yPos, rightMargin - leftMargin);
      yPos += 5;
    }

    // Projects
    if (formData.projects.length > 0 && formData.projects[0].name) {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setTextColor(...primaryColor);
      doc.setFont('helvetica', 'bold');
      doc.text('Projects', leftMargin, yPos);
      yPos += lineHeight;

      formData.projects.forEach((proj) => {
        if (proj.name) {
          doc.setFontSize(11);
          doc.setTextColor(...textColor);
          doc.setFont('helvetica', 'bold');
          doc.text(proj.name, leftMargin, yPos);
          yPos += lineHeight;

          if (proj.technologies) {
            doc.setFontSize(9);
            doc.setTextColor(...secondaryColor);
            doc.setFont('helvetica', 'italic');
            doc.text(`Technologies: ${proj.technologies}`, leftMargin, yPos);
            yPos += lineHeight;
          }

          if (proj.description) {
            doc.setFontSize(10);
            doc.setTextColor(...textColor);
            doc.setFont('helvetica', 'normal');
            yPos += addWrappedText(proj.description, leftMargin, yPos, rightMargin - leftMargin);
          }

          if (proj.link) {
            doc.setTextColor(...primaryColor);
            doc.textWithLink(proj.link, leftMargin, yPos, { url: proj.link });
            yPos += lineHeight;
          }
          yPos += 3;
        }
      });
      yPos += 5;
    }

    // Certifications
    if (formData.certifications.length > 0 && formData.certifications[0].name) {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setTextColor(...primaryColor);
      doc.setFont('helvetica', 'bold');
      doc.text('Certifications', leftMargin, yPos);
      yPos += lineHeight;

      formData.certifications.forEach((cert) => {
        if (cert.name) {
          doc.setFontSize(11);
          doc.setTextColor(...textColor);
          doc.setFont('helvetica', 'bold');
          doc.text(cert.name, leftMargin, yPos);
          
          if (cert.date) {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(cert.date, rightMargin, yPos, { align: 'right' });
          }
          yPos += lineHeight;

          if (cert.issuer) {
            doc.setFontSize(10);
            doc.setTextColor(...secondaryColor);
            doc.setFont('helvetica', 'normal');
            doc.text(cert.issuer, leftMargin, yPos);
            yPos += lineHeight;
          }

          if (cert.link) {
            doc.setTextColor(...primaryColor);
            doc.textWithLink(cert.link, leftMargin, yPos, { url: cert.link });
            yPos += lineHeight;
          }
          yPos += 3;
        }
      });
    }

    // Save the PDF
    const fileName = `${formData.firstName}_${formData.lastName}_Resume.pdf`.replace(/\s+/g, '_');
    doc.save(fileName);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FileText className="w-8 h-8 text-green-600" />
              Resume Maker
            </h1>
            <p className="text-gray-600 mt-1">
              Create a professional resume with our easy-to-use builder
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowPreview(true)} className="btn btn-secondary flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Preview
          </button>
          <button onClick={handleDownloadPDF} className="btn btn-primary flex items-center gap-2">
            <Download className="w-4 h-4" />
            Download PDF
          </button>
        </div>
      </div>

      {/* Template Selection */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Choose Template</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setTemplate('modern')}
            className={`p-4 border-2 rounded-lg transition-all ${
              template === 'modern' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="aspect-[8.5/11] bg-gradient-to-br from-green-100 to-green-200 rounded mb-3" />
            <p className="font-medium text-gray-900">Modern</p>
            <p className="text-sm text-gray-600">Clean and contemporary design</p>
          </button>
          <button
            onClick={() => setTemplate('classic')}
            className={`p-4 border-2 rounded-lg transition-all ${
              template === 'classic' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="aspect-[8.5/11] bg-gradient-to-br from-blue-100 to-blue-200 rounded mb-3" />
            <p className="font-medium text-gray-900">Classic</p>
            <p className="text-sm text-gray-600">Traditional professional layout</p>
          </button>
          <button
            onClick={() => setTemplate('minimal')}
            className={`p-4 border-2 rounded-lg transition-all ${
              template === 'minimal' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="aspect-[8.5/11] bg-gradient-to-br from-gray-100 to-gray-200 rounded mb-3" />
            <p className="font-medium text-gray-900">Minimal</p>
            <p className="text-sm text-gray-600">Simple and elegant style</p>
          </button>
        </div>
      </div>

      {/* Resume Builder Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input 
                type="text" 
                placeholder="First Name" 
                className="input" 
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
              <input 
                type="text" 
                placeholder="Last Name" 
                className="input" 
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
              <input 
                type="email" 
                placeholder="Email" 
                className="input" 
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <input 
                type="tel" 
                placeholder="Phone" 
                className="input" 
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              <input 
                type="text" 
                placeholder="Location" 
                className="input" 
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
              <input 
                type="text" 
                placeholder="LinkedIn URL" 
                className="input" 
                value={formData.linkedIn}
                onChange={(e) => setFormData({ ...formData, linkedIn: e.target.value })}
              />
              <input 
                type="text" 
                placeholder="Portfolio URL" 
                className="input col-span-full" 
                value={formData.portfolio}
                onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
              />
              <textarea 
                placeholder="Professional Summary" 
                className="input col-span-full" 
                rows={4} 
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              />
            </div>
          </div>

          {/* Work Experience */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Work Experience</h2>
              <button onClick={addExperience} className="text-green-600 hover:text-green-700 font-medium text-sm">
                + Add Experience
              </button>
            </div>
            <div className="space-y-4">
              {formData.experiences.map((exp, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input 
                      type="text" 
                      placeholder="Company" 
                      className="input" 
                      value={exp.company}
                      onChange={(e) => {
                        const newExperiences = [...formData.experiences];
                        newExperiences[index].company = e.target.value;
                        setFormData({ ...formData, experiences: newExperiences });
                      }}
                    />
                    <input 
                      type="text" 
                      placeholder="Position" 
                      className="input" 
                      value={exp.position}
                      onChange={(e) => {
                        const newExperiences = [...formData.experiences];
                        newExperiences[index].position = e.target.value;
                        setFormData({ ...formData, experiences: newExperiences });
                      }}
                    />
                    <input 
                      type="text" 
                      placeholder="Location" 
                      className="input" 
                      value={exp.location}
                      onChange={(e) => {
                        const newExperiences = [...formData.experiences];
                        newExperiences[index].location = e.target.value;
                        setFormData({ ...formData, experiences: newExperiences });
                      }}
                    />
                    <input 
                      type="date" 
                      placeholder="Start Date" 
                      className="input" 
                      value={exp.startDate}
                      onChange={(e) => {
                        const newExperiences = [...formData.experiences];
                        newExperiences[index].startDate = e.target.value;
                        setFormData({ ...formData, experiences: newExperiences });
                      }}
                    />
                    <input 
                      type="date" 
                      placeholder="End Date" 
                      className="input" 
                      value={exp.endDate}
                      onChange={(e) => {
                        const newExperiences = [...formData.experiences];
                        newExperiences[index].endDate = e.target.value;
                        setFormData({ ...formData, experiences: newExperiences });
                      }}
                      disabled={exp.current}
                    />
                    <label className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        className="rounded" 
                        checked={exp.current}
                        onChange={(e) => {
                          const newExperiences = [...formData.experiences];
                          newExperiences[index].current = e.target.checked;
                          setFormData({ ...formData, experiences: newExperiences });
                        }}
                      />
                      <span className="text-sm text-gray-700">Currently working here</span>
                    </label>
                  </div>
                  <textarea 
                    placeholder="Description (responsibilities, achievements)" 
                    className="input" 
                    rows={3} 
                    value={exp.description}
                    onChange={(e) => {
                      const newExperiences = [...formData.experiences];
                      newExperiences[index].description = e.target.value;
                      setFormData({ ...formData, experiences: newExperiences });
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Education */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Education</h2>
              <button onClick={addEducation} className="text-green-600 hover:text-green-700 font-medium text-sm">
                + Add Education
              </button>
            </div>
            <div className="space-y-4">
              {formData.education.map((edu, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input 
                      type="text" 
                      placeholder="Institution" 
                      className="input" 
                      value={edu.institution}
                      onChange={(e) => {
                        const newEducation = [...formData.education];
                        newEducation[index].institution = e.target.value;
                        setFormData({ ...formData, education: newEducation });
                      }}
                    />
                    <input 
                      type="text" 
                      placeholder="Degree" 
                      className="input" 
                      value={edu.degree}
                      onChange={(e) => {
                        const newEducation = [...formData.education];
                        newEducation[index].degree = e.target.value;
                        setFormData({ ...formData, education: newEducation });
                      }}
                    />
                    <input 
                      type="text" 
                      placeholder="Field of Study" 
                      className="input" 
                      value={edu.field}
                      onChange={(e) => {
                        const newEducation = [...formData.education];
                        newEducation[index].field = e.target.value;
                        setFormData({ ...formData, education: newEducation });
                      }}
                    />
                    <input 
                      type="text" 
                      placeholder="GPA" 
                      className="input" 
                      value={edu.gpa}
                      onChange={(e) => {
                        const newEducation = [...formData.education];
                        newEducation[index].gpa = e.target.value;
                        setFormData({ ...formData, education: newEducation });
                      }}
                    />
                    <input 
                      type="date" 
                      placeholder="Start Date" 
                      className="input" 
                      value={edu.startDate}
                      onChange={(e) => {
                        const newEducation = [...formData.education];
                        newEducation[index].startDate = e.target.value;
                        setFormData({ ...formData, education: newEducation });
                      }}
                    />
                    <input 
                      type="date" 
                      placeholder="End Date" 
                      className="input" 
                      value={edu.endDate}
                      onChange={(e) => {
                        const newEducation = [...formData.education];
                        newEducation[index].endDate = e.target.value;
                        setFormData({ ...formData, education: newEducation });
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Skills</h2>
            <textarea 
              placeholder="Enter skills separated by commas (e.g., JavaScript, React, Node.js, Python)" 
              className="input" 
              rows={3} 
              value={formData.skills}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
            />
          </div>

          {/* Projects */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Projects</h2>
              <button onClick={addProject} className="text-green-600 hover:text-green-700 font-medium text-sm">
                + Add Project
              </button>
            </div>
            <div className="space-y-4">
              {formData.projects.map((proj, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-3">
                  <input 
                    type="text" 
                    placeholder="Project Name" 
                    className="input" 
                    value={proj.name}
                    onChange={(e) => {
                      const newProjects = [...formData.projects];
                      newProjects[index].name = e.target.value;
                      setFormData({ ...formData, projects: newProjects });
                    }}
                  />
                  <textarea 
                    placeholder="Description" 
                    className="input" 
                    rows={2} 
                    value={proj.description}
                    onChange={(e) => {
                      const newProjects = [...formData.projects];
                      newProjects[index].description = e.target.value;
                      setFormData({ ...formData, projects: newProjects });
                    }}
                  />
                  <input 
                    type="text" 
                    placeholder="Technologies Used" 
                    className="input" 
                    value={proj.technologies}
                    onChange={(e) => {
                      const newProjects = [...formData.projects];
                      newProjects[index].technologies = e.target.value;
                      setFormData({ ...formData, projects: newProjects });
                    }}
                  />
                  <input 
                    type="text" 
                    placeholder="Project Link" 
                    className="input" 
                    value={proj.link}
                    onChange={(e) => {
                      const newProjects = [...formData.projects];
                      newProjects[index].link = e.target.value;
                      setFormData({ ...formData, projects: newProjects });
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Certifications</h2>
              <button onClick={addCertification} className="text-green-600 hover:text-green-700 font-medium text-sm">
                + Add Certification
              </button>
            </div>
            <div className="space-y-4">
              {formData.certifications.map((cert, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-3">
                  <input 
                    type="text" 
                    placeholder="Certification Name" 
                    className="input" 
                    value={cert.name}
                    onChange={(e) => {
                      const newCertifications = [...formData.certifications];
                      newCertifications[index].name = e.target.value;
                      setFormData({ ...formData, certifications: newCertifications });
                    }}
                  />
                  <input 
                    type="text" 
                    placeholder="Issuing Organization" 
                    className="input" 
                    value={cert.issuer}
                    onChange={(e) => {
                      const newCertifications = [...formData.certifications];
                      newCertifications[index].issuer = e.target.value;
                      setFormData({ ...formData, certifications: newCertifications });
                    }}
                  />
                  <input 
                    type="date" 
                    placeholder="Issue Date" 
                    className="input" 
                    value={cert.date}
                    onChange={(e) => {
                      const newCertifications = [...formData.certifications];
                      newCertifications[index].date = e.target.value;
                      setFormData({ ...formData, certifications: newCertifications });
                    }}
                  />
                  <input 
                    type="text" 
                    placeholder="Credential URL" 
                    className="input" 
                    value={cert.link}
                    onChange={(e) => {
                      const newCertifications = [...formData.certifications];
                      newCertifications[index].link = e.target.value;
                      setFormData({ ...formData, certifications: newCertifications });
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className="lg:col-span-1">
          <div className="card sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Preview</h3>
            <div className="aspect-[8.5/11] bg-white border-2 border-gray-200 rounded-lg p-6 overflow-auto">
              <p className="text-center text-gray-500 text-sm">
                Resume preview will appear here
              </p>
            </div>
            <div className="mt-4 space-y-2">
              <button onClick={handleDownloadPDF} className="btn btn-primary w-full flex items-center justify-center gap-2">
                <Download className="w-4 h-4" />
                Download PDF
              </button>
              <button className="btn btn-secondary w-full">
                Save Draft
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Resume Preview</h2>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Preview Content */}
            <div className="p-8 bg-gray-50">
              <div className="bg-white shadow-lg rounded-lg p-8 max-w-3xl mx-auto">
                {/* Header */}
                <div className="border-b-2 border-green-600 pb-4 mb-6">
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">
                    {formData.firstName} {formData.lastName}
                  </h1>
                  <div className="text-sm text-gray-600 space-y-1">
                    {(formData.email || formData.phone || formData.location) && (
                      <p>
                        {[formData.email, formData.phone, formData.location].filter(Boolean).join(' | ')}
                      </p>
                    )}
                    {(formData.linkedIn || formData.portfolio) && (
                      <p className="text-green-600">
                        {[formData.linkedIn, formData.portfolio].filter(Boolean).join(' | ')}
                      </p>
                    )}
                  </div>
                </div>

                {/* Professional Summary */}
                {formData.summary && (
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-green-600 mb-3 uppercase tracking-wide">
                      Professional Summary
                    </h2>
                    <p className="text-gray-700 leading-relaxed">{formData.summary}</p>
                  </div>
                )}

                {/* Experience */}
                {formData.experiences.length > 0 && formData.experiences[0].company && (
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-green-600 mb-3 uppercase tracking-wide">
                      Professional Experience
                    </h2>
                    {formData.experiences.map((exp, index) => (
                      exp.company && (
                        <div key={index} className="mb-4">
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="text-lg font-semibold text-gray-900">{exp.position}</h3>
                            <span className="text-sm text-gray-600">
                              {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                            </span>
                          </div>
                          <p className="text-gray-700 font-medium mb-1">{exp.company}</p>
                          {exp.location && <p className="text-sm text-gray-600 mb-2">{exp.location}</p>}
                          {exp.description && <p className="text-gray-700 leading-relaxed">{exp.description}</p>}
                        </div>
                      )
                    ))}
                  </div>
                )}

                {/* Education */}
                {formData.education.length > 0 && formData.education[0].institution && (
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-green-600 mb-3 uppercase tracking-wide">
                      Education
                    </h2>
                    {formData.education.map((edu, index) => (
                      edu.institution && (
                        <div key={index} className="mb-3">
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="text-lg font-semibold text-gray-900">{edu.degree}</h3>
                            <span className="text-sm text-gray-600">
                              {edu.startDate} - {edu.endDate}
                            </span>
                          </div>
                          <p className="text-gray-700 font-medium">{edu.institution}</p>
                          {edu.field && <p className="text-sm text-gray-600">Field: {edu.field}</p>}
                          {edu.gpa && <p className="text-sm text-gray-600">GPA: {edu.gpa}</p>}
                        </div>
                      )
                    ))}
                  </div>
                )}

                {/* Skills */}
                {formData.skills && (
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-green-600 mb-3 uppercase tracking-wide">
                      Skills
                    </h2>
                    <p className="text-gray-700 leading-relaxed">{formData.skills}</p>
                  </div>
                )}

                {/* Projects */}
                {formData.projects.length > 0 && formData.projects[0].name && (
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-green-600 mb-3 uppercase tracking-wide">
                      Projects
                    </h2>
                    {formData.projects.map((proj, index) => (
                      proj.name && (
                        <div key={index} className="mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">{proj.name}</h3>
                          {proj.technologies && (
                            <p className="text-sm text-gray-600 italic mb-1">
                              Technologies: {proj.technologies}
                            </p>
                          )}
                          {proj.description && (
                            <p className="text-gray-700 leading-relaxed mb-1">{proj.description}</p>
                          )}
                          {proj.link && (
                            <a
                              href={proj.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-600 hover:text-green-700 text-sm"
                            >
                              {proj.link}
                            </a>
                          )}
                        </div>
                      )
                    ))}
                  </div>
                )}

                {/* Certifications */}
                {formData.certifications.length > 0 && formData.certifications[0].name && (
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-green-600 mb-3 uppercase tracking-wide">
                      Certifications
                    </h2>
                    {formData.certifications.map((cert, index) => (
                      cert.name && (
                        <div key={index} className="mb-3">
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="text-lg font-semibold text-gray-900">{cert.name}</h3>
                            {cert.date && <span className="text-sm text-gray-600">{cert.date}</span>}
                          </div>
                          {cert.issuer && <p className="text-gray-700 mb-1">{cert.issuer}</p>}
                          {cert.link && (
                            <a
                              href={cert.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-600 hover:text-green-700 text-sm"
                            >
                              View Credential
                            </a>
                          )}
                        </div>
                      )
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setShowPreview(false)}
                className="btn btn-secondary"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleDownloadPDF();
                  setShowPreview(false);
                }}
                className="btn btn-primary flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
