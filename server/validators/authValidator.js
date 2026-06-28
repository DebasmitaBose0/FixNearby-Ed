const STRONG_PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]).{8,}$/;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return { valid: false, message: 'Email is required' };
  }
  if (!EMAIL_REGEX.test(email)) {
    return { valid: false, message: 'A valid email address is required' };
  }
  return { valid: true };
}

export function validatePasswordStrength(password) {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Password is required' };
  }
  if (!STRONG_PASSWORD_REGEX.test(password)) {
    return {
      valid: false,
      message: 'Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a digit, and a special character'
    };
  }
  return { valid: true };
}

export function validateName(name) {
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return { valid: false, message: 'Name is required and must be at least 2 characters' };
  }
  return { valid: true };
}

export const validateRegistrationInput = (req, res, next) => {
  const { name, email, password } = req.body;

  const nameCheck = validateName(name);
  if (!nameCheck.valid) {
    return res.status(400).json({ error: nameCheck.message });
  }

  const emailCheck = validateEmail(email);
  if (!emailCheck.valid) {
    return res.status(400).json({ error: emailCheck.message });
  }

  const passwordCheck = validatePasswordStrength(password);
  if (!passwordCheck.valid) {
    return res.status(400).json({ error: passwordCheck.message });
  }

  next();
};

export const validateLoginInput = (req, res, next) => {
  const { email, password } = req.body;

  const emailCheck = validateEmail(email);
  if (!emailCheck.valid) {
    return res.status(400).json({ error: emailCheck.message });
  }

  if (!password || typeof password !== 'string' || password.trim() === '') {
    return res.status(400).json({ error: 'Password is required' });
  }

  next();
};

export const validatePasswordResetInput = (req, res, next) => {
  const { email } = req.body;

  const emailCheck = validateEmail(email);
  if (!emailCheck.valid) {
    return res.status(400).json({ error: emailCheck.message });
  }

  next();
};

export const validateNewPasswordInput = (req, res, next) => {
  const { password } = req.body;

  const passwordCheck = validatePasswordStrength(password);
  if (!passwordCheck.valid) {
    return res.status(400).json({ error: passwordCheck.message });
  }

  next();
};
