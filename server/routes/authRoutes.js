import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  forgotUserPassword,
  resetUserPassword,
  forgotWorkerPassword,
  resetWorkerPassword,
  logoutUser
} from '../controllers/authController.js';
import {
  registerWorker,
  loginWorker,
  getWorkerProfile
} from '../controllers/workerController.js';

import {
  protect,
  protectWorker,
} from '../middleware/authMiddleware.js';

import upload from '../middleware/uploadMiddleware.js';

import {
  userLoginLimiter,
  userRegisterLimiter,
  workerLoginLimiter,
  workerRegisterLimiter,
  passwordResetLimiter
} from '../middleware/authRateLimiter.js';
import {
  validateRegistrationInput,
  validateLoginInput,
  validatePasswordResetInput,
  validateNewPasswordInput
} from '../validators/authValidator.js';

const router = express.Router();

{/* USER AUTH ROUTES */}

router.post('/register', userRegisterLimiter, validateRegistrationInput, registerUser);
router.post('/login', userLoginLimiter, validateLoginInput, loginUser);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.post('/logout', protect, logoutUser);

{/* WORKER AUTH ROUTES */}

// WORKER REGISTER
router.post(
  '/worker/register',
  workerRegisterLimiter,
  upload.single('profilePicture'),
  validateRegistrationInput,
  registerWorker
);

// WORKER LOGIN
router.post(
  '/worker/login',
  workerLoginLimiter,
  validateLoginInput,
  loginWorker
);

// WORKER PROFILE
router.get(
  '/worker/profile',
  protectWorker,
  getWorkerProfile
);

router.post(
  '/forgot-password',
  passwordResetLimiter,
  validatePasswordResetInput,
  forgotUserPassword
);

router.put(
  '/reset-password/:token',
  validateNewPasswordInput,
  resetUserPassword
);

router.post(
  '/worker/forgot-password',
  passwordResetLimiter,
  validatePasswordResetInput,
  forgotWorkerPassword
);

router.put(
  '/worker/reset-password/:token',
  validateNewPasswordInput,
  resetWorkerPassword
);

export default router;
