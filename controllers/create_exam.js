const Exam = require('../models/create_exam');

module.exports = {
  // Créer un examen
  

  createExam: async (req, res) => {
    try {
      console.log('Reçu:', req.body); // Log des données reçues
      const { title, description, target_audience } = req.body;
      
      if (!title || !target_audience) {
        return res.status(400).json({ error: 'Titre et audience requis' });
      }
  
      const exam = await Exam.create({ 
        title, 
        description: description || '',
        target_audience 
      });
  
      console.log('Examen créé:', exam); // Log du résultat
      res.status(201).json(exam);
    } catch (error) {
      console.error('Erreur complète:', error); // Log détaillé
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },

  // Lister tous les examens
  getAllExams: async (req, res) => {
    try {
      const exams = await Exam.findAll();
      res.json(exams);
    } catch (error) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
};