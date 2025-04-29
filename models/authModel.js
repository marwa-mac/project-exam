const db = require('../BDD/run');

class User {
  /**
   * Trouve un utilisateur par email
   */
  static async findByEmail(email) {
    try {
      const [rows] = await db.query(
        'SELECT * FROM users WHERE email = ?', 
        [email.toLowerCase().trim()]
      );
      return rows[0];
    } catch (error) {
      console.error('Erreur recherche par email:', error);
      throw error;
    }
  }

  /**
   * Crée un nouvel utilisateur
   */
  static async create(userData) {
    try {
      const [result] = await db.query(
        'INSERT INTO users SET ?',
        [userData]
      );
      return { id: result.insertId, ...userData };
    } catch (error) {
      console.error('Erreur création utilisateur:', error);
      throw error;
    }
  }

  /**
   * Trouve un utilisateur par ID
   */
  static async findById(id) {
    try {
      const [rows] = await db.query(
        `SELECT 
          id, email, first_name, last_name,
          birth_date, gender, institution, field_of_study
         FROM users WHERE id = ?`,
        [id]
      );
      return rows[0];
    } catch (error) {
      console.error('Erreur recherche par ID:', error);
      throw error;
    }
  }
}

module.exports = User;