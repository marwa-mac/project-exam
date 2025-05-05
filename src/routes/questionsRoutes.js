const express = require('express');
const router = express.Router();
const questionsController = require('../controllers/questionsController');
const authMiddleware = require('../middlewares/authMiddleware');

// Protéger toutes les routes avec l'authentification
router.use(authMiddleware);

// Créer une nouvelle question
router.post('/', questionsController.createQuestion);

// Récupérer les questions d'un examen
router.get('/exam/:exam_id', questionsController.getQuestionsByExamId);

// Supprimer une question
router.delete('/:id', questionsController.deleteQuestion);

module.exports = router;