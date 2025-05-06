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
        password: hashedPassword,
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

      console.log("Token généré:", token);

      // Définition du cookie HttpOnly
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000, // 24 heures
        sameSite: 'strict'
      });

      // Réponse sans le mot de passe
      const { password: _, ...userData } = newUser;
      
      return res.status(201).json({
        message: 'Inscription réussie',
        user: userData,
        redirect: '/connexion'
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

      // Récupération de l'utilisateur
      const user = await User.findByEmail(normalizedEmail);
      if (!user) {
        return res.status(401).json({ message: 'Identifiants incorrects' });
      }

      // Normalisation du mot de passe
      const normalizedPassword = password.normalize('NFKC');

      // Comparaison sécurisée
      const isMatch = await bcrypt.compare(normalizedPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Identifiants incorrects' });
      }

      // Génération du token
      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET || 'votre_secret_secure',
        { expiresIn: '24h' }
      );

      console.log("Token généré:", token);

      // Définition du cookie HttpOnly
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000, // 24 heures
        sameSite: 'strict'
      });

      // Réponse sans mot de passe
      const { password: _, ...userData } = user;
      
      return res.json({
        message: 'Connexion réussie',
        user: userData,
        redirect: '/created'
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
   * Déconnexion de l'utilisateur
   */
  async logout(req, res) {
    try {
      // Suppression du cookie
      res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      
      return res.status(200).json({ 
        message: 'Déconnexion réussie',
        redirect: '/auth'
      });
    } catch (error) {
      console.error('Erreur déconnexion:', error);
      return res.status(500).json({ message: 'Erreur serveur' });
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
  },

  /**
   * Vérification de l'authentification
   */
  async checkAuth(req, res) {
    try {
      const token = req.cookies.token;
      if (!token) {
        return res.status(401).json({ isAuthenticated: false });
      }

      jwt.verify(token, process.env.JWT_SECRET || 'votre_secret_secure');
      return res.json({ isAuthenticated: true });
      
    } catch (error) {
      return res.status(401).json({ isAuthenticated: false });
    }
  }
};

module.exports = authController;