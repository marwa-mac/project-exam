const express = require('express');
const router = express.Router();
const examParticipationController = require('../controllers/examParticipationController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/:participationId', authMiddleware, examParticipationController.getExamData);

module.exports = router;