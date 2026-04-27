const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const { Server } = require('socket.io');
const User = require('./models/User');

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Seed SuperAdmin
const seedSuperAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: 'superadmin' });
    
    if (!adminExists) {
      await User.create({
        fullName: 'Super Admin',
        username: 'super',
        password: '123',
        role: 'superadmin',
        status: 'active'
      });
      console.log('--- ATLAS: SuperAdmin yaratildi: super / 123 ---');
    } else {
      adminExists.username = 'super';
      adminExists.password = '123';
      await adminExists.save();
      console.log('--- ATLAS: SuperAdmin ma\'lumotlari tasdiqlandi ---');
    }
  } catch (error) {
    console.error('SuperAdmin seeding failed:', error);
  }
};

// Start Server Flow
const startApp = async () => {
  try {
    await connectDB();
    await seedSuperAdmin();

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Startup failed:', error);
  }
};

startApp();

// Socket.io Setup
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  socket.on('disconnect', () => {});
});
