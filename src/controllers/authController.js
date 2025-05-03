const User = require('../models/authModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authController = {
  /**
   * Enregistrement d'un nouvel utilisateur
   */
  async register(req, res) {
    try {
      const { 
        email, 
        password, 
        first_name, 
        last_name,
        birth_date,
        gender,
        institution,
        field_of_study
      } = req.body;

      // Validation des champs obligatoires
      if (!email || !password || !first_name || !last_name) {
        return res.status(400).json({ 
          message: 'Email, mot de passe, prénom et nom sont obligatoires' 
        });
      }

      // Normalisation
      const normalizedEmail = email.toLowerCase().trim();
      const normalizedPassword = password.normalize('NFKC');

      // Vérification de l'existence de l'utilisateur
      const existingUser = await User.findByEmail(normalizedEmail);
      if (existingUser) {
        return res.status(409).json({ message: 'Cet email est déjà utilisé' });
      }

      // Hachage du mot de passe
      const hashedPassword = await bcrypt.hash(normalizedPassword, 12);

      // Création de l'utilisateur avec les données contrôlées
      const newUser = await User.create({
        email: normalizedEmail,
        password: hashedPassword, // On utilise bien le hash ici
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        birth_date: birth_date || null,
        gender: gender || null,
        institution: institution || null,
        field_of_study: field_of_study || null
      });

      // Génération du token JWT
      const token = jwt.sign(
        { userId: newUser.id },
        process.env.JWT_SECRET || 'votre_secret_secure',
        { expiresIn: '24h' }
      );

      // Réponse sans le mot de passe
      const { password: _, ...userData } = newUser;
      
      return res.status(201).json({
        message: 'Inscription réussie',
        token,
        user: userData
      });

    } catch (error) {
      console.error('Erreur inscription:', error);
      return res.status(500).json({ 
        message: 'Erreur serveur',
        ...(process.env.NODE_ENV === 'development' && { 
          error: error.message,
          stack: error.stack 
        })
      });
    }
},

  /**
   * Connexion de l'utilisateur
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validation basique
      if (!email || !password) {
        return res.status(400).json({ message: 'Email et mot de passe requis' });
      }

      // Normalisation de l'email
      const normalizedEmail = email.toLowerCase().trim();
      console.log(`Tentative de connexion: ${normalizedEmail}`);

      // Récupération de l'utilisateur
      const user = await User.findByEmail(normalizedEmail);
      if (!user) {
        console.log('Email non trouvé en base');
        return res.status(401).json({ message: 'Identifiants incorrects' });
      }

      // Normalisation du mot de passe
      const normalizedPassword = password.normalize('NFKC');
      
      // Debug: Vérification visuelle
      console.log('Comparaison entre:', 
        `"${normalizedPassword}"`, 
        'et hash:', 
        user.password.substring(0, 10) + '...'
      );

      // Comparaison sécurisée
      const isMatch = await bcrypt.compare(normalizedPassword, user.password);
      console.log('Résultat comparaison:', isMatch);

      if (!isMatch) {
        // Debug avancé
        const testHash = await bcrypt.hash(normalizedPassword, 12);
        console.log('Hash test généré:', testHash);
        
        return res.status(401).json({ 
          message: 'Identifiants incorrects',
          ...(process.env.NODE_ENV === 'development' && {
            debug: {
              passwordLength: normalizedPassword.length,
              firstChars: normalizedPassword.substring(0, 5),
              hashStored: user.password.substring(0, 15) + '...'
            }
          })
        });
      }

      // Génération du token
      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET || 'votre_secret_secure',
        { expiresIn: '24h' }
      );

      // Réponse sans mot de passe
      const { password: _, ...userData } = user;
      
      return res.json({
        message: 'Connexion réussie',
        token,
        user: userData
      });

    } catch (error) {
      console.error('Erreur connexion:', error);
      return res.status(500).json({ 
        message: 'Erreur serveur',
        ...(process.env.NODE_ENV === 'development' && {
          error: error.message
        })
      });
    }
  },

  /**
   * Récupération du profil utilisateur
   */
  async getProfile(req, res) {
    try {
      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }

      const { password: _, ...userData } = user;
      return res.json(userData);

    } catch (error) {
      console.error('Erreur récupération profil:', error);
      return res.status(500).json({ message: 'Erreur serveur' });
    }
  }
};

module.exports = authController;