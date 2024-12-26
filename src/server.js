import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server } from 'socket.io';

import taskRoutes from './routes/tasks.js';
import aiRoutes from './routes/ai.js';
import notificationRoutes from './routes/notifications.js'; 
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL,
        methods: ['GET', 'POST']
    }
});

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));
app.use(express.json());

// Socket.io connection
io.on('connection', (socket) => {
    console.log('Client connected');

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Routes
app.use('/api/tasks', taskRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationRoutes);

// Error handling
app.use(errorHandler);

// Database connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('MongoDB connection error:', error));

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export { io };