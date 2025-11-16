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
app.use(`/api/${env.API_VERSION}/auth`, authRoutes);

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

