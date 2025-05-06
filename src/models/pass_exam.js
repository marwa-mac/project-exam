const pool = require('../BDD/run'); 

const getAllExams = async (userId) => {
  const [rows] = await pool.query(
    'SELECT id, title, description, target_audience AS "targetAudience", semestre, created_by AS "createdby" FROM exams WHERE created_by != ?',
    [userId]
  );
  return rows;
};
module.exports = {
  getAllExams
};