require('dotenv').config();
const conexao = require('./src/apis/database/conexao');

console.log("Derrubando tabelas antigas na Aiven para atualizar a estrutura...");

// Espera 1.5 segundo para garantir a conexão
setTimeout(() => {
  // 1. Apaga primeiro as tabelas que dependem de outras (Chaves Estrangeiras)
  conexao.query('DROP TABLE IF EXISTS turma_alunos;', () => {
    conexao.query('DROP TABLE IF EXISTS teacher;', () => {
      conexao.query('DROP TABLE IF EXISTS project_creators;', () => {
        conexao.query('DROP TABLE IF EXISTS atualizações;', () => {
          
          // 2. Agora apaga as tabelas principais
          conexao.query('DROP TABLE IF EXISTS users;', () => {
            conexao.query('DROP TABLE IF EXISTS project;', () => {
              conexao.query('DROP TABLE IF EXISTS turma;', (err) => {
                if (err) {
                  console.error("❌ Erro ao limpar banco:", err.message);
                } else {
                  console.log("🗑️ Banco de dados limpo com sucesso!");
                }
                process.exit();
              });
            });
          });

        });
      });
    });
  });
}, 1500);