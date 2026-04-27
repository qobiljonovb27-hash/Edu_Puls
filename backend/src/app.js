const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();

// Middlewares
app.use(helmet());
app.use(cors({
  origin: '*', // Hozircha hamma joydan ruxsat beramiz (test uchun qulay)
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(morgan('dev'));

// Serve static files
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
app.use('/uploads', express.static(uploadDir));

// Basic Route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to EduPuls API' });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/schools', require('./routes/schoolRoutes'));
app.use('/api/teachers', require('./routes/teacherRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/lessons', require('./routes/lessonRoutes'));
app.use('/api/schedules', require('./routes/scheduleRoutes'));

// Temporary Seed Route for Deployment
app.get('/api/init-db', async (req, res) => {
  try {
    const User = require('./models/User');
    
    // Eski adminni o'chirib, toza yangisini yaratamiz
    await User.deleteOne({ username: 'admin' });
    
    // Parolni oddiy yozamiz, User modeli uni o'zi 'pre-save'da hashlaydi
    await User.create({
      fullName: 'Super Admin',
      username: 'admin',
      password: 'password123',
      role: 'superadmin',
      status: 'active'
    });
    
    res.send('Database FIXED! Login: admin, Pass: password123 (Model tomonidan hashlandi)');
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = app;
