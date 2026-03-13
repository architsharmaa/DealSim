import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import aiRoutes from './routes/aiRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Global Request Logger
app.use((req, res, next) => {
  console.log(`[AI Microservice] Incoming Request: ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/ai', aiRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'dealsim-ai-service' });
});

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[AI Microservice Error]:', err);
  res.status(500).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

app.listen(PORT, () => {
  console.log(`AI Microservice running on port ${PORT}`);
});
