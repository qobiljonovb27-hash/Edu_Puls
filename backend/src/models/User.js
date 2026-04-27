const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Iltimos, to\'liq ismni kiriting'],
    },
    username: {
      type: String,
      required: [true, 'Iltimos, foydalanuvchi nomini kiriting'],
      unique: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Iltimos, parolni kiriting'],
    },
    role: {
      type: String,
      enum: ['superadmin', 'admin', 'teacher'],
      default: 'teacher',
    },
    phone: {
      type: String,
    },
    avatar: {
      type: String,
      default: '',
    },
    subject: {
      type: String,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending'],
      default: 'active',
    },
    schoolId: {
       type: mongoose.Schema.Types.ObjectId,
       ref: 'School',
       required: function() { return this.role !== 'superadmin'; }
    }
  },
  {
    timestamps: true,
  }
);

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
