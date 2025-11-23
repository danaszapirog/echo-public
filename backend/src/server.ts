import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import env from './config/env';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

const app: Express = express();

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: env.CORS_ORIGINS.split(',').map((origin) => origin.trim()),
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Request logging
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import placeRoutes from './routes/placeRoutes';
import spotRoutes from './routes/spotRoutes';
import wantToGoRoutes from './routes/wantToGoRoutes';
import mapRoutes from './routes/mapRoutes';
import playlistRoutes from './routes/playlistRoutes';
import followRoutes from './routes/followRoutes';
import feedRoutes from './routes/feedRoutes';
import onboardingRoutes from './routes/onboardingRoutes';
import adminRoutes from './routes/adminRoutes';
app.use(`/api/${env.API_VERSION}/auth`, authRoutes);
app.use(`/api/${env.API_VERSION}/users`, userRoutes);
app.use(`/api/${env.API_VERSION}/places`, placeRoutes);
app.use(`/api/${env.API_VERSION}/spots`, spotRoutes);
app.use(`/api/${env.API_VERSION}/want-to-go`, wantToGoRoutes);
app.use(`/api/${env.API_VERSION}/map`, mapRoutes);
app.use(`/api/${env.API_VERSION}/playlists`, playlistRoutes);
app.use(`/api/${env.API_VERSION}/follows`, followRoutes);
app.use(`/api/${env.API_VERSION}/feed`, feedRoutes);
app.use(`/api/${env.API_VERSION}/onboarding`, onboardingRoutes);
app.use(`/api/${env.API_VERSION}/admin`, adminRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

const PORT = parseInt(env.PORT, 10);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${env.NODE_ENV}`);
  console.log(`🌐 API Base URL: ${env.API_BASE_URL}`);
});

export default app;

