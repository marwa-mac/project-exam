const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
      // 1. Vérifier le token dans les cookies
      const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
      
      if (!token) {
          return res.status(401).json({ message: 'Authentification requise' });
      }

      // 2. Vérifier le token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      req.userId = decoded.userId;
      
      next();
  } catch (error) {
      console.error('Erreur authentification:', error);
      // 3. En cas d'erreur, nettoyer le cookie
      res.clearCookie('token');
      return res.status(401).json({ message: 'Session invalide' });
  }
};