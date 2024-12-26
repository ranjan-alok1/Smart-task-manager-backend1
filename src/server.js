const express = require("express");
const cors = require("cors");
const colors = require("colors");
const dotenv = require("dotenv");
const { createServer } = require('http');
const { Server } = require('socket.io');
const connectDb = require("./config/connectDb");
const taskRoutes = require("./routes/tasks");
const aiRoutes = require("./routes/ai");
const NotificationService = require("./services/notificationService");

//config dot env file
dotenv.config();

//rest object
const app = express();
const httpServer = createServer(app);

// CORS Configuration
const corsOptions = {
  origin: [
    'https://smart-task-manager-frontend.vercel.app',
    'http://localhost:5173', // Keep local development working
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Initialize Socket.IO with CORS configuration
const io = new Server(httpServer, {
  cors: {
    origin: corsOptions.origin,
    methods: corsOptions.methods,
    allowedHeaders: corsOptions.allowedHeaders,
    credentials: corsOptions.credentials
  },
  transports: ['websocket', 'polling']
});

// Initialize Notification Service
const notificationService = new NotificationService(io);

//middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Server is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'API is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

//routes
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/ai', aiRoutes);

// error handler
app.use((err, req, res, next) => {
  console.error('Error occurred:'.red, {
    path: req.path,
    method: req.method,
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });

  const status = err.status || 500;
  const message = err.message || "Something went wrong";
  return res.status(status).json({
    success: false,
    status,
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

//ports
const PORT = process.env.PORT || 8080;

//listen
const startServer = async () => {
  try {
    // Connect to database first
    await connectDb();
    
    // Then start the server
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`.bgGreen.white);
      if (process.env.NODE_ENV === 'development') {
        console.log('Environment:'.cyan, process.env.NODE_ENV);
        console.log('MongoDB URL:'.cyan, process.env.MONGO_URL?.substring(0, 20) + '...');
        console.log('Allowed Origins:'.cyan, corsOptions.origin);
      }
    });

    // Socket.IO connection handling
    io.on('connection', (socket) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('New socket connection:'.green, socket.id);
      }
      socket.emit('connection_success', { message: 'Connected to notification service' });

      socket.on('disconnect', () => {
        if (process.env.NODE_ENV === 'development') {
          console.log('Socket disconnected:'.yellow, socket.id);
        }
      });

      socket.on('error', (error) => {
        console.error('Socket error:'.red, error);
      });
    });

  } catch (error) {
    console.log(`Error: ${error.message}`.bgRed.white);
    console.error('Stack trace:'.red, error.stack);
    process.exit(1);  // Exit process with failure
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:'.red, error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:'.red, error);
  process.exit(1);
});

startServer();
