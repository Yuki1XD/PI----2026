// apis/database/conexao.js
const mysql = require('mysql2');

// 1. Conecta primeiro sem especificar o banco de dados (apenas no servidor)
const conexaoSemBanco = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234'
});

// 2. Cria o banco de dados se ele não existir
conexaoSemBanco.query('CREATE DATABASE IF NOT EXISTS observatorio;', (err) => {
  if (err) {
    console.error('Erro ao criar o banco de dados:', err);
    return;
  }
  console.log('Banco de dados "observatorio" pronto!');
  
  // Como o banco já existe, apontamos a conexão para ele
  conexaoSemBanco.query('USE observatorio;');

  // 3. Cria as tabelas automaticamente se não existirem
  criarTabelasPadrao();
});

function criarTabelasPadrao() {
  const tabelaUsuarios = `
    CREATE TABLE IF NOT EXISTS users (
      id_user INT AUTO_INCREMENT PRIMARY KEY,
      email_user VARCHAR(255) NOT NULL,
      password_user VARCHAR(255) NOT NULL
    );
  `;

  const tabelaProjetos = `
    CREATE TABLE IF NOT EXISTS projeto (
      id_project INT AUTO_INCREMENT PRIMARY KEY,
      name_project VARCHAR(255) NOT NULL,
      img_project VARCHAR(255),
      creators_project VARCHAR(255),
      date_project DATE,
      description_project TEXT,
      archives_project TEXT,
      status_project VARCHAR(50) DEFAULT 'enviado'
    );
  `;

  conexaoSemBanco.query(tabelaUsuarios, (err) => {
    if (err) console.error('Erro ao criar tabela users:', err);
  });

  conexaoSemBanco.query(tabelaProjetos, (err) => {
    if (err) console.error('Erro ao criar tabela projeto:', err);
    else console.log('Tabelas verificadas/criadas com sucesso!');
  });
}

// Exportamos a conexão já configurada
module.exports = conexaoSemBanco;
