import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API client if API key is provided
const apiKey = process.env.GEMINI_API_KEY;
let genAI = null;
if (apiKey && apiKey !== 'your_gemini_api_key_here') {
  genAI = new GoogleGenerativeAI(apiKey);
} else {
  console.warn('Warning: GEMINI_API_KEY is not configured. Falling back to local simulated AI responses.');
}

/**
 * Strips markdown code block wrappers (e.g. ```json ... ```) from a string.
 */
const cleanJsonString = (raw) => {
  return raw
    .replace(/^```json\s*/i, '')
    .replace(/```\s*$/, '')
    .trim();
};

/**
 * Validates whether a given text is a real resume.
 * 
 * @param {string} text - Extracted PDF text.
 * @returns {Promise<{isValid: boolean, confidence: number, reason: string}>}
 */
export const validateResumeWithAI = async (text) => {
  if (!text || text.trim().length < 100) {
    return {
      isValid: false,
      confidence: 0.1,
      reason: 'Empty or extremely short document text.',
    };
  }

  if (!genAI) {
    return getLocalMockValidation(text);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `
You are an AI resume screener. Analyze the following text extracted from a PDF document and determine if it is a professional student resume or CV.
Reject documents that are lecture notes, homework/assignments, textbooks, random documents, letters, or slides.

Respond ONLY in JSON format:
{
  "isValid": true or false,
  "confidence": a number between 0 and 1,
  "reason": "a brief 1-sentence reason for your decision"
}

Document Text:
"""
${text}
"""
`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const rawText = result.response.text();
    const cleaned = cleanJsonString(rawText);
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('Gemini Resume Validation API Error:', error);
    return getLocalMockValidation(text);
  }
};

/**
 * Generates an ATS score and deep analysis of a resume text.
 * 
 * @param {string} text - Extracted PDF text.
 * @param {object} profile - Student profile data.
 * @returns {Promise<object>}
 */
export const analyzeResumeWithAI = async (text, profile = {}) => {
  if (!genAI) {
    return getLocalMockAnalysis(text, profile);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `
You are an expert ATS (Applicant Tracking System) recruiter. Analyze the following resume text and compare it with the student profile metadata (optional). Evaluate:
1. Skills relevance
2. Project quality
3. Experience level (internships, work, freelancing)
4. Education relevance
5. Formatting and structure quality

Extract all technical and soft skills, analyze job readiness (Beginner, Intermediate, Advanced), estimate a skill match percentage, calculate an overall ATS score (0-100), recommend improvements, and compute compatibility scores (0-100) for standard job roles: "Frontend Developer", "Backend Developer", "Full Stack Developer", "Data Analyst", "Software Engineer".

Student Profile Metadata:
FullName: ${profile.fullName || 'N/A'}
Reported Skills: ${profile.skills?.join(', ') || 'None'}
CGPA: ${profile.cgpa || 'N/A'}
Branch: ${profile.branch || 'N/A'}

Respond ONLY in JSON format:
{
  "atsScore": a number between 0 and 100,
  "skillMatchPercentage": a number between 0 and 100,
  "jobReadinessLevel": "Beginner" | "Intermediate" | "Advanced",
  "evaluationFactors": {
    "skillsRelevance": "feedback on skills relevance",
    "projectQuality": "feedback on projects",
    "experienceLevel": "feedback on experience",
    "educationRelevance": "feedback on education",
    "formattingAndStructureQuality": "feedback on layout and quality"
  },
  "improvementSuggestions": ["suggestion 1", "suggestion 2", ...],
  "jobRoleCompatibility": [
    { "role": "Frontend Developer", "score": number },
    { "role": "Backend Developer", "score": number },
    { "role": "Full Stack Developer", "score": number },
    { "role": "Data Analyst", "score": number },
    { "role": "Software Engineer", "score": number }
  ],
  "extractedSkills": {
    "technical": ["skill1", "skill2", ...],
    "soft": ["skill1", "skill2", ...]
  }
}

Document Text:
"""
${text}
"""
`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const rawText = result.response.text();
    const cleaned = cleanJsonString(rawText);
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('Gemini Resume Analysis API Error:', error);
    return getLocalMockAnalysis(text, profile);
  }
};

/**
 * Heuristic fallback for resume validation.
 */
const getLocalMockValidation = (text) => {
  const lowerText = text.toLowerCase();
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const hasEmail = emailRegex.test(lowerText);

  const categories = [
    ['education', 'academic', 'degree', 'university', 'college', 'school', 'cgpa', 'gpa'],
    ['skills', 'technologies', 'programming', 'languages', 'databases', 'frameworks'],
    ['projects', 'project', 'github', 'git', 'portfolio'],
    ['experience', 'work', 'employment', 'intern', 'internship', 'job', 'developer'],
  ];

  let matches = 0;
  categories.forEach((cat) => {
    if (cat.some((kw) => lowerText.includes(kw))) matches++;
  });

  const isValid = (hasEmail && matches >= 2) || matches >= 3;
  const confidence = isValid ? Math.min(0.9, 0.5 + matches * 0.1) : Math.max(0.15, 0.4 - matches * 0.1);

  return {
    isValid,
    confidence: Math.round(confidence * 100) / 100,
    reason: isValid
      ? 'Local simulation verified presence of standard resume structure and contact information.'
      : 'Local simulation failed: document lacks essential resume headings or contact details.',
  };
};

/**
 * Heuristic fallback for detailed resume analysis.
 */
const getLocalMockAnalysis = (text, profile = {}) => {
  const lowerText = text.toLowerCase();

  // Extract skills dynamically from text
  const techKeywords = [
    'javascript', 'react', 'node.js', 'node', 'express', 'mongodb', 'sql', 'python',
    'java', 'c++', 'html', 'css', 'docker', 'kubernetes', 'aws', 'git', 'typescript',
    'tailwind', 'next.js', 'django', 'flask', 'redux', 'mysql', 'postgresql',
  ];
  const softKeywords = [
    'communication', 'teamwork', 'leadership', 'problem solving', 'organization',
    'creativity', 'time management', 'collaboration', 'adaptability', 'critical thinking',
  ];

  const extractedTech = techKeywords.filter((skill) => lowerText.includes(skill));
  const extractedSoft = softKeywords.filter((skill) => lowerText.includes(skill));

  // If text doesn't contain matching skills, default to profile skills
  if (extractedTech.length === 0 && profile.skills) {
    profile.skills.forEach((s) => extractedTech.push(s));
  }

  // Capitalize skills
  const formatSkillName = (s) => s.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const technical = [...new Set(extractedTech)].map(formatSkillName);
  const soft = [...new Set(extractedSoft)].map(formatSkillName);

  // Compute mock score elements
  const scoreBase = 45;
  const skillPoints = Math.min(25, technical.length * 3);
  const cgpaPoints = profile.cgpa ? (profile.cgpa >= 8 ? 15 : profile.cgpa >= 7 ? 10 : 5) : 10;
  const completenessPoints = (technical.length > 3 ? 5 : 0) + (soft.length > 1 ? 5 : 0) + (lowerText.includes('experience') ? 10 : 0);
  const atsScore = Math.min(100, scoreBase + skillPoints + cgpaPoints + completenessPoints);

  const skillMatchPercentage = Math.min(100, 40 + technical.length * 7);
  const jobReadinessLevel = atsScore >= 80 ? 'Advanced' : atsScore >= 60 ? 'Intermediate' : 'Beginner';

  // Compute job role matches
  const roles = [
    { name: 'Frontend Developer', keywords: ['react', 'html', 'css', 'javascript', 'tailwind', 'next.js'] },
    { name: 'Backend Developer', keywords: ['node', 'express', 'sql', 'mysql', 'mongodb', 'postgresql', 'python', 'java'] },
    { name: 'Full Stack Developer', keywords: ['react', 'node', 'express', 'mongodb', 'javascript'] },
    { name: 'Data Analyst', keywords: ['python', 'sql', 'mysql', 'excel', 'pandas', 'numpy'] },
    { name: 'Software Engineer', keywords: ['c++', 'java', 'python', 'algorithms', 'data structures'] },
  ];

  const jobRoleCompatibility = roles.map((role) => {
    let matchCount = role.keywords.filter((kw) => lowerText.includes(kw)).length;
    let baseScore = 40 + (matchCount * 10);
    // Add weight for matching profile branch (CSE/IT gets higher for developers)
    if (['CSE', 'IT'].includes(profile.branch) && role.name !== 'Data Analyst') {
      baseScore += 10;
    }
    return {
      role: role.name,
      score: Math.min(95, baseScore),
    };
  });

  // Mock feedback
  const improvementSuggestions = [];
  if (technical.length < 5) improvementSuggestions.push('Add more technical skills relevant to your target domain.');
  if (soft.length < 2) improvementSuggestions.push('Incorporate professional soft skills (e.g. teamwork, problem solving).');
  if (!lowerText.includes('project')) improvementSuggestions.push('Detail at least 2 technical projects with github repository links.');
  if (!lowerText.includes('intern') && !lowerText.includes('experience')) {
    improvementSuggestions.push('Include internships, freelancing, or open-source contributions to demonstrate experience.');
  }
  if (!lowerText.includes('education')) improvementSuggestions.push('Format your academic history with dates and CGPA.');

  if (improvementSuggestions.length === 0) {
    improvementSuggestions.push('Optimize your resume description with action verbs.', 'Ensure your LinkedIn and GitHub links are clickable.');
  }

  return {
    atsScore,
    skillMatchPercentage,
    jobReadinessLevel,
    evaluationFactors: {
      skillsRelevance: technical.length > 5 ? 'Excellent alignment with industry standards.' : 'Satisfactory skills. Consider adding modern framework knowledge.',
      projectQuality: lowerText.includes('project') ? 'Good inclusion of project work. Focus on showcasing impact and technologies.' : 'Missing clear project breakdowns. Add details on roles and tools.',
      experienceLevel: (lowerText.includes('intern') || lowerText.includes('experience')) ? 'Strong early-stage experience documented.' : 'Entry level. Highlight class projects or personal lab work.',
      educationRelevance: profile.cgpa ? `Solid academic foundation with a CGPA of ${profile.cgpa}.` : 'Good educational record. Include degrees and branch clearly.',
      formattingAndStructureQuality: 'Standard chronological format with clear headers. Good readability.',
    },
    improvementSuggestions,
    jobRoleCompatibility,
    extractedSkills: { technical, soft },
  };
};
