/**
 * secureUpload.js
 *
 * Validates and compresses incoming profile picture uploads.
 *
 * Two-stage pipeline:
 *   1. validateUploadedFile — fast synchronous checks (format, size) that
 *      reject obviously bad files before hitting the file system.
 *   2. compressUploadedImage — reads the in-memory buffer from multer's
 *      memoryStorage, converts it to a ≤1200px wide WebP at 75 % quality
 *      using `sharp`, and writes the result to disk.  Falls back gracefully
 *      if sharp is unavailable (e.g. in CI without native binaries).
 *
 * Why WebP?  A typical JPEG profile picture at full camera resolution is
 * 3–8 MB.  The same image in WebP at 1200 px / 75 % quality is usually
 * under 120 KB — a 25–65× reduction that dramatically speeds up profile
 * page loads without any visible quality loss at display sizes.
 *
 * How to wire this up in the route:
 *   import upload from './uploadMiddleware.js';
 *   import { validateUploadedFile, compressUploadedImage } from './secureUpload.js';
 *
 *   router.post(
 *     '/worker/register',
 *     upload.single('profilePicture'),
 *     validateUploadedFile,
 *     compressUploadedImage,
 *     registerWorker
 *   );
 */

import path from 'path';
import fs from 'fs/promises';

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

/** Stage 1: lightweight format + size validation. */
export const validateUploadedFile = (req, res, next) => {
  if (!req.file) return next();

  const ext = path.extname(req.file.originalname).toLowerCase();

  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid file format. Allowed: JPG, JPEG, PNG, WEBP, GIF.',
    });
  }

  const sizeBytes = req.file.buffer ? req.file.buffer.length : req.file.size;
  if (sizeBytes > MAX_BYTES) {
    return res.status(400).json({
      success: false,
      message: 'File size exceeds the 5 MB maximum.',
    });
  }

  next();
};

/**
 * Stage 2: compress to WebP using sharp and persist to disk.
 *
 * Requires multer to be configured with memoryStorage (see uploadMiddleware.js)
 * so that req.file.buffer is available.  If the buffer is absent (disk-storage
 * mode or no file), this middleware is a no-op.
 */
export const compressUploadedImage = async (req, res, next) => {
  if (!req.file || !req.file.buffer) return next();

  try {
    // Dynamic import keeps the module loadable in environments where the
    // sharp native addon is not compiled (e.g. minimal CI containers).
    const { default: sharp } = await import('sharp');

    const uploadsDir = 'uploads';
    await fs.mkdir(uploadsDir, { recursive: true });

    const filename = `${Date.now()}-${path.basename(
      req.file.originalname,
      path.extname(req.file.originalname)
    )}.webp`;

    const outputPath = path.join(uploadsDir, filename);

    await sharp(req.file.buffer)
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality: 75 })
      .toFile(outputPath);

    // Replace the in-memory multer file object with the persisted file info
    // so downstream controllers can reference req.file.path as usual.
    req.file.filename = filename;
    req.file.path = outputPath;
    req.file.mimetype = 'image/webp';
    req.file.size = (await fs.stat(outputPath)).size;
    delete req.file.buffer;

    next();
  } catch (err) {
    if (err.code === 'ERR_MODULE_NOT_FOUND' || err.message?.includes('sharp')) {
      // sharp not available — fall through without compression.
      console.warn('[secureUpload] sharp not available; skipping compression.');
      return next();
    }
    console.error('[secureUpload] Image compression failed:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to process uploaded image.',
    });
  }
};