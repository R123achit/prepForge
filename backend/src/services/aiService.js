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
      // Prioritize OpenAI if available, then Groq
      if (this.openaiApiKey && this.openaiApiKey.trim()) {
        return await this.openaiCompletion(prompt, options);
      } else if (this.groqApiKey && this.groqApiKey.trim()) {
        return await this.groqCompletion(prompt, options);
      } else {
        // Fallback mock response if no API keys configured
        console.warn('No AI API keys configured, using mock responses');
        return this.mockCompletion(prompt);
      }
    } catch (error) {
      console.error('AI Service Error:', error.response?.data || error.message);
      // Fallback to mock on API errors
      console.warn('Falling back to mock responses due to API error');
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
    } else {
      // Mock chatbot response
      return "I'm here to help you with interview preparation! I can assist with:\n\n• Practice interview questions\n• Resume tips and feedback\n• Technical concept explanations\n• Career guidance\n• Platform features\n\nWhat would you like to know more about?";
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
