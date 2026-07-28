require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const mongoose = require('mongoose');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const seedAll = require('./utils/seedData');
const User = require('./models/User');

const app = express();

// Security Middlewares
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { success: false, message: 'Too many requests from this IP, please try again later.' }
});
app.use('/api', limiter);

// Mount API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/subjects', require('./routes/subjects'));
app.use('/api/classes', require('./routes/classes'));
app.use('/api/questions', require('./routes/questions'));
app.use('/api/exams', require('./routes/exams'));
app.use('/api/results', require('./routes/results'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/announcements', require('./routes/announcements'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    school: 'DAMALE SCHOOL KATSINA',
    system: 'Online Examination System (CBT)',
    status: 'Operational',
    timestamp: new Date()
  });
});

// Serve uploads if any
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  const dbConnected = await connectDB();

  // Auto-seed only if DB connected and has no users yet
  if (dbConnected && mongoose.connection.readyState === 1) {
    try {
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        console.log('🌱 Database empty. Running initial auto-seeding...');
        await seedAll();
      } else {
        console.log(`👥 ${userCount} users found in database. Skipping seed.`);
      }
    } catch (e) {
      console.warn('⚠️ Could not check user count:', e.message);
    }
  } else {
    console.warn('⚠️ Server starting WITHOUT database. Login will not work until MongoDB is connected.');
  }

  app.listen(PORT, () => {
    console.log(`\n=================================================`);
    console.log(`🚀 DAMALE SCHOOL KATSINA CBT Server Running!`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`🗄️  DB: ${dbConnected ? 'Connected ✅' : 'NOT Connected ❌'}`);
    console.log(`Mode: ${process.env.NODE_ENV || 'development'}`);
    console.log(`=================================================\n`);
  });
};

startServer();
