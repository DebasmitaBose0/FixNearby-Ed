import express from 'express';
import { handleUploadAttachment } from '../controllers/attachmentController.js';
import { uploadAttachment } from '../middleware/uploadMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/upload', protect, uploadAttachment.single('attachment'), handleUploadAttachment);

export default router;
