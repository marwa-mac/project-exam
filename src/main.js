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
const participationRoutes = require('./routes/participationRoutes');
const axios = require('axios');



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
app.use('/api/exams', createExamRoutes);
app.use('/api/participations', participationRoutes);



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

app.get('/participations', securePageMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'exam_resultats.html'));
});

app.get('/eliteexam.png', securePageMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'eliteexam.png'));
});


app.get('/api/reverse-geocode', async (req, res) => {
    const { lat, lng } = req.query;
    
    if (!lat || !lng) {
        return res.status(400).json({ error: 'Latitude et longitude requises' });
    }

    try {
        const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
            params: {
                latlng: `${lat},${lng}`,
                key: 'VOTRE_CLE_API_GOOGLE_MAPS',
                language: 'fr' // Pour obtenir les résultats en français
            }
        });

        if (response.data.status === 'OK') {
            res.json({
                address: response.data.results[0].formatted_address,
                details: response.data.results[0]
            });
        } else {
            res.status(404).json({ error: 'Adresse non trouvée' });
        }
    } catch (error) {
        console.error('Erreur de géocodage:', error);
        res.status(500).json({ error: 'Erreur lors du géocodage' });
    }
});


// Démarrer le serveur
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

require('dotenv').config();