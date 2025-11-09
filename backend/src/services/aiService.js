import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// AI Service using Groq API (you can switch to OpenAI if needed)
class AIService {
  constructor() {
    this.groqApiKey = process.env.GROQ_API_KEY?.trim();
    this.openaiApiKey = process.env.OPENAI_API_KEY?.trim();
  }

  async generateCompletion(prompt, options = {}) {
    try {
      // Prioritize Groq (free & fast), then OpenAI
      if (this.groqApiKey && this.groqApiKey.trim()) {
        return await this.groqCompletion(prompt, options);
      } else if (this.openaiApiKey && this.openaiApiKey.trim()) {
        return await this.openaiCompletion(prompt, options);
      } else {
        // Fallback mock response if no API keys configured
        console.warn('⚠️  No AI API keys configured. Get FREE Groq API key: https://console.groq.com/');
        return this.mockCompletion(prompt);
      }
    } catch (error) {
      console.error('AI Service Error:', error.response?.data || error.message);
      // Fallback to mock on API errors
      console.warn('⚠️  Falling back to mock responses due to API error');
      return this.mockCompletion(prompt);
    }
  }

  async groqCompletion(prompt, options = {}) {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: options.model || 'mixtral-8x7b-32768',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI interview assistant. Provide clear, professional, and accurate responses.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 2000,
      },
      {
        headers: {
          'Authorization': `Bearer ${this.groqApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.choices[0].message.content;
  }

  async openaiCompletion(prompt, options = {}) {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: options.model || 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI interview assistant. Provide clear, professional, and accurate responses.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 2000,
      },
      {
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.choices[0].message.content;
  }

  // Mock completion for development/testing
  mockCompletion(prompt) {
    // Enhanced chatbot mock responses
    if (prompt.includes('PrepForge AI Assistant')) {
      const lowerPrompt = prompt.toLowerCase();
      
      if (lowerPrompt.includes('resume') || lowerPrompt.includes('cv')) {
        return `Great question about resumes! Here are some key tips:

📝 **Resume Best Practices:**
• Keep it concise (1-2 pages max)
• Use action verbs (Led, Developed, Implemented)
• Quantify achievements with numbers
• Tailor it to each job description
• Include relevant keywords from the job posting

💡 **Pro Tip:** Use our Resume Maker feature to create a professional resume, and our AI can analyze it for you!

Would you like specific advice on any section of your resume?`;
      }
      
      if (lowerPrompt.includes('interview') || lowerPrompt.includes('prepare')) {
        return `I'd be happy to help you prepare for interviews! Here's a comprehensive approach:

🎯 **Interview Preparation Strategy:**
1. **Research the Company** - Know their products, culture, and recent news
2. **Practice Common Questions** - Use our AI Interview feature for realistic practice
3. **Prepare Your Stories** - Have 3-5 STAR method examples ready
4. **Technical Prep** - Review core concepts for your role
5. **Ask Questions** - Prepare 3-5 thoughtful questions for the interviewer

💪 **PrepForge Features to Use:**
• AI Mock Interviews - Practice with instant feedback
• Live Human Interviews - Get real interview experience
• Performance Analytics - Track your progress

What type of interview are you preparing for?`;
      }
      
      if (lowerPrompt.includes('technical') || lowerPrompt.includes('coding')) {
        return `Technical interviews can be challenging, but with the right preparation, you'll do great!

💻 **Technical Interview Tips:**
• **Data Structures & Algorithms** - Practice daily on LeetCode/HackerRank
• **System Design** - Understand scalability, databases, caching
• **Think Aloud** - Explain your thought process as you code
• **Ask Clarifying Questions** - Don't assume requirements
• **Test Your Code** - Walk through edge cases

🚀 **Practice on PrepForge:**
Use our AI Interview feature and select "Technical" interview type to practice coding questions with instant feedback!

Need help with a specific technical topic?`;
      }
      
      if (lowerPrompt.includes('behavioral') || lowerPrompt.includes('hr')) {
        return `Behavioral interviews assess your soft skills and cultural fit. Here's how to excel:

🗣️ **STAR Method Framework:**
• **S**ituation - Set the context
• **T**ask - Describe your responsibility
• **A**ction - Explain what you did
• **R**esult - Share the outcome (with metrics!)

📋 **Common Behavioral Questions:**
• Tell me about a time you faced a challenge
• Describe a conflict with a team member
• Share an example of leadership
• Discuss a failure and what you learned

✨ **Pro Tip:** Practice these with our AI Interview feature in "Behavioral" mode!

Want to practice a specific behavioral question?`;
      }
      
      if (lowerPrompt.includes('platform') || lowerPrompt.includes('feature') || lowerPrompt.includes('how to use')) {
        return `Welcome to PrepForge! Here's what you can do:

🤖 **AI Mock Interviews**
• Practice with AI interviewer
• Get instant feedback on your answers
• Multiple interview types (Technical, HR, Behavioral)

👥 **Live Human Interviews**
• Schedule real interviews with experienced interviewers
• Video call practice sessions
• Receive detailed feedback and ratings

📊 **Dashboard & Analytics**
• Track your interview performance
• View detailed reports and progress
• Identify areas for improvement

📄 **Resume Tools**
• Create professional resumes
• Get AI-powered resume analysis
• Optimize for ATS systems

What feature would you like to explore first?`;
      }
      
      // Default chatbot response
      return `I'm here to help you ace your interviews! I can assist with:

• 📝 **Resume & CV Tips** - Writing, formatting, and optimization
• 🎯 **Interview Preparation** - Strategies and best practices
• 💻 **Technical Interview Prep** - Coding, algorithms, system design
• 🗣️ **Behavioral Questions** - STAR method and storytelling
• 🚀 **Platform Features** - How to use PrepForge effectively
• 💼 **Career Advice** - Job search and professional development

What would you like to know more about? Feel free to ask me anything!`;
    }
    
    if (prompt.includes('Generate') && prompt.includes('questions')) {
      // Mock interview questions
      return JSON.stringify([
        {
          questionText: "Can you explain the concept of closures in JavaScript?",
          expectedAnswer: "A closure is a function that has access to variables in its outer scope, even after the outer function has returned.",
          keyPoints: ["Function scope", "Lexical environment", "Practical use cases"]
        },
        {
          questionText: "What is the difference between let, const, and var?",
          expectedAnswer: "var is function-scoped and hoisted, let and const are block-scoped, const cannot be reassigned.",
          keyPoints: ["Scope differences", "Hoisting behavior", "Reassignment rules"]
        },
        {
          questionText: "Explain the concept of promises in JavaScript.",
          expectedAnswer: "Promises represent the eventual completion or failure of an asynchronous operation.",
          keyPoints: ["Async programming", "Then/catch chains", "Promise states"]
        }
      ]);
    } else if (prompt.includes('Evaluate this interview response')) {
      // Mock response evaluation
      return JSON.stringify({
        technicalScore: 75,
        communicationScore: 80,
        confidence: 70,
        feedback: "Good understanding of the core concepts. Try to provide more specific examples to strengthen your answer.",
        strengths: ["Clear explanation", "Good technical vocabulary"],
        improvements: ["Add practical examples", "Elaborate on edge cases"]
      });
    } else if (prompt.includes('Analyze this resume')) {
      // Mock resume analysis
      return JSON.stringify({
        overallScore: 72,
        matchPercentage: 68,
        strengths: [
          "Strong technical skills in relevant technologies",
          "Good project portfolio",
          "Clear and concise formatting",
          "Relevant work experience",
          "Strong educational background"
        ],
        improvements: [
          "Add more quantifiable achievements",
          "Include specific metrics and results",
          "Expand on leadership experiences",
          "Add more industry-specific keywords",
          "Include certifications if any"
        ],
        keywords: {
          present: ["JavaScript", "React", "Node.js", "MongoDB", "Git"],
          missing: ["TypeScript", "Docker", "AWS", "CI/CD", "Testing"]
        },
        sections: {
          experience: {
            score: 75,
            feedback: "Good experience but needs more quantifiable results"
          },
          education: {
            score: 85,
            feedback: "Strong educational background"
          },
          skills: {
            score: 70,
            feedback: "Add more in-demand skills for the target role"
          },
          projects: {
            score: 65,
            feedback: "Expand on project details and your specific contributions"
          }
        }
      });
    }
  }

  // Parse JSON response with error handling
  parseJSONResponse(response) {
    try {
      // Try to find JSON in the response
      const jsonMatch = response.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return null;
    } catch (error) {
      console.error('Failed to parse JSON response:', error);
      return null;
    }
  }
}

export default new AIService();
