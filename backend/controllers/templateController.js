import asyncHandler from '../utils/asyncHandler.js';
import { buildTemplateWorkbook, templateNames } from '../services/templateService.js';

export const listTemplates = asyncHandler(async (req, res) => {
  res.json({ success: true, data: templateNames });
});

export const downloadTemplate = asyncHandler(async (req, res) => {
  const buffer = buildTemplateWorkbook(req.params.name);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=${req.params.name}-template.xlsx`);
  res.send(buffer);
});
