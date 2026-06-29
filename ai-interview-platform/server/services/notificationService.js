const emailService = require('../utils/emailService');
class NotificationService {
  static async sendOTP(email, otp) {
    return await emailService.sendOTP(email, otp);
  }
  static async sendInterviewConfirmation(email, date) {
    return await emailService.sendMail({
      to: email,
      subject: 'Interview Scheduled',
      html: `<p>Your interview is scheduled for ${date}</p>`
    });
  }
}
module.exports = NotificationService;
