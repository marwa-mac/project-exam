const db = require('../BDD/run');

class QuestionOption {
  
  static async create(question_id, answer_text) {
    const [result] = await db.query(
      `INSERT INTO questions_options (question_id, answer_text) 
       VALUES (?, ?)`,
      [question_id, answer_text]
    );
    return result.insertId;
  }

  static async createOptions(question_id, option_text, is_correct = false) {
    const [result] = await db.query(
      `INSERT INTO qcm_options (question_id, option_text, is_correct) 
       VALUES (?, ?, ?)`,
      [question_id, option_text, is_correct]
    );
    return result.insertId;
  }

  static async getDirectAnswer(question_id) {
    const [rows] = await db.query(
      `SELECT answer_text FROM questions_options WHERE question_id = ?`,
      [question_id]
    );
    return rows[0]?.answer_text;
  }

  static async getQCMOptions(question_id) {
    const [rows] = await db.query(
      `SELECT id, option_text, is_correct 
       FROM qcm_options 
       WHERE question_id = ? 
       ORDER BY id`,
      [question_id]
    );
    return rows;
  }

 
  static async deleteDirectAnswer(question_id) {
    await db.query(
      `DELETE FROM direct_answers WHERE question_id = ?`,
      [question_id]
    );
  }

  static async deleteQCMOptions(question_id) {
    await db.query(
      `DELETE FROM qcm_options WHERE question_id = ?`,
      [question_id]
    );
  }
}

module.exports = QuestionOption;