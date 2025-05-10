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

  // submitAnswers: async (req, res) => {
  //   try {
  //     const { participationId } = req.params;
  //     const { answers } = req.body;
  //     const userId = req.userId;

      

  //     if (!participationId || !answers || !Array.isArray(answers)) {
  //       return res.status(400).json({ error: 'Paramètres invalides' });
  //     }

  //     // Vérifier que la participation appartient à l'utilisateur
  //     const participation = await ExamParticipation.getUserParticipationById(participationId);
  //     if (!participation || participation.user_id !== userId) {
  //       return res.status(403).json({ error: 'Non autorisé' });
  //     }

  //     if (participation.finished_at) {
  //       return res.status(400).json({ error: 'Examen déjà terminé' });
  //     }

  //     let totalScore = 0;

  //     // Traiter chaque réponse
  //     for (const answer of answers) {
  //       const question = await Question.findById(answer.questionId);
  //       if (!question) continue;

  //       let isCorrect = false;
  //       let score = 0;

  //       if (question.question_type === 'direct') {
  // const correctAnswer = await QuestionOption.getDirectAnswer(question.id);
  
  // // Vérification des valeurs
  //         if (!answer.answer || !correctAnswer) {
  //           isCorrect = false;
  //         } else {
  //           isCorrect = answer.answer.toString().trim().toLowerCase() === 
  //                     correctAnswer.toString().trim().toLowerCase();
  //         }
          
  //         // Appliquer un taux de tolérance si nécessaire
  //         if (question.tolerance_rate > 0) {
  //           // Implémentez votre logique de comparaison avec tolérance ici
  //         }
  //       } else if (question.question_type === 'qcm') {
  //         const correctOptions = await QuestionOption.getQCMOptions(question.id)
  //           .then(options => options.filter(opt => opt.is_correct).map(opt => opt.id.toString()));
          
  //         isCorrect = arraysEqual(answer.answer.sort(), correctOptions.sort());
  //       }

  //       if (isCorrect) {
  //         score = question.score;
  //         totalScore += score;
  //       }

        

  //       await ExamParticipation.saveAnswer(
  //         participationId,
  //         answer.questionId,
  //         JSON.stringify(answer.answer),
  //         isCorrect,
  //         score
  //       );
  //     }

  //     // Finaliser l'examen
  //     await ExamParticipation.finishExam(participationId, totalScore);

  //     res.json({ 
  //       success: true,
  //       totalScore
  //     });

  //   } catch (error) {
  //     console.error('Erreur soumission réponses:', error);
  //     res.status(500).json({ 
  //       error: 'Erreur serveur',
  //       details: process.env.NODE_ENV === 'development' ? error.message : undefined
  //     });
  //   }
  // },

  submitAnswers: async (req, res) => {
    try {
        const { participationId } = req.params;
        const { answers } = req.body;
        const userId = req.userId;

        // Validation des entrées
        if (!participationId || !answers || !Array.isArray(answers)) {
            return res.status(400).json({ error: 'Paramètres manquants ou invalides' });
        }

        // Vérification de la participation
        const participation = await ExamParticipation.getUserParticipationById(participationId);
        if (!participation || participation.user_id !== userId) {
            return res.status(403).json({ error: 'Participation non trouvée ou non autorisée' });
        }
        if (participation.finished_at) {
            return res.status(400).json({ error: 'Cet examen a déjà été terminé' });
        }

        let totalScore = 0;
        const errors = [];

        // Traitement séquentiel pour mieux gérer les erreurs
        for (const answerData of answers) {
            try {
                const question = await Question.findById(answerData.questionId);
                if (!question) {
                    errors.push(`Question ${answerData.questionId} non trouvée`);
                    continue;
                }

                // Initialisation
                let userAnswer = answerData.answer;
                let isCorrect = false;
                let score = 0;

                // Traitement selon le type de question
                if (question.question_type === 'direct') {
                    // Réponse directe - enregistrer la valeur telle quelle
                    const correctAnswer = await QuestionOption.getDirectAnswer(question.id);
                    
                    if (userAnswer && correctAnswer) {
                        isCorrect = userAnswer.toString().trim().toLowerCase() === 
                                    correctAnswer.toString().trim().toLowerCase();
                    }

                } else if (question.question_type === 'qcm') {
                    // Pour QCM - s'assurer que c'est un tableau
                    if (!Array.isArray(userAnswer)) {
                        userAnswer = [userAnswer];
                    }

                    // Récupérer les bonnes réponses
                    const correctOptions = await QuestionOption.getQCMOptions(question.id);
                    const correctOptionIds = correctOptions
                        .filter(opt => opt.is_correct)
                        .map(opt => opt.id.toString());

                    // Comparaison des réponses
                    isCorrect = JSON.stringify(userAnswer.sort()) === JSON.stringify(correctOptionIds.sort());
                }

                // Calcul du score
                if (isCorrect) {
                    score = question.score || 0;
                    totalScore += score;
                }

                // Enregistrement dans la BDD
                await pool.query(
                    `INSERT INTO exam_answers 
                     (participation_id, question_id, answer, is_correct, score) 
                     VALUES (?, ?, ?, ?, ?)`,
                    [
                        participationId,
                        question.id, // ID de la question
                        Array.isArray(userAnswer) ? JSON.stringify(userAnswer) : userAnswer, // Réponse
                        isCorrect,
                        score
                    ]
                );

            } catch (error) {
                console.error(`Erreur traitement réponse Q${answerData.questionId}:`, error);
                errors.push(`Erreur sur la question ${answerData.questionId}`);
            }
        }

        // Mise à jour finale
        await pool.query(
            `UPDATE exam_participations 
             SET finished_at = NOW(), total_score = ? 
             WHERE id = ?`,
            [totalScore, participationId]
        );

        // Réponse finale
        if (errors.length > 0) {
            return res.status(207).json({ // 207 Multi-Status
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