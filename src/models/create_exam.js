const pool = require('../BDD/run');

const getAllExams = async () => {
  const [rows] = await pool.query('SELECT id AS "id", title AS "title", description AS "description", target_audience AS "targetAudience", semestre AS "semestre", created_by AS "createdby" FROM exams where created_by = 1;');
  return rows;
};

const createExam = async (examData) => {
  const { title, description, target_audience, semestre, created_by } = examData;
  
  // Générer un lien d'accès unique (vous pouvez utiliser un UUID ou autre méthode)
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