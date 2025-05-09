const Question = require('../models/questionsModel');
const QuestionOption = require('../models/questionsOptionsModel');
const ExamParticipation = require('../models/examParticipationModel');

const examPassingController = {
  startExam: async (req, res) => {
    try {
      const { examId } = req.params;
      const userId = req.userId;
      const { latitude, longitude } = req.body;

      if (!examId || !userId) {
        return res.status(400).json({ error: 'Paramètres manquants' });
      }

      // Vérifier si l'utilisateur a déjà commencé cet examen
      const existingParticipation = await ExamParticipation.getUserParticipation(examId, userId);
      if (existingParticipation && existingParticipation.finished_at) {
        return res.status(400).json({ error: 'Vous avez déjà terminé cet examen' });
      }

      // Démarrer ou reprendre l'examen
      const participationId = await ExamParticipation.startExam(examId, userId, latitude, longitude);

      // Récupérer les questions de l'examen
      const questions = await Question.findByExamId(examId);

      // Pour chaque question, récupérer les options/réponses
      const questionsWithDetails = await Promise.all(
        questions.map(async (question) => {
          let answers;
          
          if (question.question_type === 'direct') {
            answers = await QuestionOption.getDirectAnswer(question.id);
          } else {
            answers = await QuestionOption.getQCMOptions(question.id);
          }
          
          return { 
            ...question,
            answers
          };
        })
      );

      res.json({
        participationId,
        questions: questionsWithDetails,
        existingParticipation: !!existingParticipation
      });

    } catch (error) {
      console.error('Erreur démarrage examen:', error);
      res.status(500).json({ 
        error: 'Erreur serveur',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  submitAnswers: async (req, res) => {
    try {
      const { participationId } = req.params;
      const { answers } = req.body;
      const userId = req.userId;

      if (!participationId || !answers || !Array.isArray(answers)) {
        return res.status(400).json({ error: 'Paramètres invalides' });
      }

      // Vérifier que la participation appartient à l'utilisateur
      const participation = await ExamParticipation.getUserParticipationById(participationId);
      if (!participation || participation.user_id !== userId) {
        return res.status(403).json({ error: 'Non autorisé' });
      }

      if (participation.finished_at) {
        return res.status(400).json({ error: 'Examen déjà terminé' });
      }

      let totalScore = 0;

      // Traiter chaque réponse
      for (const answer of answers) {
        const question = await Question.findById(answer.questionId);
        if (!question) continue;

        let isCorrect = false;
        let score = 0;

        if (question.question_type === 'direct') {
          const correctAnswer = await QuestionOption.getDirectAnswer(question.id);
          isCorrect = answer.answer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
          
          // Appliquer un taux de tolérance si nécessaire
          if (question.tolerance_rate > 0) {
            // Implémentez votre logique de comparaison avec tolérance ici
          }
        } else if (question.question_type === 'qcm') {
          const correctOptions = await QuestionOption.getQCMOptions(question.id)
            .then(options => options.filter(opt => opt.is_correct).map(opt => opt.id.toString()));
          
          isCorrect = arraysEqual(answer.answer.sort(), correctOptions.sort());
        }

        if (isCorrect) {
          score = question.score;
          totalScore += score;
        }

        await ExamParticipation.saveAnswer(
          participationId,
          answer.questionId,
          JSON.stringify(answer.answer),
          isCorrect,
          score
        );
      }

      // Finaliser l'examen
      await ExamParticipation.finishExam(participationId, totalScore);

      res.json({ 
        success: true,
        totalScore
      });

    } catch (error) {
      console.error('Erreur soumission réponses:', error);
      res.status(500).json({ 
        error: 'Erreur serveur',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  getExamResults: async (req, res) => {
    try {
      const { participationId } = req.params;
      const userId = req.userId;

      const participation = await ExamParticipation.getUserParticipationById(participationId);
      if (!participation || participation.user_id !== userId) {
        return res.status(403).json({ error: 'Non autorisé' });
      }

      const [answers] = await pool.query(
        `SELECT * FROM exam_answers 
         WHERE participation_id = ?`,
        [participationId]
      );

      res.json({
        participation,
        answers
      });

    } catch (error) {
      console.error('Erreur récupération résultats:', error);
      res.status(500).json({ 
        error: 'Erreur serveur',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

// Helper function
function arraysEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

module.exports = examPassingController;