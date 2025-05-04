const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const examController = require('../controllers/pass_exam');

router.get('/', authMiddleware, examController.getAllExams);

module.exports = router;