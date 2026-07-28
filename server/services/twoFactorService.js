import otplibPkg from 'otplib';
import QRCode from 'qrcode';
import crypto from 'crypto';

const { authenticator } = otplibPkg;

// Configure authenticator options
authenticator.options = {
  window: 1, // Allow 1 step backward/forward (30s margin) for clock drift
};

/**
 * Generate a new TOTP secret, OTPauth URI, and QR Code Data URL
 * @param {string} accountLabel - User email or account identifier
 * @returns {Promise<{ secret: string, otpauthUrl: string, qrCodeUrl: string }>}
 */
export const generateSecret = async (accountLabel) => {
  const secret = authenticator.generateSecret();
  const otpauthUrl = authenticator.keyuri(accountLabel || 'User', 'FixNearby', secret);
  const qrCodeUrl = await QRCode.toDataURL(otpauthUrl);

  return {
    secret,
    otpauthUrl,
    qrCodeUrl,
  };
};

/**
 * Generate Base64 Data URL for a given OTPauth URL
 * @param {string} otpauthUrl
 * @returns {Promise<string>}
 */
export const generateQRCode = async (otpauthUrl) => {
  return await QRCode.toDataURL(otpauthUrl);
};

/**
 * Verify a 6-digit TOTP token against a secret
 * @param {string} secret
 * @param {string} token
 * @returns {boolean}
 */
export const verifyToken = (secret, token) => {
  if (!secret || !token) return false;
  const cleanToken = String(token).replace(/\s+/g, '').trim();
  try {
    return authenticator.verify({ token: cleanToken, secret });
  } catch (error) {
    console.error('[twoFactorService] verifyToken error:', error.message);
    return false;
  }
};

/**
 * Generate array of 10 single-use recovery codes
 * @returns {Array<{ code: string, used: boolean }>}
 */
export const generateRecoveryCodes = () => {
  const codes = [];
  for (let i = 0; i < 10; i++) {
    const raw = crypto.randomBytes(4).toString('hex').toUpperCase();
    const formatted = `${raw.substring(0, 4)}-${raw.substring(4, 8)}`;
    codes.push({
      code: formatted,
      used: false,
    });
  }
  return codes;
};

export default {
  generateSecret,
  generateQRCode,
  verifyToken,
  generateRecoveryCodes,
};
