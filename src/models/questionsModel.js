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

  // questionsModel.js
  static async update(id, { content, media_url, media_type, tolerance_rate, duration, score }) {
    const query = `
      UPDATE questions 
      SET content = ?, 
          media_url = ?, 
          media_type = ?, 
          tolerance_rate = ?, 
          duration = ?, 
          score = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    await db.query(query, [
      content,
      media_url || null,
      media_type || null,
      tolerance_rate || 0,
      duration,
      score,
      id
    ]);
  }

  static async delete(id) {
    await db.query(
      `DELETE FROM questions WHERE id = ?`,
      [id]
    );
  }
  
  static getQuestionsByExamId(examId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT q.*, 
               GROUP_CONCAT(qo.id) AS option_ids,
               GROUP_CONCAT(qo.answer_text) AS options
        FROM questions q
        LEFT JOIN questions_options qo ON q.id = qo.question_id
        WHERE q.exam_id = ?
        GROUP BY q.id
        ORDER BY q.id
      `;
      
      db.query(query, [examId], (err, results) => {
        if (err) return reject(err);
        
        // Formater les résultats pour les questions QCM
        const formatted = results.map(question => {
          if (question.question_type === 'qcm') {
            const optionIds = question.option_ids ? question.option_ids.split(',') : [];
            const options = question.options ? question.options.split(',') : [];
            
            question.options = optionIds.map((id, index) => ({
              id: parseInt(id),
              answer_text: options[index]
            }));
          }
          
          delete question.option_ids;
          return question;
        });
        
        resolve(formatted);
      });
    });
  }
}

module.exports = Question;