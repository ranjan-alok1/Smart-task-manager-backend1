import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

export const generateTaskInsights = async (tasks) => {
    try {
        const prompt = `
      Analyze these tasks and provide insights:
      ${JSON.stringify(tasks, null, 2)}
      
      Consider:
      1. Task priorities and deadlines
      2. Workload distribution
      3. Potential bottlenecks
      4. Time management suggestions
      
      Provide specific, actionable recommendations.
      
      Format the response as JSON with these keys:
      {
        "suggestions": ["array of specific actionable suggestions"],
        "warnings": ["array of potential issues or bottlenecks"],
        "optimization": {
          "timeManagement": "specific time management advice",
          "prioritization": "task prioritization strategy",
          "workloadBalance": "workload distribution advice"
        }
      }
    `;

        const result = await model.generateContent(prompt);
        const response = result.response;
        return JSON.parse(response.text());
    } catch (error) {
        console.error('Error generating task insights:', error);
        throw new Error('Failed to generate AI insights');
    }
};

export const generateScheduleSuggestions = async (tasks) => {
    try {
        const prompt = `
      Create an optimal schedule for these tasks:
      ${JSON.stringify(tasks, null, 2)}
      
      Consider:
      1. Task priorities and deadlines
      2. Dependencies between tasks
      3. Estimated completion times
      4. Breaks and buffer time
      
      Format the response as JSON with these keys:
      {
        "schedule": [
          {
            "taskId": "task identifier",
            "suggestedStartTime": "YYYY-MM-DD HH:mm",
            "estimatedDuration": "in minutes",
            "rationale": "why this time slot"
          }
        ],
        "recommendations": ["array of scheduling recommendations"],
        "warnings": ["array of potential scheduling conflicts"]
      }
    `;

        const result = await model.generateContent(prompt);
        const response = result.response;
        return JSON.parse(response.text());
    } catch (error) {
        console.error('Error generating schedule suggestions:', error);
        throw new Error('Failed to generate schedule suggestions');
    }
};

export const analyzeProductivity = async (tasks, dateRange) => {
    try {
        const prompt = `
      Analyze productivity patterns for these tasks:
      ${JSON.stringify(tasks, null, 2)}
      
      Date Range: ${JSON.stringify(dateRange)}
      
      Analyze:
      1. Task completion patterns
      2. Peak productivity hours
      3. Efficiency metrics
      4. Areas for improvement
      
      Format the response as JSON with these keys:
      {
        "patterns": {
          "peakHours": ["array of most productive time slots"],
          "completionRate": "tasks completed per day/week",
          "efficiency": "efficiency score and explanation"
        },
        "insights": ["array of productivity insights"],
        "recommendations": ["array of improvement suggestions"],
        "metrics": {
          "averageTasksPerDay": "number",
          "completionRatePercentage": "number",
          "efficiencyScore": "number between 0-100"
        }
      }
    `;

        const result = await model.generateContent(prompt);
        const response = result.response;
        return JSON.parse(response.text());
    } catch (error) {
        console.error('Error analyzing productivity:', error);
        throw new Error('Failed to analyze productivity');
    }
};

export const generateTaskSummary = async (task) => {
    try {
        const prompt = `
      Summarize this task and provide insights:
      ${JSON.stringify(task, null, 2)}
      
      Provide:
      1. Task complexity assessment
      2. Time estimation
      3. Potential challenges
      4. Success factors
      
      Format the response as JSON with these keys:
      {
        "complexity": "low/medium/high with explanation",
        "timeEstimate": "estimated hours/minutes",
        "challenges": ["array of potential challenges"],
        "recommendations": ["array of success factors"],
        "tags": ["suggested tags for categorization"]
      }
    `;

        const result = await model.generateContent(prompt);
        const response = result.response;
        return JSON.parse(response.text());
    } catch (error) {
        console.error('Error generating task summary:', error);
        throw new Error('Failed to generate task summary');
    }
};

// Helper function to validate and clean AI responses
export const sanitizeAIResponse = (response) => {
    try {
        if (typeof response === 'string') {
            response = JSON.parse(response);
        }

        // Ensure required fields exist
        const requiredFields = ['suggestions', 'warnings', 'recommendations'];
        requiredFields.forEach(field => {
            if (!response[field]) {
                response[field] = [];
            }
        });

        return response;
    } catch (error) {
        console.error('Error sanitizing AI response:', error);
        return {
            suggestions: [],
            warnings: [],
            recommendations: [],
            error: 'Failed to process AI response'
        };
    }
};

// Rate limiting and caching could be added here
const cache = new Map();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export const getCachedOrGenerateInsights = async (tasks) => {
    const cacheKey = JSON.stringify(tasks);
    const cachedResult = cache.get(cacheKey);

    if (cachedResult && (Date.now() - cachedResult.timestamp) < CACHE_DURATION) {
        return cachedResult.data;
    }

    const insights = await generateTaskInsights(tasks);
    cache.set(cacheKey, {
        data: insights,
        timestamp: Date.now()
    });

    return insights;
};