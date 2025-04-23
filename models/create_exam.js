const db = require('../BDD/run');

db.query('SELECT 1 + 1 AS solution')
  .then(([rows]) => console.log('Test BDD réussi:', rows))
  .catch(err => console.error('Erreur BDD:', err));

module.exports = {
  // Créer un examen
  create: async (data) => {
    const [result] = await db.execute(
      'INSERT INTO exams (title, description, target_audience) VALUES (?, ?, ?)',
      [data.title, data.description, data.target_audience]
    );
    return { id: result.insertId, ...data };
  },

  // Récupérer tous les examens
  findAll: async () => {
    const [exams] = await db.query('SELECT * FROM exams');
    return exams;
  }
};