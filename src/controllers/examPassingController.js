const Question = require('../models/questionsModel');
const QuestionOption = require('../models/questionsOptionsModel');
const ExamParticipation = require('../models/examParticipationModel');
const pool = require('../BDD/run');

const examPassingController = {
  startExam: async (req, res) => {
    try {
      const { examId } = req.params;
      const userId = req.userId;
      const { latitude, longitude } = req.body;

      if (!examId || !userId) {
        return res.status(400).json({ error: 'Paramètres manquants' });
      }

      
      const existingParticipation = await ExamParticipation.getUserParticipation(examId, userId);
      if (existingParticipation && existingParticipation.finished_at) {
        return res.status(400).json({ error: 'Vous avez déjà terminé cet examen' });
      }

      
      const participationId = await ExamParticipation.startExam(examId, userId, latitude, longitude);

      
      const questions = await Question.findByExamId(examId);

      
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
            return res.status(400).json({ error: 'Paramètres manquants ou invalides' });
        }

        
        const participation = await ExamParticipation.getUserParticipationById(participationId);
        if (!participation || participation.user_id !== userId) {
            return res.status(403).json({ error: 'Participation non trouvée ou non autorisée' });
        }
        if (participation.finished_at) {
            return res.status(400).json({ error: 'Cet examen a déjà été terminé' });
        }

        let totalScore = 0;
        const errors = [];

        
        for (const answerData of answers) {
            try {
                const question = await Question.findById(answerData.questionId);
                if (!question) {
                    errors.push(`Question ${answerData.questionId} non trouvée`);
                    continue;
                }

                
                let userAnswer = answerData.answer;
                let isCorrect = false;
                let score = 0;

               
                if (question.question_type === 'direct') {
                   const correctAnswer = await QuestionOption.getDirectAnswer(question.id);
                    if (userAnswer && correctAnswer) {
                        isCorrect = userAnswer.toString().trim().toLowerCase() === 
                                    correctAnswer.toString().trim().toLowerCase();
                    }

                } else if (question.question_type === 'qcm') {
                    if (!Array.isArray(userAnswer)) {
                        userAnswer = [userAnswer];
                    }
                  
                    const correctOptions = await QuestionOption.getQCMOptions(question.id);
                    const correctOptionIds = correctOptions
                        .filter(opt => opt.is_correct)
                        .map(opt => opt.id.toString());

                    isCorrect = JSON.stringify(userAnswer.sort()) === JSON.stringify(correctOptionIds.sort());
                }

                if (isCorrect) {
                    score = question.score || 0;
                    totalScore += score;
                }

                await pool.query(
                    `INSERT INTO exam_answers 
                     (participation_id, question_id, answer, is_correct, score) 
                     VALUES (?, ?, ?, ?, ?)`,
                    [
                        participationId,
                        question.id, 
                        Array.isArray(userAnswer) ? JSON.stringify(userAnswer) : userAnswer, 
                        isCorrect,
                        score
                    ]
                );

            } catch (error) {
                console.error(`Erreur traitement réponse Q${answerData.questionId}:`, error);
                errors.push(`Erreur sur la question ${answerData.questionId}`);
            }
        }

        await pool.query(
            `UPDATE exam_participations 
             SET finished_at = NOW(), total_score = ? 
             WHERE id = ?`,
            [totalScore, participationId]
        );


        if (errors.length > 0) {
            return res.status(207).json({ 
                success: true,
                totalScore,
                message: 'Certaines réponses n\'ont pas pu être enregistrées',
                errors,
                savedAnswers: answers.length - errors.length
            });
        }

        res.json({
            success: true,
            totalScore,
            message: 'Toutes les réponses ont été enregistrées avec succès'
        });

    } catch (error) {
        console.error('Erreur soumission des réponses:', error);
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