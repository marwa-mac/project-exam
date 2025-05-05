const db = require('../BDD/run');

class QuestionOption {
  static async create(question_id, answer_text) {
    const [result] = await db.query(
      `INSERT INTO questions_options (question_id, answer_text) VALUES (?, ?)`,
      [question_id, answer_text]
    );
    return result.insertId;
  }

  static async findByQuestionId(question_id) {
    const [rows] = await db.query(
      `SELECT * FROM questions_options WHERE question_id = ?`,
      [question_id]
    );
    return rows;
  }

  static async deleteByQuestionId(question_id) {
    await db.query(
      `DELETE FROM questions_options WHERE question_id = ?`,
      [question_id]
    );
  }
}

module.exports = QuestionOption;