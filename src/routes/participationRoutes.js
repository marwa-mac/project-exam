const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/authMiddleware');
const participationController = require('../controllers/participationController');

router.get('/my-exams-participations', authenticate, participationController.getMyExamsParticipations);

module.exports = router;