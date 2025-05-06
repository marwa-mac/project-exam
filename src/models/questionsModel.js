const db = require('../BDD/run');

class Question {
  static async create(questionData) {
    const { exam_id, question_type, content, media_url, media_type, tolerance_rate, duration, score } = questionData;
    
    const [result] = await db.query(
      `INSERT INTO questions 
       (exam_id, question_type, content, media_url, media_type, tolerance_rate, duration, score) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [exam_id, question_type, content, media_url || null, media_type || null, tolerance_rate || 0, duration, score]
    );
    
    return result.insertId;
  }

  static async findByExamId(exam_id) {
    const [rows] = await db.query(
      `SELECT * FROM questions WHERE exam_id = ? ORDER BY created_at`,
      [exam_id]
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.query(
      `SELECT * FROM questions WHERE id = ?`,
      [id]
    );
    return rows[0];
  }

  static async delete(id) {
    await db.query(
      `DELETE FROM questions WHERE id = ?`,
      [id]
    );
  }
}

module.exports = Question;