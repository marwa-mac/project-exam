const pool = require('../BDD/run');

class ExamParticipation {
  static async startExam(examId, userId, latitude, longitude) {
    const [result] = await pool.query(
      `INSERT INTO exam_participations 
       (exam_id, user_id, latitude, longitude, started_at) 
       VALUES (?, ?, ?, ?, NOW()) 
       ON DUPLICATE KEY UPDATE started_at = NOW()`,
      [examId, userId, latitude, longitude]
    );
    return result.insertId;
  }

  static async finishExam(participationId, totalScore) {
    const [result] = await pool.query(
      `UPDATE exam_participations 
       SET finished_at = NOW(), total_score = ? 
       WHERE id = ?`,
      [totalScore, participationId]
    );
    return result.affectedRows;
  }

  static async getUserParticipation(examId, userId) {
    const [rows] = await pool.query(
      `SELECT * FROM exam_participations 
       WHERE exam_id = ? AND user_id = ?`,
      [examId, userId]
    );
    return rows[0];
  }

  static async saveAnswer(participationId, questionId, answer, isCorrect, score) {

    const formattedAnswer = typeof answer === 'string' ? answer : JSON.stringify(answer);
  
  await pool.query(
    `INSERT INTO exam_answers 
     (participation_id, question_id, answer, is_correct, score) 
     VALUES (?, ?, ?, ?, ?)`,
    [participationId, questionId, formattedAnswer, isCorrect, score]
  );
  }

  static async getUserParticipationById(participationId) {
  const [rows] = await pool.query(
    `SELECT * FROM exam_participations 
     WHERE id = ?`,
    [participationId]
  );
  return rows[0];
}
}

module.exports = ExamParticipation;