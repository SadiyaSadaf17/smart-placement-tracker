const COMMON_WEAK_PASSWORDS = new Set([
  'password',
  'password123',
  'admin123',
  'student123',
  '12345678',
  'qwerty123',
]);

export const validateStrongPassword = (password) => {
  const value = String(password || '');
  const failures = [];

  if (value.length < 8) failures.push('at least 8 characters');
  if (!/[a-z]/.test(value)) failures.push('one lowercase letter');
  if (!/[A-Z]/.test(value)) failures.push('one uppercase letter');
  if (!/\d/.test(value)) failures.push('one number');
  if (!/[^A-Za-z0-9]/.test(value)) failures.push('one special character');
  if (COMMON_WEAK_PASSWORDS.has(value.toLowerCase())) failures.push('not a common/default password');

  return {
    valid: failures.length === 0,
    message: failures.length ? `Password must include ${failures.join(', ')}` : '',
  };
};

export const assertStrongPassword = (password) => {
  const result = validateStrongPassword(password);
  if (!result.valid) {
    const error = new Error(result.message);
    error.statusCode = 400;
    throw error;
  }
};
