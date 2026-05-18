export const BRANCHES = ['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL', 'OTHER'];

export const ROUNDS = [
  'Applied',
  'Shortlisted',
  'Aptitude',
  'Technical Round',
  'HR Round',
  'Selected',
  'Rejected',
];

export const DRIVE_STATUSES = ['upcoming', 'active', 'closed', 'cancelled'];

export const API_URL = import.meta.env.VITE_API_URL || '/api';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
