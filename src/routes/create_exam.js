const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const examController = require('../controllers/create_exam')

router.get('/', authMiddleware ,examController.getAllExamsById);

module.exports = router;