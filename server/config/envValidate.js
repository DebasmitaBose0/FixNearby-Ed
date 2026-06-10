import dotenv from 'dotenv';
dotenv.config();

/**
 * Environment variables are split into two categories:
 *
 * REQUIRED – The server CANNOT function without these.  If any are missing the
 *            process exits immediately with a clear error message.
 *
 * OPTIONAL – The server CAN run without these (with degraded functionality).
 *            A warning is printed so operators know what is missing, but the
 *            process continues.
 *
 * NOTE: MONGODB_URI is intentionally optional because `config/db.js` already
 * handles a missing URI gracefully (prints a warning and skips the connection)
 * and several controllers (e.g. issueController) provide an in-memory fallback
 * for local development without MongoDB.
 */

const REQUIRED_ENV_VARS = [
  'JWT_SECRET',
  'PORT'
];

const OPTIONAL_ENV_VARS = [
  { name: 'MONGODB_URI', note: 'Server will run in in-memory fallback mode without a database' },
  { name: 'CLIENT_URL', note: 'Password-reset emails will not contain a valid link' },
  { name: 'BREVO_API_KEY', note: 'Email sending (password reset) will be unavailable' },
  { name: 'BREVO_SENDER_EMAIL', note: 'Email sending (password reset) will be unavailable' },
  { name: 'BREVO_SENDER_NAME', note: 'Email sending (password reset) will be unavailable' },
];

/**
 * Validates environment variables on startup.
 * - Missing required vars → fatal error + process.exit(1)
 * - Missing optional vars → warning only (server continues)
 */
export const validateEnv = () => {
  const missing = [];

  for (const varName of REQUIRED_ENV_VARS) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  if (missing.length > 0) {
    console.error('========================================================================');
    console.error('FATAL ERROR: Missing Required Environment Variables:');
    for (const name of missing) {
      console.error(`  - ${name}`);
    }
    console.error('Please configure them in your .env file before starting the application.');
    console.error('========================================================================');
    process.exit(1);
  }

  // Check optional vars and warn
  const missingOptional = OPTIONAL_ENV_VARS.filter((v) => !process.env[v.name]);
  if (missingOptional.length > 0) {
    console.warn('------------------------------------------------------------------------');
    console.warn('WARNING: Missing Optional Environment Variables:');
    for (const { name, note } of missingOptional) {
      console.warn(`  - ${name}: ${note}`);
    }
    console.warn('------------------------------------------------------------------------');
  }

  console.log('✔ Environment variables validation passed.');
};
