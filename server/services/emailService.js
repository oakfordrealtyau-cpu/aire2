import transporter from '../config/email.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const APP_NAME = process.env.APP_NAME || 'Ai-re';
const APP_URL = process.env.APP_URL || 'http://localhost:8080';

// Logo support order: 1) APP_LOGO_URL env 2) public/ file served at APP_URL 3) inline CID from src assets
const LOGO_CID = 'ai-re-logo@ai-re';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Public copy (served from APP_URL)
const PUBLIC_LOGO_FILENAME = 'Primary Logo (Dark Mode).png';
const PUBLIC_LOGO_PATH = path.resolve(__dirname, '../../main/public', PUBLIC_LOGO_FILENAME);
const publicLogoExists = fs.existsSync(PUBLIC_LOGO_PATH);
const PUBLIC_LOGO_URL = publicLogoExists ? `${APP_URL}/${encodeURIComponent(PUBLIC_LOGO_FILENAME)}` : null;

// Local asset fallback (inline CID)
const LOCAL_LOGO_PATH = path.resolve(__dirname, '../../main/src/assets/AI-RE Logo no background/Primary Logo (Dark Mode).png');
const localLogoExists = fs.existsSync(LOCAL_LOGO_PATH);
const logoAttachment = localLogoExists ? [{ filename: 'ai-re-logo.png', path: LOCAL_LOGO_PATH, cid: LOGO_CID }] : [];

// Determine LOGO_SRC (env > public > cid)
const LOGO_SRC = process.env.APP_LOGO_URL || PUBLIC_LOGO_URL || (localLogoExists ? `cid:${LOGO_CID}` : '');

/**
 * Send verification code email
 * @param {string} email - Recipient email
 * @param {string} firstName - Recipient's first name
 * @param {string} code - 6-digit verification code
 */
export const sendVerificationEmail = async (email, firstName, code) => {
  const mailOptions = {
    from: `"${APP_NAME}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to: email,
    subject: `Your ${APP_NAME} Verification Code`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 520px; margin: 0 auto; background: white; border-radius: 16px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0a1628 0%, #142140 100%); padding: 40px 40px 30px; text-align: center;">
              <div style="display:flex; align-items:center; justify-content:center; gap:12px;">
                <img src="${LOGO_SRC}" alt="${APP_NAME} logo" title="${APP_NAME}" style="height:44px; width:auto; display:block; object-fit:contain;" />
                <h1 style="margin: 0; color: #14b8a6; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">
                  ${APP_NAME}
                </h1>
              </div>
              <p style="margin: 8px 0 0; color: rgba(255,255,255,0.7); font-size: 14px;">
                Australia's AI-Powered Property Platform
              </p>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px; color: #0a1628; font-size: 22px; font-weight: 700;">
                G'day ${firstName}! 👋
              </h2>
              
              <p style="margin: 0 0 24px; color: #4b5563; font-size: 15px; line-height: 1.6;">
                Welcome to ${APP_NAME}! You're just one step away from listing your property with us. Please use the verification code below to complete your registration:
              </p>
              
              <!-- Verification Code Box -->
              <div style="background: linear-gradient(135deg, #f0fdfa 0%, #ecfeff 100%); border: 2px solid #14b8a6; border-radius: 12px; padding: 24px; text-align: center; margin: 0 0 24px;">
                <p style="margin: 0 0 8px; color: #0f766e; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                  Your Verification Code
                </p>
                <p style="margin: 0; color: #0a1628; font-size: 36px; font-weight: 800; letter-spacing: 8px; font-family: 'Monaco', 'Consolas', monospace;">
                  ${code}
                </p>
              </div>
              
              <p style="margin: 0 0 16px; color: #6b7280; font-size: 14px; line-height: 1.5;">
                ⏱️ This code will expire in <strong>10 minutes</strong> for your security.
              </p>
              
              <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
                If you didn't request this code, please ignore this email or contact our support team.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background: #f8fafc; padding: 24px 40px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px; color: #9ca3af; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center;">
                Sydney, NSW • Melbourne, VIC • Brisbane, QLD • Perth, WA
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    text: `
G'day ${firstName}!

Welcome to ${APP_NAME}! Your verification code is: ${code}

This code will expire in 10 minutes.

If you didn't request this code, please ignore this email.

© ${new Date().getFullYear()} ${APP_NAME}
    `.trim(),
    attachments: LOGO_SRC.startsWith('cid:') ? logoAttachment : [],
  }; 

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Verification email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Failed to send verification email:', error);
    throw new Error('Failed to send verification email');
  }
};

/**
 * Send welcome email after successful registration
 * @param {string} email - Recipient email
 * @param {string} firstName - Recipient's first name
 */
export const sendWelcomeEmail = async (email, firstName) => {
  const mailOptions = {
    from: `"${APP_NAME}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to: email,
    subject: `Welcome to ${APP_NAME} - Let's Get Your Property Listed!`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to ${APP_NAME}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 520px; margin: 0 auto; background: white; border-radius: 16px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0a1628 0%, #142140 100%); padding: 40px 40px 30px; text-align: center;">
              <div style="display:flex; align-items:center; justify-content:center; gap:12px;">
                <img src="${LOGO_SRC}" alt="${APP_NAME} logo" title="${APP_NAME}" style="height:44px; width:auto; display:block; object-fit:contain;" />
                <h1 style="margin: 0; color: #14b8a6; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">
                  ${APP_NAME}
                </h1>
              </div>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px; color: #0a1628; font-size: 22px; font-weight: 700;">
                Welcome aboard, ${firstName}! 🎉
              </h2>
              
              <p style="margin: 0 0 24px; color: #4b5563; font-size: 15px; line-height: 1.6;">
                Your seller account has been successfully created. You're now ready to list your property and reach thousands of potential buyers across Australia.
              </p>
              
              <div style="margin: 0 0 24px;">
                <h3 style="margin: 0 0 16px; color: #0a1628; font-size: 16px; font-weight: 600;">
                  What's next?
                </h3>
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 12px 16px; background: #f0fdfa; border-radius: 8px; margin-bottom: 8px;">
                      <p style="margin: 0; color: #0f766e; font-size: 14px;">
                        ✅ Complete your seller profile
                      </p>
                    </td>
                  </tr>
                  <tr><td style="height: 8px;"></td></tr>
                  <tr>
                    <td style="padding: 12px 16px; background: #f0fdfa; border-radius: 8px;">
                      <p style="margin: 0; color: #0f766e; font-size: 14px;">
                        📸 Add your property details and photos
                      </p>
                    </td>
                  </tr>
                  <tr><td style="height: 8px;"></td></tr>
                  <tr>
                    <td style="padding: 12px 16px; background: #f0fdfa; border-radius: 8px;">
                      <p style="margin: 0; color: #0f766e; font-size: 14px;">
                        🤖 Let our AI help you price and market
                      </p>
                    </td>
                  </tr>
                </table>
              </div>
              
              <a href="${APP_URL}/dashboard" style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">
                Go to Your Dashboard →
              </a>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background: #f8fafc; padding: 24px 40px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px; color: #9ca3af; font-size: 12px; text-align: center;">
                Need help? Reply to this email or call us at 1300 OAK FORD
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    attachments: LOGO_SRC.startsWith('cid:') ? logoAttachment : [],
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Welcome email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Failed to send welcome email:', error);
    // Don't throw - welcome email is not critical
  }
};
