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

module.exports = {
  getAllExams,
  createExam
};