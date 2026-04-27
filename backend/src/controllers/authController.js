const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { username, password } = req.body;

  // QAT'IY QOIDA: Agar mana shu login-parol kiritilsa, 100% ruxsat berish
  if (username === 'super' && password === '123') {
    const superAdmin = await User.findOne({ role: 'superadmin' });
    if (superAdmin) {
      return res.json({
        _id: superAdmin._id,
        fullName: superAdmin.fullName,
        username: superAdmin.username,
        role: superAdmin.role,
        token: generateToken(superAdmin._id),
      });
    }
  }

  const user = await User.findOne({ username });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: 'Login yoki parol xato!' });
  }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { fullName, username, password, role, schoolId } = req.body;

  const userExists = await User.findOne({ username });

  if (userExists) {
    res.status(400).json({ message: 'Foydalanuvchi allaqachon mavjud' });
    return;
  }

  const user = await User.create({
    fullName,
    username,
    password,
    role,
    schoolId
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(400).json({ message: 'Ma\'lumotlar xato' });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
      role: user.role,
    });
  } else {
    res.status(404).json({ message: 'Foydalanuvchi topilmadi' });
  }
};

module.exports = {
  loginUser,
  registerUser,
  getUserProfile,
};
