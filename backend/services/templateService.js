import XLSX from 'xlsx';

const TEMPLATES = {
  students: ['email', 'fullName', 'rollNumber', 'branch', 'department', 'batchYear', 'section', 'currentYear', 'cgpa', 'phone'],
  applicationResults: ['rollNumber', 'company', 'round', 'status', 'remarks'],
  testScores: ['rollNumber', 'testTitle', 'score', 'totalMarks', 'remarks'],
  interviewScores: ['rollNumber', 'company', 'communicationScore', 'technicalScore', 'hrScore', 'confidenceScore', 'feedbackNotes'],
  bulkStatus: ['rollNumber', 'company', 'round', 'status', 'remarks'],
};

export const buildTemplateWorkbook = (templateName) => {
  const headers = TEMPLATES[templateName];
  if (!headers) {
    const error = new Error('Unknown template');
    error.statusCode = 404;
    throw error;
  }

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([headers]);
  XLSX.utils.book_append_sheet(wb, ws, 'Template');
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
};

export const templateNames = Object.keys(TEMPLATES);
