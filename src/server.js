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

// Define allowed origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174'
];

// Initialize Socket.IO with CORS configuration
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Initialize Notification Service
const notificationService = new NotificationService(io);

//middleware
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

// Add headers middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

//routes
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/ai', aiRoutes);

// error handler
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Something went wrong";
  return res.status(status).json({
    success: false,
    status,
    message,
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
    });

    // Socket.IO connection handling
    io.on('connection', (socket) => {
      socket.emit('connection_success', { message: 'Connected to notification service' });

      socket.on('disconnect', () => {
        // Connection cleanup handled by Socket.IO
      });
    });

  } catch (error) {
    console.log(`Error: ${error.message}`.bgRed.white);
    process.exit(1);  // Exit process with failure
  }
};

startServer();
