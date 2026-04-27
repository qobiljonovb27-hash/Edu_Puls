const express = require('express');
const router = express.Router();
const { startLesson, endLesson, getActiveLessons, uploadProof, getLessonHistory, getDailyGrid } = require('../controllers/lessonController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const multer = require('multer');
const path = require('path');

// Configure Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

router.post('/start', protect, authorize('teacher'), startLesson);
router.put('/:id/end', protect, authorize('teacher'), endLesson);
router.get('/active', protect, authorize('admin', 'teacher'), getActiveLessons);
router.get('/history', protect, authorize('teacher'), getLessonHistory);
router.get('/daily-grid', protect, authorize('admin'), getDailyGrid);
router.post('/:id/proof', protect, authorize('teacher'), upload.single('file'), uploadProof);

module.exports = router;
