import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { s3Client, S3_BUCKET_NAME, CLOUDFRONT_DOMAIN } from '../config/s3';
import env from '../config/env';

export interface UploadResult {
  url: string;
  key: string;
}

/**
 * Upload image to S3
 * @param file - Multer file object
 * @param folder - Folder path in S3 (e.g., 'avatars', 'spots')
 * @returns Upload result with URL and S3 key
 */
export const uploadImage = async (
  file: Express.Multer.File,
  folder: string = 'uploads'
): Promise<UploadResult> => {
  if (!file) {
    throw new Error('No file provided');
  }

  // Generate unique filename
  const fileExtension = file.originalname.split('.').pop() || 'jpg';
  const fileName = `${folder}/${uuidv4()}.${fileExtension}`;

  // Upload to S3
  const command = new PutObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read', // Make file publicly accessible
  });

  await s3Client.send(command);

  // Generate URL
  let url: string;
  if (CLOUDFRONT_DOMAIN) {
    // Use CloudFront URL if available
    url = `https://${CLOUDFRONT_DOMAIN}/${fileName}`;
  } else {
    // Fallback to S3 URL
    url = `https://${S3_BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com/${fileName}`;
  }

  return {
    url,
    key: fileName,
  };
};

/**
 * Delete image from S3
 * @param key - S3 object key
 */
export const deleteImage = async (key: string): Promise<void> => {
  const command = new DeleteObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: key,
  });

  await s3Client.send(command);
};

/**
 * Extract S3 key from URL
 * @param url - Full S3 or CloudFront URL
 * @returns S3 key
 */
export const extractS3Key = (url: string): string | null => {
  if (CLOUDFRONT_DOMAIN && url.includes(CLOUDFRONT_DOMAIN)) {
    // Extract from CloudFront URL
    const parts = url.split(`${CLOUDFRONT_DOMAIN}/`);
    return parts[1] || null;
  }
  
  // Extract from S3 URL
  const s3Pattern = new RegExp(`${S3_BUCKET_NAME}\\.s3[^/]*/(.+)$`);
  const match = url.match(s3Pattern);
  return match ? match[1] : null;
};

