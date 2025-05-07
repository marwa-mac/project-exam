const examDetailsModel = require('../models/examDetailsModel');

const getExamWithQuestions = async (req, res) => {
  try {
    const { exam_id } = req.params;
    
    if (!exam_id) {
      return res.status(400).json({ error: 'ID de l\'examen requis' });
    }
    
    const exam = await examDetailsModel.getExamWithQuestions(exam_id);
    
    if (!exam) {
      return res.status(404).json({ error: 'Examen non trouvé' });
    }
    
    res.json(exam);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'examen:', error);
    res.status(500).json({ 
      error: 'Erreur serveur',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getExamWithQuestions
};