// models/examDetailsModel.js
const pool = require('../BDD/run');
const Question = require('./questionsModel');
const QuestionOption = require('./questionsOptionsModel');

const getExamWithQuestions = async (examId) => {
  // Récupérer les infos de base de l'examen
  const [examRows] = await pool.query(
    'SELECT id, title, description, target_audience AS "targetAudience", semestre, access_link FROM exams WHERE id = ?',
    [examId]
  );
  
  if (examRows.length === 0) {
    return null;
  }
  
  const exam = examRows[0];
  
  // Récupérer les questions de l'examen
  const questions = await Question.findByExamId(examId);
  
  // Pour chaque question, récupérer les options/réponses
  const questionsWithDetails = await Promise.all(
    questions.map(async (question) => {
      let answers;
      
      if (question.question_type === 'direct') {
        const answer = await QuestionOption.getDirectAnswer(question.id);
        answers = { answer_text: answer };
      } else if (question.question_type === 'qcm') {
        answers = await QuestionOption.getQCMOptions(question.id);
      }
      
      return {
        ...question,
        answers
      };
    })
  );
  
  return {
    ...exam,
    questions: questionsWithDetails
  };
};

module.exports = {
  getExamWithQuestions
};