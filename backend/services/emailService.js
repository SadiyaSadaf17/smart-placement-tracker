import nodemailer from 'nodemailer';

const createTransporter = () => {
  if (!process.env.EMAIL_USER) return null;
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

export const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = createTransporter();
  if (!transporter) {
    console.log(`[Email skipped] To: ${to} | ${subject}`);
    return { skipped: true };
  }

  return transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject,
    html,
    text,
  });
};

export const sendPasswordResetEmail = async (email, resetUrl) => {
  return sendEmail({
    to: email,
    subject: 'Password Reset - Placement Tracker',
    html: `<p>Reset your password:</p><a href="${resetUrl}">${resetUrl}</a><p>Link expires in 1 hour.</p>`,
    text: `Reset password: ${resetUrl}`,
  });
};
