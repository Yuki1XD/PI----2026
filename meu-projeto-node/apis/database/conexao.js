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
  
  // Aponta a conexão para o banco criado/existente
  conexaoSemBanco.query('USE observatorio;');

  // 3. Cria as tabelas automaticamente se não existirem (na ordem correta de dependência)
  criarTabelasPadrao();
});

function criarTabelasPadrao() {
  // 1. Tabelas Base (Não dependem de ninguém)
  const tabelaUsuarios = `
    CREATE TABLE IF NOT EXISTS users (
      id_user INT PRIMARY KEY AUTO_INCREMENT,
      name_user VARCHAR(50) NOT NULL,
      email_user VARCHAR(50) NOT NULL,
      address_user VARCHAR(50),
      cpf_user INT,
      password_user VARCHAR(25) NOT NULL,
      tipo ENUM('aluno', 'professor', 'admin') NOT NULL
    );
  `;

  const tabelaTurma = `
    CREATE TABLE IF NOT EXISTS turma (
      id_turma INT PRIMARY KEY AUTO_INCREMENT,
      nome_turma VARCHAR(50) NOT NULL,
      ano_letivo INT NOT NULL
    );
  `;

  const tabelaProjetos = `
    CREATE TABLE IF NOT EXISTS project (
      id_project INT PRIMARY KEY AUTO_INCREMENT,
      name_project VARCHAR(150) NOT NULL UNIQUE,
      img_project VARCHAR(100),
      creators_project VARCHAR(200) NOT NULL,
      date_project DATE DEFAULT (CURRENT_DATE),
      description_project VARCHAR(200),
      archives_project TEXT,
      tags_project VARCHAR(200),
      teacher_project VARCHAR(50),
      alalysis_project VARCHAR(200),
      status_project VARCHAR(50) NOT NULL
    );
  `;

  // 2. Tabelas com Chaves Estrangeiras (Dependem das tabelas base)
  const tabelaTurmaAlunos = `
    CREATE TABLE IF NOT EXISTS turma_alunos (
      turma_id INT,
      aluno_id INT,
      PRIMARY KEY (turma_id, aluno_id),
      FOREIGN KEY (turma_id) REFERENCES turma(id_turma) ON DELETE CASCADE,
      FOREIGN KEY (aluno_id) REFERENCES users(id_user) ON DELETE CASCADE
    );
  `;

  const tabelaTeacher = `
    CREATE TABLE IF NOT EXISTS teacher (
      id_teacher INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      turma_id INT NOT NULL,
      class_teacher VARCHAR(15),
      function_teacher VARCHAR(50),
      FOREIGN KEY (user_id) REFERENCES users(id_user) ON DELETE CASCADE,
      FOREIGN KEY (turma_id) REFERENCES turma(id_turma) ON DELETE CASCADE
    );
  `;

  const tabelaProjectCreators = `
    CREATE TABLE IF NOT EXISTS project_creators (
      project_id INT,
      user_id INT,
      PRIMARY KEY (project_id, user_id),
      FOREIGN KEY (project_id) REFERENCES project(id_project) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id_user) ON DELETE CASCADE
    );
  `;

  const tabelaAtualizacoes = `
    CREATE TABLE IF NOT EXISTS atualizações (
      id INT AUTO_INCREMENT PRIMARY KEY,
      titulo VARCHAR(150) NOT NULL,
      descricao TEXT,
      data_publicacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      usuario_id INT,
      FOREIGN KEY (usuario_id) REFERENCES users(id_user) ON DELETE CASCADE
    );
  `;

  // Execução das queries na ordem correta
  // Primeiro as tabelas independentes:
  conexaoSemBanco.query(tabelaUsuarios, (err) => { if (err) console.error('Erro tabela users:', err); });
  conexaoSemBanco.query(tabelaTurma, (err) => { if (err) console.error('Erro tabela turma:', err); });
  conexaoSemBanco.query(tabelaProjetos, (err) => { if (err) console.error('Erro tabela project:', err); });

  // Depois as tabelas que dependem das anteriores:
  conexaoSemBanco.query(tabelaTurmaAlunos, (err) => { if (err) console.error('Erro tabela turma_alunos:', err); });
  conexaoSemBanco.query(tabelaTeacher, (err) => { if (err) console.error('Erro tabela teacher:', err); });
  conexaoSemBanco.query(tabelaProjectCreators, (err) => { if (err) console.error('Erro tabela project_creators:', err); });
  
  conexaoSemBanco.query(tabelaAtualizacoes, (err) => {
    if (err) {
      console.error('Erro tabela atualizações:', err);
    } else {
      console.log('Todas as tabelas foram verificadas/criadas com sucesso no Node.js!');
    }
  });
}

// Exportamos a conexão já configurada
module.exports = conexaoSemBanco;