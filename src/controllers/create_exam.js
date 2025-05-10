const examModel = require('../models/create_exam');
const examDetailsModel = require('../models/examDetailsModel');


const getAllExams = async (req, res) => {
  try {
   
    const userId = req.userId; 
    
    if (!userId) {
      return res.status(401).json({ error: 'Non autorisé' });
    }

    const exams = await examModel.getAllExams(userId);
    
    res.json(exams);
  } catch (error) {
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des exams',
      details: error.message 
    });
  }
};


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


const getExamDetails = async (req, res) => {
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
  getAllExams,
  createExam,
  getExamDetails
};