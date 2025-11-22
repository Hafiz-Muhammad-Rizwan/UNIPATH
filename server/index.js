import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import chatRoutes from './routes/chat.js';
import postRoutes from './routes/posts.js';
import { authenticateSocket } from './middleware/auth.js';
import { handleSocketConnection } from './socket/socketHandler.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json());

// Database connection with better error handling
let isMongoConnected = false;

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pakuniconnect';
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    isMongoConnected = true;
    console.log('✅ MongoDB connected ');
  } catch (err) {
    isMongoConnected = false;
    console.error('❌ MongoDB connection error:', err.message);
    console.error('\n⚠️  To fix this:');
    console.error('1. Set up MongoDB Atlas (FREE): https://www.mongodb.com/cloud/atlas/register');
    console.error('2. Get connection string and update server/.env');
    console.error('3. Or install MongoDB locally and start the service\n');
  }
};

connectDB();

// Check MongoDB connection status
mongoose.connection.on('disconnected', () => {
  isMongoConnected = false;
  console.log('⚠️  MongoDB disconnected');
});

mongoose.connection.on('connected', () => {
  isMongoConnected = true;
  console.log('✅ MongoDB reconnected');
});

// Health check route (before DB check)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    mongodb: isMongoConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Log all API requests for debugging (before routes)
app.use('/api', (req, res, next) => {
  console.log(`📡 ${req.method} ${req.path}`);
  next();
});

// Middleware to check DB connection (before routes)
app.use((req, res, next) => {
  if (!isMongoConnected && req.path.startsWith('/api') && !req.path.startsWith('/api/health')) {
    return res.status(503).json({ 
      message: 'Database connection failed. Please set up MongoDB Atlas or start local MongoDB.',
      error: 'MongoDB not connected',
      help: 'See START_HERE.md for MongoDB setup instructions'
    });
  }
  next();
});

// Routes (mounted after middleware)
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/posts', postRoutes);

// Socket.io authentication and connection handling
io.use(authenticateSocket);
handleSocketConnection(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  if (!isMongoConnected) {
    console.log('⚠️  Server running but MongoDB not connected. Some features may not work.');
  }
});

export { io };

