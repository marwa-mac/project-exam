const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser'); // Ajoutez ce package
const app = express();
const examRoutes = require('./routes/pass_exam');
const authRoutes = require('./routes/authRoutes');
const createExamRoutes = require('./routes/create_exam');
const securePageMiddleware = require('./middlewares/authMiddleware');


// Middleware
app.use(express.json());
app.use(cookieParser()); // Pour gérer les cookies
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/exams', examRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/created', createExamRoutes);

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

// Démarrer le serveur
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

require('dotenv').config();