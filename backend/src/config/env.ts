import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000'),
  API_BASE_URL: z.string().url().default('http://localhost:3000'),
  API_VERSION: z.string().default('v1'),
  
  // Database
  DATABASE_URL: z.string().url(),
  DATABASE_TEST_URL: z.string().url().optional(),
  
  // Redis
  REDIS_URL: z.string().url().optional(),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().default('6379'),
  REDIS_PASSWORD: z.string().optional(),
  
  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_ACCESS_TOKEN_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_TOKEN_EXPIRY: z.string().default('7d'),
  
  // Password Hashing
  BCRYPT_SALT_ROUNDS: z.string().default('12'),
  
  // AWS
  AWS_REGION: z.string().default('us-east-1'),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_S3_BUCKET_NAME: z.string().optional(),
  AWS_CLOUDFRONT_DOMAIN: z.string().optional(),
  
  // Mapbox
  MAPBOX_ACCESS_TOKEN: z.string().optional(),
  
  // Foursquare
  FOURSQUARE_API_KEY: z.string().optional(),
  FOURSQUARE_API_VERSION: z.string().default('20240101'),
  
  // CORS
  CORS_ORIGINS: z.string().default('http://localhost:3000'),
  
  // File Upload
  MAX_FILE_SIZE: z.string().default('5242880'),
  ALLOWED_IMAGE_TYPES: z.string().default('jpg,jpeg,png,webp'),
  MAX_PHOTOS_PER_SPOT: z.string().default('5'),
});

export type Env = z.infer<typeof envSchema>;

let env: Env;

try {
  env = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('❌ Invalid environment variables:');
    error.errors.forEach((err) => {
      console.error(`  - ${err.path.join('.')}: ${err.message}`);
    });
    process.exit(1);
  }
  throw error;
}

export default env;

