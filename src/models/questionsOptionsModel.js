const db = require('../BDD/run');

class QuestionOption {
  // Pour les questions directes (réponse unique)
  static async create(question_id, answer_text) {
    const [result] = await db.query(
      `INSERT INTO questions_options (question_id, answer_text) 
       VALUES (?, ?)`,
      [question_id, answer_text]
    );
    return result.insertId;
  }

  // Pour les QCM (plusieurs options avec indication de correction)
  static async createOptions(question_id, option_text, is_correct = false) {
    const [result] = await db.query(
      `INSERT INTO qcm_options (question_id, option_text, is_correct) 
       VALUES (?, ?, ?)`,
      [question_id, option_text, is_correct]
    );
    return result.insertId;
  }

  // Méthodes pour récupérer les options/réponses
  static async getDirectAnswer(question_id) {
    const [rows] = await db.query(
      `SELECT correct_answer FROM direct_answers WHERE question_id = ?`,
      [question_id]
    );
    return rows[0]?.correct_answer;
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

  // Méthodes de suppression
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