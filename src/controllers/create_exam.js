const examModel = require('../models/create_exam');

const getAllExamsById = async (req, res) => {
  try {
    const exams = await examModel.getAllExams();
    
    // Formatage explicite des données
    const formattedExams = exams.map(exam => ({
      title: exam.title || exam.Title || exam.TITLE,
      description: exam.description || exam.Description || exam.DESCRIPTION,
      targetAudience: exam.targetAudience || exam.TargetAudience || exam.TARGETAUDIENCE, 
      semestre: exam.semestre || exam.Semestre || exam.SEMESTRE,
      createdby: exam.createdby || exam.CreatedBy || exam.CREATEDBY,
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
  getAllExamsById
};