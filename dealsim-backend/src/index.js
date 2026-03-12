import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import personaRoutes from './routes/personaRoutes.js';
import contextRoutes from './routes/contextRoutes.js';
import rubricRoutes from './routes/rubricRoutes.js';
import { errorHandler } from './middleware/errorMiddleware.js';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
// Connect to Database
connectDB();
// Middleware
app.use(cors());
app.use(express.json());
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/personas', personaRoutes);
app.use('/api/contexts', contextRoutes);
app.use('/api/rubrics', rubricRoutes);
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});
app.use(errorHandler);
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
//# sourceMappingURL=index.js.map