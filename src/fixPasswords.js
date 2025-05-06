require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./BDD/run');

async function fixPasswords() {
  try {
   
    const [users] = await db.query('SELECT id, email, password FROM users');
    
    
    for (const user of users) {
      
      if (!user.password.startsWith('$2a$') && !user.password.startsWith('$2b$')) {
        console.log(`Hachage du mot de passe pour ${user.email}`);
        
       
        const normalized = user.password.normalize('NFKC');
        const hashed = await bcrypt.hash(normalized, 12);
        
        
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