import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

export const getTaskInsights = async (req, res, next) => {
    try {
        const { tasks } = req.body;

        const prompt = `
      Analyze these tasks and provide insights:
      ${JSON.stringify(tasks, null, 2)}
      
      Consider:
      1. Task priorities and deadlines
      2. Workload distribution
      3. Potential bottlenecks
      4. Optimization suggestions
      
      Format the response as JSON with these keys:
      - suggestions: Array of actionable suggestions
      - warnings: Array of potential issues
      - optimization: Object with scheduling tips
    `;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const insights = JSON.parse(response.text());

        res.json(insights);
    } catch (error) {
        next(error);
    }
};

export const getSchedulingSuggestions = async (req, res, next) => {
    try {
        const { tasks } = req.body;

        const prompt = `
      Suggest an optimal schedule for these tasks:
      ${JSON.stringify(tasks, null, 2)}
      
      Consider:
      1. Task priorities
      2. Due dates
      3. Estimated completion time
      4. Dependencies
      
      Format the response as JSON with these keys:
      - schedule: Array of scheduled tasks with suggested times
      - rationale: String explaining the scheduling logic
    `;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const suggestions = JSON.parse(response.text());

        res.json(suggestions);
    } catch (error) {
        next(error);
    }
};

export const getProductivityAnalysis = async (req, res, next) => {
    try {
        const { tasks, dateRange } = req.body;

        const prompt = `
      Analyze productivity patterns for these tasks:
      ${JSON.stringify(tasks, null, 2)}
      
      Date Range: ${JSON.stringify(dateRange)}
      
      Provide:
      1. Productivity patterns
      2. Peak performance times
      3. Improvement suggestions
      
      Format the response as JSON with these keys:
      - patterns: Array of identified patterns
      - peakTimes: Object with optimal working hours
      - suggestions: Array of improvement tips
    `;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const analysis = JSON.parse(response.text());

        res.json(analysis);
    } catch (error) {
        next(error);
    }
};