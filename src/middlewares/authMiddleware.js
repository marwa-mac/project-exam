const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
      const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
      
      if (!token) {
          return res.status(401).json({ message: 'Authentification requise' });
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      req.userId = decoded.userId;
      console.log(token);
      next();
  } catch (error) {
      console.error('Erreur authentification:', error);
      res.clearCookie('token');
      return res.status(401).json({ message: 'Session invalide' });
  }
};