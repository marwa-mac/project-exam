const Question = require('../models/questionsModel');
const QuestionOption = require('../models/questionsOptionsModel');

const questionsController = {
  // Créer une nouvelle question avec ses réponses
  createQuestion: async (req, res) => {
    try {
      const { exam_id, question_type, content, media_url, media_type, tolerance_rate, duration, score, options } = req.body;

      // Validation des données
      if (!exam_id || !question_type || !content || !duration || !score) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Création de la question
      const questionId = await Question.create({
        exam_id,
        question_type,
        content,
        media_url,
        media_type,
        tolerance_rate: question_type === 'direct' ? tolerance_rate : 0,
        duration,
        score
      });

      // Gestion des réponses selon le type de question
      if (question_type === 'direct') {
        // Pour une question directe, on attend une seule réponse
        if (!options || options.length !== 1) {
          // On supprime la question si la réponse est invalide
          await Question.delete(questionId);
          return res.status(400).json({ error: 'Direct questions require exactly one answer' });
        }

        await QuestionOption.create(questionId, options[0].answer_text);
      } else if (question_type === 'qcm') {
        // Pour un QCM, on attend plusieurs options
        if (!options || options.length < 2) {
          await Question.delete(questionId);
          return res.status(400).json({ error: 'QCM questions require at least two options' });
        }

        for (const option of options) {
          await QuestionOption.create(questionId, option.answer_text);
        }
      }

      res.status(201).json({ message: 'Question created successfully', questionId });
    } catch (error) {
      console.error('Error creating question:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Récupérer toutes les questions d'un examen
  getQuestionsByExamId: async (req, res) => {
    try {
      const { exam_id } = req.params;

      const questions = await Question.findByExamId(exam_id);

      // Pour chaque question, récupérer les options/réponses
      const questionsWithOptions = await Promise.all(
        questions.map(async (question) => {
          const options = await QuestionOption.findByQuestionId(question.id);
          return { ...question, options };
        })
      );

      res.json(questionsWithOptions);
    } catch (error) {
      console.error('Error fetching questions:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Supprimer une question
  deleteQuestion: async (req, res) => {
    try {
      const { id } = req.params;

      // Vérifier que la question existe
      const question = await Question.findById(id);
      if (!question) {
        return res.status(404).json({ error: 'Question not found' });
      }

      // Supprimer d'abord les options puis la question
      await QuestionOption.deleteByQuestionId(id);
      await Question.delete(id);

      res.json({ message: 'Question deleted successfully' });
    } catch (error) {
      console.error('Error deleting question:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = questionsController;