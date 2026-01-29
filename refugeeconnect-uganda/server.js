const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo').default;
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const path = require('path');
const { Server } = require('socket.io');
const http = require('http');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const aiRoutes = require('./routes/ai');
const informationRoutes = require('./routes/information');
const servicesRoutes = require('./routes/services');
const emergencyRoutes = require('./routes/emergency');
const communityRoutes = require('./routes/community');

// Import middleware
const authMiddleware = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Database connection
mongoose.connect(
  process.env.MONGODB_URI || 'mongodb://localhost:27017/refugeeconnect',
)
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Middleware setup
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "wss:"],
    },
  },
}));

app.use(compression());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100
});
app.use('/api/', limiter);

// Session configuration
// Wait for mongoose connection before setting up session store
const sessionStore = MongoStore.create({
  mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/refugeeconnect',
  touchAfter: 24 * 3600, // lazy session update
});

app.use(session({
  secret: process.env.SESSION_SECRET || 'refugee-connect-secret-key',
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Static files
app.use(express.static('public'));

// View engine setup
const expressLayouts = require('express-ejs-layouts');
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layouts/main'); // Default layout

// Make user available to all views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.currentPath = req.path;
  next();
});

// Routes
app.use('/', require('./routes/index'));
app.use('/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/information', informationRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/community', communityRoutes);

// Socket.IO for real-time features
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // AI Chat
  socket.on('ai-query', async (data) => {
    try {
      const AIService = require('./services/AIService');
      const aiService = new AIService();
      const response = await aiService.processQuery(data.message, data.language || 'en');
      socket.emit('ai-response', response);
    } catch (error) {
      socket.emit('ai-error', { message: 'Failed to process your request' });
    }
  });

  // Community chat
  socket.on('join-community', (communityId) => {
    socket.join(communityId);
  });

  socket.on('community-message', (data) => {
    socket.to(data.communityId).emit('new-message', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Error handling
app.use(errorHandler);

// Start server (auto-retry next port if busy)
let currentPort = Number(process.env.PORT) || 5000;
let portTries = 0;
const maxPortTries = 10;

server.on('error', (err) => {
  if (err && err.code === 'EADDRINUSE' && portTries < maxPortTries) {
    portTries += 1;
    currentPort += 1;
    console.warn(
      `⚠️  Port in use. Retrying on http://localhost:${currentPort} (attempt ${portTries}/${maxPortTries})`,
    );
    setTimeout(() => {
      server.listen(currentPort);
    }, 250);
    return;
  }

  console.error('❌ Server error:', err);
  process.exit(1);
});

server.listen(currentPort, () => {
  console.log(`🚀 Server running on http://localhost:${currentPort}`);
});

module.exports = app;

