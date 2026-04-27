const express = require('express');
const router = express.Router();
const {
  loginUser,
  registerUser,
  getUserProfile,
} = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/login', loginUser);
router.post('/register', registerUser);
router.get('/me', protect, getUserProfile);

module.exports = router;
