import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

// Generate JWT token
export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// Generate unique room ID for live interviews
export const generateRoomId = () => {
  return `room-${uuidv4()}`;
};

// Format date for display
export const formatDate = (date) => {
  return new Date(date).toISOString();
};

// Calculate time difference in minutes
export const getMinutesDifference = (date1, date2) => {
  return Math.floor((date2 - date1) / 60000);
};

// Validate email format
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Sanitize user input
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
};

// Parse skills string to array
export const parseSkills = (skillsString) => {
  if (!skillsString) return [];
  return skillsString.split(',').map(s => s.trim()).filter(s => s);
};

// Calculate interview score based on responses
export const calculateInterviewScore = (responses) => {
  if (!responses || responses.length === 0) return 0;
  
  const totalScore = responses.reduce((sum, response) => {
    const technicalScore = response.technicalScore || 0;
    const communicationScore = response.communicationScore || 0;
    return sum + (technicalScore + communicationScore) / 2;
  }, 0);
  
  return Math.round(totalScore / responses.length);
};

// Generate AI prompt for interview questions
export const generateInterviewQuestionsPrompt = (interviewType, topic, difficulty, count = 5) => {
  return `Generate ${count} ${difficulty} level ${interviewType} interview questions about ${topic}. 
  
  For each question provide:
  1. Question text
  2. Expected answer (brief)
  3. Key points to cover
  
  Format as JSON array with fields: questionText, expectedAnswer, keyPoints.
  Make questions realistic, relevant, and appropriate for ${difficulty} difficulty.`;
};

// Generate AI prompt for response evaluation
export const generateResponseEvaluationPrompt = (question, response, interviewType) => {
  return `Evaluate this interview response:
  
  Question: "${question}"
  Response: "${response}"
  Interview Type: ${interviewType}
  
  Provide:
  1. Technical Score (0-100): How technically accurate and complete is the answer?
  2. Communication Score (0-100): How well is it articulated?
  3. Confidence Level (0-100): Based on language used
  4. Feedback: 2-3 sentences of constructive feedback
  5. Key Strengths: What was done well
  6. Areas for Improvement: What could be better
  
  Format as JSON with fields: technicalScore, communicationScore, confidence, feedback, strengths, improvements.`;
};

// Generate AI prompt for resume analysis
export const generateResumeAnalysisPrompt = (resumeText, jobRole, targetCompany = null) => {
  const companyText = targetCompany ? ` at ${targetCompany}` : '';
  
  return `Analyze this resume for a ${jobRole} position${companyText}:
  
  ${resumeText}
  
  Provide detailed analysis:
  1. Overall Score (0-100)
  2. Match Percentage with ${jobRole} role (0-100)
  3. Top 5 Strengths (as array of strings)
  4. Top 5 Areas for Improvement (as array of strings)
  5. Keywords Present (technical skills, tools found)
  6. Keywords Missing (important skills for ${jobRole} not found)
  7. Section-wise analysis (Experience, Education, Skills, Projects) with score and feedback for each
  
  Format as JSON with fields: overallScore, matchPercentage, strengths, improvements, keywords (with present and missing arrays), sections (with score and feedback for each section).`;
};

// Generate chatbot response prompt
export const generateChatbotPrompt = (message, context = 'interview_preparation') => {
  return `You are PrepForge AI Assistant, a helpful interview preparation chatbot. 
  Context: ${context}
  
  User message: "${message}"
  
  Provide a helpful, friendly, and professional response. Keep it concise (2-3 paragraphs max).
  Focus on interview preparation, resume tips, career guidance, and using the PrepForge platform.
  If asked about platform features, explain them clearly.
  
  Response:`;
};
