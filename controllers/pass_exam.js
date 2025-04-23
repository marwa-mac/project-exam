const examModel = require('../models/pass_exam');

const getAllExams = async (req, res) => {
  try {
    const exams = await examModel.getAllExams();
    
    // Formatage explicite des données
    const formattedExams = exams.map(exam => ({
      title: exam.title || exam.Title || exam.TITLE, // Toutes les variations possibles
      description: exam.description || exam.Description || exam.DESCRIPTION,
      targetAudience : exam.targetaudience || exam.targetAudience || exam.TARGETAUDIENCE
    }));

    res.json(formattedExams);
  } catch (error) {
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des exams',
      details: error.message 
    });
  }
};

module.exports = {
  getAllExams
};