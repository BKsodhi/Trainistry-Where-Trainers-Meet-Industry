import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { connectDatabase } from './config/database.js';
import authRoutes from './src/modules/identity/routes/authRoutes.js';
import profileRoutes from './src/modules/profiles/routes/profileRoutes.js';
import projectRoutes from './src/modules/marketplace/routes/projectRoutes.js';
import workflowRoutes from './src/modules/workflow/routes/workflowRoutes.js';
import billingRoutes from './src/modules/billing/routes/billingRoutes.js';
import feedRoutes from './src/modules/social/routes/feedRoutes.js';
import adminRoutes from './src/modules/admin/routes/adminRoutes.js';
import http from 'http';
import { Server } from 'socket.io';
import { initializeWebSocketComponent } from './src/modules/workflow/websockets/chatHandler.js';

dotenv.config();

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
  }
});
initializeWebSocketComponent(io);

const PORT = process.env.PORT || 5000;

// Connect to Data Layer Infrastructure Node
connectDatabase().catch((err) => {
  console.error('[BOOTSTRAP_CRASH] Failed to secure persistent data layer:', err);
  process.exit(1);
});

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, error: { code: 'TOO_MANY_REQUESTS', message: 'Rate limit exceeded.' } }
});
app.use('/api/', globalRateLimiter);

// Define Core System Domain Routing Injections
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/profiles', profileRoutes); // Inject Module 2 Pipeline
app.use('/api/v1/marketplace', projectRoutes); // Mount Sourcing Board Endpoints
app.use('/api/v1/workflow', workflowRoutes);
app.use('/api/v1/billing', billingRoutes); // Mount Billing Module
app.use('/api/v1/feed', feedRoutes); // Mount Social Feed Module
app.use('/api/v1/admin', adminRoutes); // Mount Admin Module


// Health Validation Check Hook
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Trainistry Core Monolith Online.' });
});

app.use((err, req, res, next) => {
  console.error('System Exception Intercepted:', err.stack);
  res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected execution error occurred on the server.' }
  });
});

httpServer.listen(PORT, () => {
  console.log(`[TRAINISTRY] Server cluster running smoothly on port ${PORT}`);
});
