const mysql = require('mysql2');

const conexao = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234', // Dica: use variáveis de ambiente (.env) aqui no futuro!
  database: 'observatorio'
});

conexao.connect(function(err) {
  if (err) throw err;
  console.log('Conexão com o banco de dados realizada!');
});

module.exports = conexao;