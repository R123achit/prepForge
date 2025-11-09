import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/database.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Import routes
import authRoutes from './routes/auth.js';
import aiInterviewRoutes from './routes/aiInterviews.js';
import liveInterviewRoutes from './routes/liveInterviews.js';
import dashboardRoutes from './routes/dashboard.js';
import resumeRoutes from './routes/resumes.js';
import chatbotRoutes from './routes/chatbot.js';
import userRoutes from './routes/users.js';

// Load environment variables
dotenv.config();

// ES Module directory path helper
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app
const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO with CORS - Allow multiple origins
const io = new Server(httpServer, {
  cors: {
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://prepforge-frontend.vercel.app',
      process.env.FRONTEND_URL
    ].filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST']
  },
});

// Connect to MongoDB
connectDB();

// Middleware - Allow multiple origins for development and production
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://prepforge-frontend.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('⚠️ CORS blocked origin:', origin);
      callback(null, true); // Allow anyway for now, can change to false for strict mode
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Request logging middleware (development)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/ai-interviews', aiInterviewRoutes);
app.use('/api/live-interviews', liveInterviewRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/users', userRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'PrepForge API Server',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      aiInterviews: '/api/ai-interviews',
      liveInterviews: '/api/live-interviews',
      dashboard: '/api/dashboard',
      resumes: '/api/resumes',
      chatbot: '/api/chatbot',
      users: '/api/users',
    },
  });
});

// Error handlers (must be last)
app.use(notFound);
app.use(errorHandler);

// Socket.IO connection handling
const rooms = new Map(); // roomId -> Set of socket IDs
const userSockets = new Map(); // userId -> socket ID

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on('join-room', ({ roomId, userId, userName }) => {
    console.log(`${userName} (${userId}) joining room: ${roomId}`);
    
    // Disconnect old socket for this user if exists
    if (userSockets.has(userId)) {
      const oldSocketId = userSockets.get(userId);
      const oldSocket = io.sockets.sockets.get(oldSocketId);
      if (oldSocket && oldSocketId !== socket.id) {
        console.log(`⚠️ Disconnecting old socket ${oldSocketId} for user ${userId}`);
        oldSocket.disconnect(true);
      }
    }
    
    // Track this user's socket
    userSockets.set(userId, socket.id);
    socket.userId = userId;
    socket.userName = userName;
    
    socket.join(roomId);
    
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }
    rooms.get(roomId).add(socket.id);
    
    socket.to(roomId).emit('user-joined', { userId, userName, socketId: socket.id });
    const participants = Array.from(rooms.get(roomId)).filter(id => id !== socket.id);
    socket.emit('room-users', participants);
    
    console.log(`Room ${roomId} now has ${rooms.get(roomId).size} participants`);
  });

  socket.on('offer', ({ roomId, offer, targetSocketId }) => {
    console.log(`Sending offer in room ${roomId} to ${targetSocketId}`);
    socket.to(targetSocketId).emit('offer', { offer, socketId: socket.id });
  });

  socket.on('answer', ({ roomId, answer, targetSocketId }) => {
    console.log(`Sending answer in room ${roomId} to ${targetSocketId}`);
    socket.to(targetSocketId).emit('answer', { answer, socketId: socket.id });
  });

  socket.on('ice-candidate', ({ roomId, candidate, targetSocketId }) => {
    console.log(`Sending ICE candidate in room ${roomId} to ${targetSocketId}`);
    socket.to(targetSocketId).emit('ice-candidate', { candidate, socketId: socket.id });
  });

  socket.on('chat-message', ({ roomId, message, userName, senderId }) => {
    console.log(`Chat message in room ${roomId} from ${userName}`);
    // Broadcast to room with sender ID so clients can filter their own messages
    io.to(roomId).emit('chat-message', { message, userName, timestamp: Date.now(), senderId });
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
    
    // Remove from user tracking
    if (socket.userId && userSockets.get(socket.userId) === socket.id) {
      userSockets.delete(socket.userId);
    }
    
    rooms.forEach((participants, roomId) => {
      if (participants.has(socket.id)) {
        participants.delete(socket.id);
        socket.to(roomId).emit('user-left', { socketId: socket.id });
        console.log(`Room ${roomId} now has ${participants.size} participants`);
        if (participants.size === 0) {
          rooms.delete(roomId);
          console.log(`Room ${roomId} deleted (empty)`);
        }
      }
    });
  });
});

// Start server
const PORT = process.env.PORT || 8000;

const server = httpServer.listen(PORT, () => {
  console.log('');
  console.log('PrepForge Backend Server');
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Server URL: http://localhost:${PORT}`);
  console.log(`API Base: http://localhost:${PORT}/api`);
  console.log(`Health Check: http://localhost:${PORT}/health`);
  console.log(`Socket.IO: Enabled`);
  console.log('');
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  server.close(() => process.exit(1));
});

export default app;
