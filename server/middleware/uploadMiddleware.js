/**
 * uploadMiddleware.js
 *
 * Configures multer to use in-memory storage so the file buffer is available
 * for the compressUploadedImage middleware in secureUpload.js to process with
 * sharp before writing the compressed WebP to disk.
 *
 * Note: do NOT use diskStorage here — if multer writes the file before sharp
 * runs, we would need to read it back from disk and then write a second copy,
 * doubling I/O and leaving a temporary uncompressed artefact on the server.
 */

import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

export default upload;