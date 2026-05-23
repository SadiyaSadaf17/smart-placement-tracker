import fs from 'fs';
import { PDFParse } from 'pdf-parse';

/**
 * Checks if the extracted text resembles a student resume.
 * Uses a heuristic of contact details (email) and section keyword categories.
 * 
 * @param {string} text - The raw text extracted from the PDF.
 * @returns {boolean} - True if the text matches resume criteria.
 */
export const isResumeText = (text) => {
  if (!text || text.trim().length < 150) {
    return false;
  }

  const lowerText = text.toLowerCase();

  // 1. Email check (most resumes have an email)
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const hasEmail = emailRegex.test(lowerText);

  // 2. Keyword categories
  const educationKeywords = [
    'education', 'academic', 'degree', 'university', 'college', 'school',
    'cgpa', 'gpa', 'btech', 'b.tech', 'mtech', 'm.tech', 'bca', 'mca',
    'bsc', 'msc', 'hsc', 'ssc', 'semester', 'coursework'
  ];

  const skillsKeywords = [
    'skills', 'technologies', 'programming', 'languages', 'databases',
    'frameworks', 'tools', 'expertise'
  ];

  const projectsKeywords = [
    'projects', 'project', 'github', 'git', 'portfolio'
  ];

  const experienceKeywords = [
    'experience', 'work', 'employment', 'intern', 'internship', 'job',
    'developer', 'engineer', 'analyst', 'freelancer', 'professional', 'history'
  ];

  let matchCount = 0;
  if (educationKeywords.some(kw => lowerText.includes(kw))) matchCount++;
  if (skillsKeywords.some(kw => lowerText.includes(kw))) matchCount++;
  if (projectsKeywords.some(kw => lowerText.includes(kw))) matchCount++;
  if (experienceKeywords.some(kw => lowerText.includes(kw))) matchCount++;

  // Heuristic: A resume should have an email and match at least 2 categories,
  // OR match at least 3 categories even without an email.
  return (hasEmail && matchCount >= 2) || matchCount >= 3;
};

/**
 * Reads a PDF file from filePath and parses its content to validate if it's a resume.
 * 
 * @param {string} filePath - Absolute path to the PDF file.
 * @returns {Promise<boolean>} - Resolves to true if the PDF is a valid resume.
 */
export const validateResumePDF = async (filePath) => {
  try {
    if (!fs.existsSync(filePath)) {
      return false;
    }
    const dataBuffer = fs.readFileSync(filePath);
    const parser = new PDFParse({ data: dataBuffer });
    const parsedData = await parser.getText();
    const isValid = isResumeText(parsedData.text);
    await parser.destroy();
    return isValid;
  } catch (error) {
    console.error('Error parsing PDF resume:', error);
    return false;
  }
};
