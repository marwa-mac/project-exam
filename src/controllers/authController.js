const User = require('../models/authModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authController = {
  
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

      if (!email || !password || !first_name || !last_name) {
        return res.status(400).json({ 
          message: 'Email, mot de passe, prénom et nom sont obligatoires' 
        });
      }

      const normalizedEmail = email.toLowerCase().trim();
      const normalizedPassword = password.normalize('NFKC');

      
      const existingUser = await User.findByEmail(normalizedEmail);
      if (existingUser) {
        return res.status(409).json({ message: 'Cet email est déjà utilisé' });
      }

      
      const hashedPassword = await bcrypt.hash(normalizedPassword, 12);

      
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

     
      const token = jwt.sign(
        { userId: newUser.id },
        process.env.JWT_SECRET || 'votre_secret_secure',
        { expiresIn: '24h' }
      );

      console.log("Token généré:", token);

      
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000, 
        sameSite: 'strict'
      });

      
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

  
  async login(req, res) {
    try {
      const { email, password } = req.body;

     
      if (!email || !password) {
        return res.status(400).json({ message: 'Email et mot de passe requis' });
      }

      
      const normalizedEmail = email.toLowerCase().trim();

      
      const user = await User.findByEmail(normalizedEmail);
      if (!user) {
        return res.status(401).json({ message: 'Identifiants incorrects' });
      }

    
      const normalizedPassword = password.normalize('NFKC');

     
      const isMatch = await bcrypt.compare(normalizedPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Identifiants incorrects' });
      }

      
      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET || 'votre_secret_secure',
        { expiresIn: '24h' }
      );

      console.log("Token généré:", token);

     
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000, 
        sameSite: 'strict'
      });

     
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

 
  async logout(req, res) {
    try {
      
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