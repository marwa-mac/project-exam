const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const examController = require('../controllers/create_exam');

router.get('/', authMiddleware, examController.getAllExams);
router.post('/', authMiddleware, examController.createExam);
router.get('/:exam_id', authMiddleware, examController.getExamDetails);

module.exports = router;