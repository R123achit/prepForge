import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// AI Service using Google Gemini API
class AIService {
  constructor() {
    this.geminiApiKey = process.env.GEMINI_API_KEY?.trim();
    this.genAI = this.geminiApiKey ? new GoogleGenerativeAI(this.geminiApiKey) : null;
  }

  async generateCompletion(prompt, options = {}) {
    console.log('🤖 AI Service called with prompt length:', prompt.length);
    
    if (!this.genAI || !this.geminiApiKey) {
      throw new Error('Gemini API key is required for AI question generation');
    }
    
    console.log('🚀 Calling Gemini API...');
    const result = await this.geminiCompletion(prompt, options);
    console.log('✅ Gemini API response received, length:', result.length);
    return result;
  }

  async geminiCompletion(prompt, options = {}) {
    const model = this.genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash'
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
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
      // Extract interview type and topic from prompt
      const lowerPrompt = prompt.toLowerCase();
      let questions = [];
      
      if (lowerPrompt.includes('technical') || lowerPrompt.includes('coding')) {
        if (lowerPrompt.includes('javascript') || lowerPrompt.includes('react')) {
          questions = [
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
              questionText: "How does React's virtual DOM work?",
              expectedAnswer: "Virtual DOM is a JavaScript representation of the real DOM that React uses to optimize updates.",
              keyPoints: ["Diffing algorithm", "Performance optimization", "Reconciliation"]
            }
          ];
        } else if (lowerPrompt.includes('python') || lowerPrompt.includes('data')) {
          questions = [
            {
              questionText: "Explain the difference between lists and tuples in Python.",
              expectedAnswer: "Lists are mutable and use square brackets, tuples are immutable and use parentheses.",
              keyPoints: ["Mutability", "Performance", "Use cases"]
            },
            {
              questionText: "What is a decorator in Python?",
              expectedAnswer: "A decorator is a function that modifies the behavior of another function without changing its code.",
              keyPoints: ["Higher-order functions", "@ syntax", "Common use cases"]
            },
            {
              questionText: "How do you handle exceptions in Python?",
              expectedAnswer: "Use try-except blocks to catch and handle exceptions gracefully.",
              keyPoints: ["Try-except syntax", "Exception types", "Finally block"]
            }
          ];
        } else {
          questions = [
            {
              questionText: "What is the time complexity of binary search?",
              expectedAnswer: "O(log n) because we eliminate half of the search space in each iteration.",
              keyPoints: ["Divide and conquer", "Sorted array requirement", "Logarithmic complexity"]
            },
            {
              questionText: "Explain the difference between stack and queue.",
              expectedAnswer: "Stack follows LIFO (Last In First Out), queue follows FIFO (First In First Out).",
              keyPoints: ["Data structure operations", "Use cases", "Implementation"]
            },
            {
              questionText: "What is object-oriented programming?",
              expectedAnswer: "OOP is a programming paradigm based on objects that contain data and methods.",
              keyPoints: ["Encapsulation", "Inheritance", "Polymorphism"]
            }
          ];
        }
      } else if (lowerPrompt.includes('behavioral') || lowerPrompt.includes('hr')) {
        questions = [
          {
            questionText: "Tell me about a time you faced a challenging problem at work.",
            expectedAnswer: "Use the STAR method to describe a specific situation, task, action, and result.",
            keyPoints: ["STAR method", "Problem-solving skills", "Specific examples"]
          },
          {
            questionText: "Describe a situation where you had to work with a difficult team member.",
            expectedAnswer: "Focus on communication, understanding different perspectives, and finding solutions.",
            keyPoints: ["Conflict resolution", "Communication skills", "Team collaboration"]
          },
          {
            questionText: "Where do you see yourself in 5 years?",
            expectedAnswer: "Show career growth aligned with the company's opportunities and your skills development.",
            keyPoints: ["Career goals", "Company alignment", "Skill development"]
          }
        ];
      } else if (lowerPrompt.includes('system_design') || lowerPrompt.includes('system design')) {
        questions = [
          {
            questionText: "Design a URL shortening service like bit.ly.",
            expectedAnswer: "Consider database design, caching, load balancing, and scalability requirements.",
            keyPoints: ["Database schema", "Caching strategy", "Scalability"]
          },
          {
            questionText: "How would you design a chat application?",
            expectedAnswer: "Consider real-time messaging, user management, message storage, and notification systems.",
            keyPoints: ["WebSocket connections", "Message queuing", "Database design"]
          },
          {
            questionText: "Design a social media feed system.",
            expectedAnswer: "Consider user relationships, content ranking, caching, and real-time updates.",
            keyPoints: ["Feed generation", "Ranking algorithms", "Caching strategies"]
          }
        ];
      } else {
        // Default technical questions
        questions = [
          {
            questionText: "Tell me about yourself and your background.",
            expectedAnswer: "Provide a concise overview of your experience, skills, and what you're looking for.",
            keyPoints: ["Professional summary", "Key achievements", "Career goals"]
          },
          {
            questionText: "What interests you about this role?",
            expectedAnswer: "Connect your skills and interests to the specific role and company.",
            keyPoints: ["Role alignment", "Company research", "Career growth"]
          },
          {
            questionText: "What is your greatest strength?",
            expectedAnswer: "Choose a strength relevant to the role and provide specific examples.",
            keyPoints: ["Relevant skills", "Specific examples", "Impact on work"]
          }
        ];
      }
      
      return JSON.stringify(questions);
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
