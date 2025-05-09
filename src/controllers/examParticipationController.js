const pool = require('../BDD/run');
const Question = require('../models/questionsModel');
const QuestionOption = require('../models/questionsOptionsModel');

exports.getExamData = async (req, res) => {
  try {
    const { participationId } = req.params;
    const userId = req.userId;

    // 1. Vérifier la participation
    const [participation] = await pool.query(
      `SELECT ep.*, e.title as exam_title 
       FROM exam_participations ep
       JOIN exams e ON ep.exam_id = e.id
       WHERE ep.id = ? AND ep.user_id = ?`,
      [participationId, userId]
    );

    if (!participation.length) {
      return res.status(404).json({ error: 'Participation non trouvée' });
    }

    // 2. Récupérer les questions
    const questions = await Question.findByExamId(participation[0].exam_id);

    // 3. Ajouter les réponses possibles
    const questionsWithAnswers = await Promise.all(
      questions.map(async (question) => {
        let answers;
        if (question.question_type === 'direct') {
          answers = await QuestionOption.getDirectAnswer(question.id);
        } else {
          answers = await QuestionOption.getQCMOptions(question.id);
        }
        return { ...question, answers };
      })
    );

    res.json({
      participationId,
      examTitle: participation[0].exam_title,
      questions: questionsWithAnswers
    });

  } catch (error) {
    console.error('Error in getExamData:', error);
    res.status(500).json({ 
      error: 'Erreur serveur',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};