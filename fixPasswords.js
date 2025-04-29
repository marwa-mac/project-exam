require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./BDD/run');

async function fixPasswords() {
  try {
    // 1. Récupérer tous les utilisateurs
    const [users] = await db.query('SELECT id, email, password FROM users');
    
    // 2. Pour chaque utilisateur
    for (const user of users) {
      // Vérifier si le mot de passe est déjà hashé
      if (!user.password.startsWith('$2a$') && !user.password.startsWith('$2b$')) {
        console.log(`Hachage du mot de passe pour ${user.email}`);
        
        // Normaliser et hasher
        const normalized = user.password.normalize('NFKC');
        const hashed = await bcrypt.hash(normalized, 12);
        
        // Mettre à jour en base
        await db.query(
          'UPDATE users SET password = ? WHERE id = ?',
          [hashed, user.id]
        );
      }
    }
    
    console.log('Migration des mots de passe terminée');
    process.exit(0);
  } catch (error) {
    console.error('Erreur migration:', error);
    process.exit(1);
  }
}

fixPasswords();