const requiredByEnvironment = {
  all: ['JWT_SECRET', 'MONGODB_URI'],
  production: ['CLIENT_URL'],
};

export const validateEnv = () => {
  const required = [
    ...requiredByEnvironment.all,
    ...(process.env.NODE_ENV === 'production' ? requiredByEnvironment.production : []),
  ];

  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters for production-grade security');
  }
};

export const env = {
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  jwtExpire: process.env.JWT_EXPIRE || '7d',
  nodeEnv: process.env.NODE_ENV || 'development',
};
