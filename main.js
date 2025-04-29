const express = require('express');
const path = require('path');
const app = express();
const examRoutes = require('./routes/pass_exam');
const authRoutes = require('./routes/authRoutes');

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Ajoutez cette ligne

// Routes
app.use('/api/exams', examRoutes);

// Nouvelle route pour la page HTML
app.get('/exams', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'pass_exam.html'));
});

app.get('/auth', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'authview.html'));
});

// Routes authentification
app.use('/api/auth', authRoutes);



// Démarrer le serveur
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

require('dotenv').config();