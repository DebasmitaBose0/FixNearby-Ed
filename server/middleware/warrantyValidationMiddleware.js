/**
 * Middleware for validating service warranty claims
 */
import { verifyWarrantyCoverage, sanitizeWarrantyClaimPayload } from '../services/serviceWarrantyCoverageService.js';

export const warrantyValidationMiddleware = (req, res, next) => {
  const { completionDate, notes } = req.body || {};

  if (req.method === 'POST') {
    if (completionDate !== undefined) {
      const check = verifyWarrantyCoverage(completionDate);
      if (!check.valid) {
        return res.status(400).json({ success: false, message: check.reason });
      }
    }
    if (notes) {
      req.sanitizedWarrantyNotes = sanitizeWarrantyClaimPayload(notes);
    }
  }

  next();
};
