const express = require("express");

const app = express();


const PORT = process.env.PORT || 3000;
const userRoutes = require('./views/AuthView');



// Middleware
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Quelque chose a mal tourné!');
});


app.listen(PORT, () => {
  console.log(`Serveur en écoute sur le port ${PORT}`);
});




