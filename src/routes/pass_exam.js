const express = require('express');
const router = express.Router();
const examController = require('../controllers/pass_exam');

router.get('/', examController.getAllExams);

module.exports = router;