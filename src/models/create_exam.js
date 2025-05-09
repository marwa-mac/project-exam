const pool = require('../BDD/run');


const getAllExams = async (userId) => {
  const [rows] = await pool.query(
    'SELECT id, title, description, target_audience AS "targetAudience", semestre, created_by AS "createdBy" FROM exams WHERE created_by = ?',
    [userId]
  );
  return rows;
};

const createExam = async (examData) => {
  const { title, description, target_audience, semestre, created_by } = examData;
  
 
  const access_link = `exam-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  
  const [result] = await pool.query(
    'INSERT INTO exams (title, description, target_audience, access_link, created_by, updated_at, semestre) VALUES (?, ?, ?, ?, ?, UNIX_TIMESTAMP(), ?)',
    [title, description, target_audience, access_link, created_by, semestre]
  );
  
  return { id: result.insertId, access_link, ...examData };
};

const getExamWithQuestions = async (examId) => {
  // Récupérer les infos de base de l'examen
  const [examRows] = await pool.query(
    'SELECT id, title, target_audience AS targetAudience, semestre, access_link AS accessLink FROM exams WHERE id = ?',
    [examId]
  );
  
  if (examRows.length === 0) return null;
  
  const exam = examRows[0];
  
  // Récupérer les questions de l'examen
  const [questionRows] = await pool.query(
    'SELECT id, question_type AS questionType, content, duration, score FROM questions WHERE exam_id = ?',
    [examId]
  );
  
  exam.questions = [];
  
  // Pour chaque question, récupérer les réponses
  for (const question of questionRows) {
    if (question.questionType === 'qcm') {
      // Récupérer les options QCM
      const [optionRows] = await pool.query(
        'SELECT id, option_text AS optionText, is_correct AS isCorrect FROM qcm_options WHERE question_id = ?',
        [question.id]
      );
      question.answers = optionRows;
    } else {
      // Récupérer la réponse directe
      const [answerRows] = await pool.query(
        'SELECT correct_answer AS correctAnswer FROM direct_answers WHERE question_id = ?',
        [question.id]
      );
      question.answers = answerRows[0] || { correctAnswer: '' };
    }
    
    exam.questions.push(question);
  }
  
  return exam;
};

module.exports = {
  getAllExams,
  createExam,
  getExamWithQuestions
};