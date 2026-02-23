import nodemailer from 'nodemailer';

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: 'ghostzyroyt2026@gmail.com',
    pass: "wmvq gfin ylqb ixyq",
  },
});

// Verify connection configuration
transporter.verify()
  .then(() => {
    console.log('✅ Email server connected successfully');
  })
  .catch((err) => {
    console.error('❌ Email server connection failed:', err.message);
  });

export default transporter;
