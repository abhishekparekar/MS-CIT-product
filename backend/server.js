const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Connect to MongoDB Atlas / Database
connectDB();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration (allow frontend origin)
app.use(
  cors({
    origin: process.env.CLIENT_URL || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    product: 'ITPL MS-CIT SaaS Platform',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Mount REST API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tenants', require('./routes/tenantRoutes'));
app.use('/api/franchises', require('./routes/tenantRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/exams', require('./routes/examRoutes'));
app.use('/api/certificates', require('./routes/certificateRoutes'));
app.use('/api/marksheets', require('./routes/marksheetRoutes'));
app.use('/api/fees', require('./routes/feeRoutes'));
app.use('/api/affiliations', require('./routes/affiliationRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/gallery', require('./routes/galleryRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

// 404 Route handler for undefined endpoints
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API Route ${req.originalUrl} not found.`
  });
});

// Central Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`
  🚀 ITPL MS-CIT Management SaaS Backend Server Running!
  -------------------------------------------------------
  📡 Port:        ${PORT}
  🌍 Environment: ${process.env.NODE_ENV || 'development'}
  🔗 Health Check: http://localhost:${PORT}/api/health
  -------------------------------------------------------
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Error: ${err.message}`);
});
