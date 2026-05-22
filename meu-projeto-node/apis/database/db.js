const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root', 
  password: 'NovaSenhaForte123!',
  database: 'projeto_integrado'
});

connection.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao banco:', err);
    return;
  }
  console.log('Banco de dados conectado!');
});

module.exports = connection;