const express = require('express');
const router = express.Router();
const questionsController = require('../controllers/questionsController');
const authMiddleware = require('../middlewares/authMiddleware');


router.use(authMiddleware);

router.post('/', questionsController.createQuestion);

router.get('/exam/:exam_id', questionsController.getQuestionsByExamId);

router.delete('/:id', questionsController.deleteQuestion);
router.put('/:id', questionsController.updateQuestion);

module.exports = router;