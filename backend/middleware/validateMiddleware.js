import validator from 'validator';

export const validate = (schema) => (req, res, next) => {
  const errors = [];

  for (const [field, rules] of Object.entries(schema)) {
    const value = req.body[field];

    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field} is required`);
      continue;
    }

    if (value === undefined || value === null || value === '') continue;

    if (rules.email && !validator.isEmail(String(value))) {
      errors.push(`${field} must be a valid email`);
    }
    if (rules.minLength && String(value).length < rules.minLength) {
      errors.push(`${field} must be at least ${rules.minLength} characters`);
    }
    if (rules.isNumeric && !validator.isNumeric(String(value), { no_symbols: false })) {
      errors.push(`${field} must be a number`);
    }
  }

  if (errors.length) {
    return res.status(400).json({ success: false, message: errors.join(', ') });
  }
  next();
};
