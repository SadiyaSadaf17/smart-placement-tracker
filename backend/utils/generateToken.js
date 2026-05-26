import jwt from 'jsonwebtoken';

export const generateToken = (userOrId) => {
  const payload = typeof userOrId === 'object'
    ? { id: userOrId._id, tokenVersion: userOrId.tokenVersion || 0 }
    : { id: userOrId };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};
