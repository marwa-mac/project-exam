const examModel = require('../models/pass_exam');

const getAllExams = async (req, res) => {
  try {
   
    const userId = req.userId; 
    
    if (!userId) {
      return res.status(401).json({ error: 'Non autorisé' });
    }
    
    const exams = await examModel.getAllExams(userId);
    
    
    const formattedExams = exams.map(exam => ({
      id: exam.id,
      title: exam.title,
      description: exam.description,
      targetAudience: exam.targetAudience, 
      semestre: exam.semestre,
      createdby: exam.createdby
    }));

    res.json(formattedExams);
  } catch (error) {
    console.error('Error fetching exams:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des exams',
      details: error.message 
    });
  }
};

module.exports = {
  getAllExams
};