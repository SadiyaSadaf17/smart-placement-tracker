import Company from '../models/Company.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getCompanies = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 10 } = req.query;
  const query = { isActive: true };
  if (search) query.name = { $regex: search, $options: 'i' };

  const total = await Company.countDocuments(query);
  const companies = await Company.find(query)
    .sort({ name: 1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.json({
    success: true,
    data: companies,
    pagination: { page: Number(page), limit: Number(limit), total },
  });
});

export const createCompany = asyncHandler(async (req, res) => {
  const company = await Company.create(req.body);
  res.status(201).json({ success: true, data: company });
});

export const updateCompany = asyncHandler(async (req, res) => {
  const company = await Company.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!company) {
    res.status(404);
    throw new Error('Company not found');
  }
  res.json({ success: true, data: company });
});

export const deleteCompany = asyncHandler(async (req, res) => {
  await Company.findByIdAndUpdate(req.params.id, { isActive: false });
  res.json({ success: true, message: 'Company deactivated' });
});
