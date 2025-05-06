const examModel = require('../models/create_exam');

const getAllExams = async (req, res) => {
  try {
    const exams = await examModel.getAllExams();
    
    const formattedExams = exams.map(exam => ({
      id: exam.id || exam.Id || exam.ID,
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

// Dans controllers/create_exam.js
const createExam = async (req, res) => {
  try {
    const { title, description, target_audience, semestre, created_by } = req.body;
    
    if (!title || !target_audience || !semestre || !created_by) {
      return res.status(400).json({ 
        error: 'Tous les champs obligatoires doivent être fournis',
        required: ['title', 'target_audience', 'semestre', 'created_by']
      });
    }

    const newExam = await examModel.createExam({
      title,
      description,
      target_audience,
      semestre,
      created_by
    });

    res.status(201).json({
      success: true,
      exam: newExam
    });

  } catch (error) {
    console.error('Erreur création examen:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erreur serveur',
      details: error.message
    });
  }
};
module.exports = {
  getAllExams,
  createExam
};