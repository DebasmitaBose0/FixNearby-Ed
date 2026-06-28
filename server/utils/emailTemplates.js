export function passwordResetEmail(name, resetUrl) {
  return {
    subject: 'FixNearby - Reset Your Password',
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 8px; overflow: hidden;">
          <tr>
            <td style="background: #2563eb; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">FixNearby</h1>
              <p style="color: #bfdbfe; margin: 5px 0 0;">Password Reset Request</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <p style="font-size: 16px; color: #333;">Hi ${escapeHtml(name)},</p>
              <p style="font-size: 14px; color: #666; line-height: 1.6;">
                We received a request to reset your password. Click the button below to set a new password. This link expires in <strong>15 minutes</strong>.
              </p>
              <table cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${escapeHtml(resetUrl)}" style="background: #2563eb; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-size: 16px; display: inline-block;">Reset Password</a>
                  </td>
                </tr>
              </table>
              <p style="font-size: 14px; color: #666; line-height: 1.6;">If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              <p style="font-size: 12px; color: #9ca3af; text-align: center;">© 2024 FixNearby. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
  };
}

export function welcomeEmail(name) {
  return {
    subject: 'Welcome to FixNearby!',
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 8px; overflow: hidden;">
          <tr>
            <td style="background: #059669; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Welcome to FixNearby!</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <p style="font-size: 16px; color: #333;">Hi ${escapeHtml(name)},</p>
              <p style="font-size: 14px; color: #666; line-height: 1.6;">
                Thank you for joining FixNearby! We are excited to help you find skilled professionals for all your household service needs.
              </p>
              <p style="font-size: 14px; color: #666; line-height: 1.6;">
                Browse workers in your area, compare ratings, and book services with confidence.
              </p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              <p style="font-size: 12px; color: #9ca3af; text-align: center;">© 2024 FixNearby. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
  };
}

export function bookingConfirmationEmail(userName, workerName, service, scheduledTime, price) {
  const dateStr = new Date(scheduledTime).toLocaleString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return {
    subject: `Booking Confirmed - ${service} with ${workerName}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 8px; overflow: hidden;">
          <tr>
            <td style="background: #2563eb; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Booking Confirmed</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <p style="font-size: 16px; color: #333;">Hi ${escapeHtml(userName)},</p>
              <p style="font-size: 14px; color: #666; line-height: 1.6;">Your booking has been confirmed.</p>
              <table width="100%" cellpadding="10" style="background: #f9fafb; border-radius: 6px; margin: 20px 0;">
                <tr><td style="font-size: 14px; color: #666;"><strong>Worker:</strong> ${escapeHtml(workerName)}</td></tr>
                <tr><td style="font-size: 14px; color: #666;"><strong>Service:</strong> ${escapeHtml(service)}</td></tr>
                <tr><td style="font-size: 14px; color: #666;"><strong>Scheduled:</strong> ${escapeHtml(dateStr)}</td></tr>
                <tr><td style="font-size: 14px; color: #666;"><strong>Price:</strong> $${Number(price).toFixed(2)}</td></tr>
              </table>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              <p style="font-size: 12px; color: #9ca3af; text-align: center;">© 2024 FixNearby. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
  };
}

function escapeHtml(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
