import { BrevoClient } from "@getbrevo/brevo";
import dotenv from "dotenv";
import logger from "./logger.js";
dotenv.config();

let brevo = null;

function getBrevoClient() {
  if (!brevo && process.env.BREVO_API_KEY) {
    try {
      brevo = new BrevoClient({
        apiKey: process.env.BREVO_API_KEY,
      });
    } catch (err) {
      logger.warn({ err: err.message }, 'Failed to initialize Brevo email client');
    }
  }
  return brevo;
}

const sendEmail = async ({ toEmail, subject, htmlContent }) => {
  const client = getBrevoClient();
  if (!client) {
    logger.warn('Email not sent: Brevo client not configured');
    return null;
  }

  try {
    const response = await client.transactionalEmails.sendTransacEmail({
      sender: {
        name: process.env.BREVO_SENDER_NAME || 'FixNearby',
        email: process.env.BREVO_SENDER_EMAIL || 'noreply@fixnearby.com',
      },
      to: [{ email: toEmail }],
      subject,
      htmlContent,
    });

    logger.info({ toEmail, subject }, 'Email sent successfully');
    return response;
  } catch (error) {
    logger.error({ err: error, toEmail, subject }, 'Failed to send email');
    throw error;
  }
};

export default sendEmail;