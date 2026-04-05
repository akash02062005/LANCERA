const axios = require('axios');

const OSM_BASE_URL = process.env.OSM_BASE_URL || 'https://api.osmapi.com/v1';
const OSM_API_KEY = process.env.OSM_API_KEY;

async function callAI(messages, maxTokens = 500) {
  try {
    const response = await axios.post(
      `${OSM_BASE_URL}/chat/completions`,
      {
        model: 'gpt-4o-mini',
        messages,
        max_tokens: maxTokens,
        temperature: 0.7
      },
      {
        headers: {
          Authorization: `Bearer ${OSM_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('AI service error:', error.response?.data || error.message);
    return null;
  }
}

async function generateProjectDescription(title, keywords) {
  const prompt = `Generate a professional, detailed project description for a freelance project titled "${title}". Keywords: ${keywords}. Include scope, deliverables, and expected outcomes. Keep it under 300 words. Be specific and technical.
  
  IMPORTANT: Do NOT include any headings like "Project Title:" or "Project Description:" in your output. Provide ONLY the description text itself.`;
  const result = await callAI([{ role: 'user', content: prompt }], 600);
  return result ? result.replace(/^\*\*?Project Title:.*?\*\*?\s*/i, '').replace(/^\*\*?Project Description:.*?\*\*?\s*/i, '').trim() : `This project involves developing ${title}. The selected freelancer will be responsible for delivering a complete, working solution meeting all specified requirements. The project includes full development, testing, and deployment support.`;
}

async function refineProjectDescription(description) {
  const prompt = `Refine the following project description into a high-quality, professional freelance project listing. Improve the grammar, structure, and professional tone while strictly following these rules:
  
  STRICT RULES:
  1. ONLY improve the existing content. 
  2. DO NOT add any new technical requirements, false information, or external data. 
  3. Focus on clarity, accuracy, and marketplace appeal. 
  4. Use professional industry-standard terminology.
  5. Keep it concise but thorough.
  6. DO NOT include any headings like "Project Title:" or "Project Description:" in your output. Provide ONLY the refined description text.
  
  Description to refine:
  "${description}"`;
  
  let result = await callAI([{ role: 'user', content: prompt }], 600);
  if (result) {
    // Clean up potential AI hallucinations of headings
    result = result.replace(/^\*\*?Project Title:.*?\*\*?\s*/i, '')
                  .replace(/^\*\*?Project Description:.*?\*\*?\s*/i, '')
                  .trim();
  }
  return result || description;
}

async function suggestBudget(description, skills) {
  const prompt = `You are a professional freelance marketplace pricing expert specializing in the Indian tech market (INR).
  
  Analyze the following project description and required skills based on current 2024-2025 market rates for remote developers in India.
  
  Project: ${description.substring(0, 500)}
  Skills: ${skills.join(', ')}
  
  Based on technical complexity, suggest:
  1. maxBudget: A fair total project budget for a high-quality freelancer.
  2. minBidFloor: The minimum acceptable amount a professional freelancer would work for (the lowest bid floor).
  
  Respond ONLY in this exact JSON format:
  {"minBidFloor": 12000, "maxBudget": 45000, "currency": "INR", "reasoning": "brief reason considering complexity"}`;

  const result = await callAI([{ role: 'user', content: prompt }], 300);
  try {
    const json = JSON.parse(result);
    return json;
  } catch {
    return { minBidFloor: 5000, maxBudget: 25000, currency: 'INR', reasoning: 'Based on average market rates for similar projects' };
  }
}

async function identifySkills(description) {
  const prompt = `Extract the top 6-8 technical skills required for this project as a JSON array of strings. Only include specific skills (e.g., "React.js", "Node.js", "MongoDB").

Project: ${description.substring(0, 500)}

Respond ONLY with a JSON array like: ["React.js", "Node.js"]`;

  const result = await callAI([{ role: 'user', content: prompt }], 150);
  try {
    return JSON.parse(result);
  } catch {
    return ['JavaScript', 'React.js', 'Node.js'];
  }
}

async function generateQuizQuestions(projectDescription, skills, count = 5) {
  const prompt = `Generate ${count} technical multiple-choice questions to screen a freelancer for this project.

Project: ${projectDescription.substring(0, 400)}
Skills: ${skills.join(', ')}

Each question must have exactly 4 options and one correct answer. Make questions practical and relevant.

Respond ONLY in this JSON format:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0
  }
]
correctAnswer is the index (0-3) of the correct option.`;

  const result = await callAI([{ role: 'user', content: prompt }], 800);
  try {
    const parsed = JSON.parse(result);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {}

  // Fallback questions
  return [
    { question: `Which of the following is a key principle of ${skills[0] || 'software development'}?`, options: ['Encapsulation', 'Randomization', 'Speculation', 'Obfuscation'], correctAnswer: 0 },
    { question: 'What does REST stand for in web development?', options: ['Random Entry State Transfer', 'Representational State Transfer', 'Remote Entry State Transfer', 'Representational System Transfer'], correctAnswer: 1 },
    { question: 'Which HTTP method is used to update a resource?', options: ['GET', 'POST', 'PUT', 'DELETE'], correctAnswer: 2 },
    { question: 'What is the purpose of version control?', options: ['Speed up development', 'Track and manage code changes', 'Deploy applications', 'Test software'], correctAnswer: 1 },
    { question: 'Which is best for managing asynchronous operations in JavaScript?', options: ['Callbacks only', 'Synchronous loops', 'Promises and async/await', 'Global variables'], correctAnswer: 2 }
  ];
}

async function suggestPhases(description, duration, projectType) {
  const prompt = `Break down this freelance project into 3-5 clear phases/milestones.

Project: ${description.substring(0, 400)}
Total Duration: ${duration}

Respond ONLY in this JSON format:
[
  {
    "name": "Phase 1: Design",
    "description": "Create wireframes and UI mockups",
    "estimatedDays": 7,
    "suggestedPaymentPercent": 20
  }
]
Ensure payment percentages sum to 100.`;

  const result = await callAI([{ role: 'user', content: prompt }], 500);
  try {
    const parsed = JSON.parse(result);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {}

  return [
    { name: 'Phase 1: Planning & Design', description: 'Requirements gathering, wireframes, and design mockups', estimatedDays: 5, suggestedPaymentPercent: 20 },
    { name: 'Phase 2: Development', description: 'Core feature development and implementation', estimatedDays: 14, suggestedPaymentPercent: 50 },
    { name: 'Phase 3: Testing & Deployment', description: 'QA testing, bug fixes, and final deployment', estimatedDays: 5, suggestedPaymentPercent: 30 }
  ];
}

function calculateSmartBidFeedback(bidAmount, currentLowest, minBid, maxBudget, remainingBidders, timeLeftSeconds) {
  let status, winningChance, recommendation;

  const range = maxBudget - minBid;
  const bidPosition = (bidAmount - minBid) / range;
  const lowestPosition = currentLowest ? (currentLowest - minBid) / range : 1;

  if (!currentLowest || bidAmount < currentLowest) {
    if (bidPosition < 0.3) {
      status = 'LOW';
      winningChance = Math.min(85, 60 + (0.3 - bidPosition) * 100);
    } else if (bidPosition < 0.6) {
      status = 'FAIR';
      winningChance = Math.min(70, 40 + (0.6 - bidPosition) * 50);
    } else {
      status = 'HIGH';
      winningChance = Math.max(10, 30 - bidPosition * 20);
    }
  } else if (bidAmount === currentLowest) {
    status = 'FAIR';
    winningChance = 45;
  } else {
    status = 'HIGH';
    winningChance = Math.max(5, 20 - (bidAmount - currentLowest) / range * 50);
  }

  winningChance = Math.round(winningChance);
  const suggestedBid = currentLowest ? Math.round(currentLowest * 0.92) : Math.round(maxBudget * 0.75);
  recommendation = `Consider bidding ₹${suggestedBid.toLocaleString()} for an optimal winning chance.`;

  return { status, winningChance, recommendation, suggestedBid };
}

function calculateRecommendationScore(bidAmount, maxBudget, quizScore, profileMatchScore) {
  const bidCompetitiveness = Math.max(0, ((maxBudget - bidAmount) / maxBudget) * 100);
  return Math.round((bidCompetitiveness * 0.4) + (quizScore * 0.35) + (profileMatchScore * 0.25));
}

function calculateProjectHealth(phases, projectCreatedAt) {
  const now = new Date();
  let delayedCount = 0, atRiskCount = 0;

  for (const phase of phases) {
    if (!phase.deadline) continue;
    const deadline = new Date(phase.deadline);
    const daysUntil = (deadline - now) / (1000 * 60 * 60 * 24);

    if (phase.status === 'pending' || phase.status === 'in_progress') {
      if (daysUntil < 0) delayedCount++;
      else if (daysUntil < 2) atRiskCount++;
    }
  }

  if (delayedCount > 0) return 'delayed';
  if (atRiskCount > 0) return 'at_risk';
  return 'on_track';
}

module.exports = {
  generateProjectDescription,
  refineProjectDescription,
  suggestBudget,
  identifySkills,
  generateQuizQuestions,
  suggestPhases,
  calculateSmartBidFeedback,
  calculateRecommendationScore,
  calculateProjectHealth
};
