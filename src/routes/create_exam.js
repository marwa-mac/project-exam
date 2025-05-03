const express = require('express');
const router = express.Router();
const examController = require('../controllers/create_exam');

router.get('/', examController.getAllExamsById);

module.exports = router;