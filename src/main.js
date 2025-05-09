const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser'); 
const app = express();
const examRoutes = require('./routes/pass_exam');
const authRoutes = require('./routes/authRoutes');
const createExamRoutes = require('./routes/create_exam');
const securePageMiddleware = require('./middlewares/authMiddleware');
const questionsRoutes = require('./routes/questionsRoutes');
const examDetailsRoutes = require('./routes/examDetailsRoute');
const examPassingRoutes = require('./routes/examPassingRoute');
const examParticipationRoutes = require('./routes/examParticipationRoutes');



// Middleware
app.use(express.json());
app.use(cookieParser()); 
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/exams', examRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/created', createExamRoutes);
app.use('/api/examsCreate', createExamRoutes); 
app.use('/api/questions', questionsRoutes);
app.use('/api/exam-passing', examPassingRoutes);
app.use('/api/exam-details', examDetailsRoutes);
app.use('/api/exam-participation', examParticipationRoutes);



// Pages non sécurisées
app.get('/auth', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', '../public/index.html'));
});

app.get('/connexion', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'connexion.html'));
});

app.get('/inscription', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'inscription.html'));
});

// Pages sécurisées
app.get('/exams', securePageMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'pass_exam.html'));
});

app.get('/created', securePageMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'create_exam.html'));
});

app.get('/add-questions', securePageMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'add-questions.html'));
    
});

app.get('/exam-details', securePageMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'exam-details.html'));
    
});

app.get('/take-exam', securePageMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'take-exam.html'));
});


// Démarrer le serveur
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

require('dotenv').config();