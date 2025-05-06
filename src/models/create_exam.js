const pool = require('../BDD/run'); 

const getAllExams = async () => {
  const [rows] = await pool.query('SELECT id AS "id", title AS "title", description AS "description", target_audience AS "targetAudience", semestre AS "semestre", created_by AS "createdby" FROM exams where created_by = 1;');
  return rows;
};

module.exports = {
  getAllExams
};