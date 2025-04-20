const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',        // Remplacez par votre utilisateur MySQL
  password: 'root',        // Remplacez par votre mot de passe MySQL
  database: 'project_exam', // Remplacez par le nom de votre base de données
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;