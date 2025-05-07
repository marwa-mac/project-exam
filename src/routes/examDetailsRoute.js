const express = require('express');
const router = express.Router();
const examDetailsController = require('../controllers/examDetailsController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/:exam_id', authMiddleware, examDetailsController.getExamWithQuestions);

module.exports = router;