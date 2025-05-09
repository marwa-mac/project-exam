const express = require('express');
const router = express.Router();
const examPassingController = require('../controllers/examPassingController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.post('/start/:examId', examPassingController.startExam);
router.post('/submit/:participationId', examPassingController.submitAnswers);
router.get('/results/:participationId', examPassingController.getExamResults);

module.exports = router;