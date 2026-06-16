// apis/database/conexao.js
const mysql = require('mysql2');

// 1. Conecta primeiro sem especificar o banco de dados (apenas no servidor)
const conexao = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'defaultdb',
  port: process.env.DB_PORT || 3306,
  ssl: { rejectUnauthorized: false } // Aiven exige SSL
});

// 2. Cria o banco de dados se ele não existir
conexao.query('CREATE DATABASE IF NOT EXISTS observatorio;', (err) => {
  if (err) {
    console.error('Erro ao criar o banco de dados:', err);
    return;
  }
  console.log('Banco de dados "observatorio" pronto!');
  
  // Aponta a conexão para o banco criado/existente
  conexao.query('USE observatorio;');

  // 3. Cria as tabelas automaticamente se não existirem (na ordem correta de dependência)
  criarTabelasPadrao();
});

function criarTabelasPadrao() {
  // 1. TABELAS BASE (Ordem alterada: turma precisa vir antes de users devido à FK)
  const tabelaTurma = `
    CREATE TABLE IF NOT EXISTS turma (
      id_turma INT PRIMARY KEY AUTO_INCREMENT,
      nome_turma VARCHAR(50) NOT NULL,
      ano_letivo INT NOT NULL
    );
  `;

  // Atualizada com turma_id, status_user e avatar_user
  const tabelaUsuarios = `
    CREATE TABLE IF NOT EXISTS users (
      id_user INT PRIMARY KEY AUTO_INCREMENT,
      name_user VARCHAR(50) NOT NULL,
      email_user VARCHAR(50) NOT NULL,
      address_user VARCHAR(50),
      cpf_user VARCHAR(11),
      password_user VARCHAR(25) NOT NULL,
      tipo ENUM('aluno', 'professor', 'admin') NOT NULL,
      turma_id INT NOT NULL,
      status_user ENUM('ativo', 'inativo') NOT NULL DEFAULT 'ativo',
      avatar_user VARCHAR(100) DEFAULT NULL,
      FOREIGN KEY (turma_id) REFERENCES turma(id_turma) ON DELETE RESTRICT
    );
  `;

  // Atualizada com category_project, class_project e visibility_project
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
      category_project VARCHAR(50) NOT NULL DEFAULT 'Não informada',
      class_project VARCHAR(50) NOT NULL DEFAULT 'Não informada',
      teacher_project VARCHAR(50) NOT NULL DEFAULT 'Não informado',
      analysis_project VARCHAR(200),
      status_project VARCHAR(50) NOT NULL,
      visibility_project VARCHAR(15) DEFAULT 'privado'
    );
  `;

  // 2. TABELAS DE DEPENDÊNCIA N:N E CHAVES ESTRANGEIRAS
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

  // Execução das queries respeitando estritamente a hierarquia das FKs:
  conexao.query(tabelaTurma, (err) => { 
    if (err) return console.error('Erro tabela turma:', err); 

    // Só cria users depois que a tabela turma existir
    conexao.query(tabelaUsuarios, (err) => { 
      if (err) return console.error('Erro tabela users:', err); 

      // Cria as tabelas que dependem de users e turmas
      conexao.query(tabelaTeacher, (err) => { if (err) console.error('Erro tabela teacher:', err); });
      conexao.query(tabelaAtualizacoes, (err) => { if (err) console.error('Erro tabela atualizações:', err); });
    });
  });

  // Cria a tabela de projetos de forma independente
  conexao.query(tabelaProjetos, (err) => { 
    if (err) return console.error('Erro tabela project:', err); 

    // Só cria project_creators depois que a tabela project existir
    conexao.query(tabelaProjectCreators, (err) => { if (err) console.error('Erro tabela project_creators:', err); });
  });

  // Log final simplificado (as queries rodam em paralelo/assíncronas)
  setTimeout(() => {
    console.log('Todas as tabelas foram validadas/criadas na Aiven!');
  }, 1500);
}

module.exports = conexao;