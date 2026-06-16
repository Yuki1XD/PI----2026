require('dotenv').config();
const conexao = require('./src/apis/database/conexao'); 

// 1. POPULANDO AS TURMAS
const inserirTurmasSQL = `
  INSERT IGNORE INTO turma (id_turma, nome_turma, ano_letivo) VALUES 
  (1, '1º Periodo ADS', 2026),
  (2, '2º Periodo ADS', 2026),
  (3, '3º Periodo ADS', 2026);
`;

// 2. POPULANDO OS USUÁRIOS (Alunos, Professores e Admins amarrados às turmas)
const inserirUsuariosSQL = `
  INSERT IGNORE INTO users (id_user, name_user, email_user, address_user, cpf_user, password_user, tipo, turma_id) VALUES 
  (1, 'Lucas Silva', 'lucas@edu.com', 'Rua A, 123', '11122233344', 'senha123', 'aluno', 1),       
  (2, 'Mariana Souza', 'mariana@edu.com', 'Rua B, 456', '55566677788', 'senha456', 'aluno', 1),   
  (3, 'Carlos Eduardo', 'carlos@edu.com', 'Rua C, 789', '99900011122', 'senha789', 'aluno', 2),  
  (4, 'Reginaldo Leme', 'reginaldo@edu.com', 'Av. Central, 10', '12345678901', 'prof123', 'professor', 1),
  (5, 'Ana Beatriz', 'ana.beatriz@edu.com', 'Av. Norte, 20', '23456789012', 'prof456', 'professor', 2),
  (6, 'Sérgio Moro', 'sergio@edu.com', 'Av. Sul, 30', '34567890123', 'prof789', 'professor', 3),
  (7, 'Diretora Glória', 'gloria@admin.com', 'Rua Principal, 1', '45678901234', 'admin123', 'admin', 1),
  (8, 'Vice-Diretor Roberto', 'roberto@admin.com', 'Rua Lateral, 2', '56789012345', 'admin456', 'admin', 1),
  (9, 'Coordenadora Marta', 'marta@admin.com', 'Rua Direita, 3', '67890123456', 'admin789', 'admin', 1);
`;

// 3. POPULANDO OS PROFESSORES (Tabela teacher)
const inserirTeachersSQL = `
  INSERT IGNORE INTO teacher (user_id, turma_id, class_teacher, function_teacher) VALUES 
  (4, 1, 'Requisitos', 'Regente'), 
  (5, 2, 'Coding', 'Regente'),    
  (6, 3, 'Banco de Dados', 'Colaborador');
`;

// 4. POPULANDO PROJETOS DE TESTE (Respeitando a tabela project atualizada)
const inserirProjetosSQL = `
  INSERT IGNORE INTO project (id_project, name_project, creators_project, description_project, tags_project, category_project, class_project, teacher_project, status_project, visibility_project) VALUES
  (1, 'Portal de Achados e Perdidos', 'Lucas Silva e Mariana Souza', 'Sistema para ajudar alunos do Senac', 'Tecnologia, Web', 'Tecnologia da Informação', '1º Periodo ADS', 'Reginaldo Leme', 'aprovado', 'publico'),
  (2, 'App de Monitoria Escolar', 'Carlos Eduardo', 'Plataforma para agendamento de estudos', 'Mobile, Educação', 'Tecnologia da Informação', '2º Periodo ADS', 'Ana Beatriz', 'pendente', 'privado');
`;

console.log("Aguardando conexao.js criar/verificar o banco e as tabelas na Aiven...");

// Timer de segurança para dar tempo do conexao.js rodar primeiro
setTimeout(() => {
  console.log("Iniciando inserção da nova massa de dados...");

  // Passo A: Insere as Turmas (Obrigatório vir primeiro!)
  conexao.query(inserirTurmasSQL, (err) => {
    if (err) return console.error("❌ Erro ao inserir turmas:", err.message);
    console.log("✅ Turmas inseridas com sucesso!");

    // Passo B: Insere os Usuários
    conexao.query(inserirUsuariosSQL, (errUser) => {
      if (errUser) return console.error("❌ Erro ao inserir usuários:", errUser.message);
      console.log("✅ Usuários (Alunos/Profs/Admins) inseridos com sucesso!");

      // Passo C: Insere as amarrações dos Professores
      conexao.query(inserirTeachersSQL, (errTeach) => {
        if (errTeach) return console.error("❌ Erro ao inserir na tabela teacher:", errTeach.message);
        console.log("✅ Vínculos de professores inseridos na tabela 'teacher'!");

        // Passo D: Insere os Projetos de Teste
        conexao.query(inserirProjetosSQL, (errProj) => {
          if (errProj) return console.error("❌ Erro ao inserir projetos:", errProj.message);
          console.log("✅ Projetos de teste inseridos com sucesso!");
          
          console.log("🚀 Banco de dados totalmente popular e pronto para uso!");
          process.exit();
        });
      });
    });
  });
}, 3000);