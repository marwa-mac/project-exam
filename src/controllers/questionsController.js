const Question = require('../models/questionsModel');
const QuestionOption = require('../models/questionsOptionsModel');

const questionsController = {
  createQuestion: async (req, res) => {
    try {
      const { exam_id, question_type, content, answer_text, media_url, media_type, tolerance_rate, duration, score, options } = req.body;

      if (!exam_id || !question_type || !content || !duration || !score) {
        return res.status(400).json({ error: 'Champs requis manquants' });
      }

      const questionId = await Question.create({
        exam_id,
        question_type,
        content,
        media_url,
        media_type,
        tolerance_rate: question_type === 'direct' ? tolerance_rate || 0 : null,
        duration,
        score
      });

      if (question_type === 'direct') {
        if (!answer_text) {
          await Question.delete(questionId);
          return res.status(400).json({ 
            error: 'Les questions directes nécessitent une réponse (answer_text)' 
          });
        }
        await QuestionOption.create(questionId, answer_text);
      } 
      else if (question_type === 'qcm') {
        if (!options || options.length < 2) {
          await Question.delete(questionId);
          return res.status(400).json({ 
            error: 'Les QCM doivent avoir au moins deux options' 
          });
        }

        const hasCorrectAnswer = options.some(opt => opt.is_correct);
        if (!hasCorrectAnswer) {
          await Question.delete(questionId);
          return res.status(400).json({ 
            error: 'Les QCM doivent avoir au moins une réponse correcte' 
          });
        }

        for (const option of options) {
          await QuestionOption.createOptions(
            questionId, 
            option.option_text, 
            option.is_correct
          );
        }
      }

      res.status(201).json({ 
        message: 'Question créée avec succès', 
        questionId 
      });
    } catch (error) {
      console.error('Erreur lors de la création de la question:', error);
      
      if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({ 
          error: 'L\'examen spécifié n\'existe pas' 
        });
      }
      
      res.status(500).json({ 
        error: 'Erreur serveur',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  getQuestionsByExamId: async (req, res) => {
    try {
      const { exam_id } = req.params;
      const questions = await Question.findByExamId(exam_id);

      const questionsWithOptions = await Promise.all(
        questions.map(async (question) => {
          let responseOptions;
          
          if (question.question_type === 'direct') {
            responseOptions = await QuestionOption.findDirectAnswer(question.id);
          } else {
            responseOptions = await QuestionOption.findQcmOptions(question.id);
          }
          
          return { 
            ...question, 
            options: responseOptions 
          };
        })
      );

      res.json(questionsWithOptions);
    } catch (error) {
      console.error('Erreur lors de la récupération des questions:', error);
      res.status(500).json({ 
        error: 'Erreur serveur',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },


updateQuestion: async (req, res) => {
  try {
    const { id } = req.params;
    const { content, media_url, media_type, tolerance_rate, duration, score, answer_text, options } = req.body;


    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({ error: 'Question non trouvée' });
    }


    if (!content || !duration || !score) {
      return res.status(400).json({ 
        error: 'Les champs content, duration et score sont obligatoires' 
      });
    }

    await Question.update(id, {
      content,
      media_url: media_url || null,
      media_type: media_type || null,
      tolerance_rate: question.question_type === 'direct' ? (tolerance_rate || 0) : null,
      duration,
      score
    });


    if (question.question_type === 'direct') {
      if (!answer_text) {
        return res.status(400).json({ 
          error: 'Les questions directes nécessitent une réponse (answer_text)' 
        });
      }
      
      await QuestionOption.deleteDirectAnswer(id);
      await QuestionOption.create(id, answer_text);
    } 
    else if (question.question_type === 'qcm') {
      if (!options || options.length < 2) {
        return res.status(400).json({ 
          error: 'Les QCM doivent avoir au moins deux options' 
        });
      }

      const hasCorrectAnswer = options.some(opt => opt.is_correct);
      if (!hasCorrectAnswer) {
        return res.status(400).json({ 
          error: 'Les QCM doivent avoir au moins une réponse correcte' 
        });
      }

      await QuestionOption.deleteQCMOptions(id);
      for (const option of options) {
        await QuestionOption.createOptions(
          id,
          option.option_text,
          option.is_correct
        );
      }
    }

    res.json({ message: 'Question mise à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la question:', error);
    
    if (error.code === 'ER_BAD_NULL_ERROR') {
      return res.status(400).json({ 
        error: 'Certains champs requis sont manquants ou invalides' 
      });
    }
    
    res.status(500).json({ 
      error: 'Erreur serveur',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
},

  deleteQuestion: async (req, res) => {
    try {
      const { id } = req.params;

      const question = await Question.findById(id);
      if (!question) {
        return res.status(404).json({ error: 'Question non trouvée' });
      }

      await QuestionOption.deleteDirectAnswer(id);
      await QuestionOption.deleteQCMOptions(id);
      await Question.delete(id);

      res.json({ message: 'Question supprimée avec succès' });
    } catch (error) {
      console.error('Erreur lors de la suppression de la question:', error);
      res.status(500).json({ 
        error: 'Erreur serveur',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

module.exports = questionsController;