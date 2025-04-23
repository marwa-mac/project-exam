const pool = require('../BDD/run'); 

const getAllExams = async () => {
  const [rows] = await pool.query('SELECT title AS "title", description AS "description", target_audience AS "targetAudience" FROM exams;');
  return rows;
};

module.exports = {
  getAllExams
};