import multer from 'multer';
import { Request } from 'express';
import env from '../config/env';

// Configure allowed file types
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = parseInt(env.MAX_FILE_SIZE || '5242880', 10); // 5MB default

// Configure storage (memory storage for S3 upload)
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
): void => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`));
  }
};

// Create multer instance
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

// Single file upload middleware
export const uploadSingle = upload.single('image');

