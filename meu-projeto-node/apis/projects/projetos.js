// apis/projetos.js
const express = require('express');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();
const conexao = require('../database/conexao'); // Importa a conexão automática que criamos acima

const app = express();

// Servir a pasta de uploads publicamente para downloads
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// ROTA: Buscar projetos pendentes
router.get("/pendentes", (req, res) => {
  // Alterado: p.creators_project foi substituído pelo GROUP_CONCAT dos nomes da tabela users
  const project_for_analyzis = `
    SELECT p.id_project, p.name_project, p.img_project, p.description_project, 
           p.archives_project, p.status_project,
           DATE_FORMAT(p.date_project, '%d/%m/%Y') AS date_project,
           GROUP_CONCAT(u.name_user SEPARATOR ', ') AS creators_project
    FROM project p
    INNER JOIN project_creators pc ON p.id_project = pc.project_id
    INNER JOIN users u ON pc.user_id = u.id_user
    WHERE p.status_project = 'enviado'
    GROUP BY p.id_project
  `;

  conexao.query(project_for_analyzis, function(err, results) {
    if (err) {
      console.log('Erro no banco de dados: ', err);
      return res.status(500).json({ erro: 'Erro interno ao buscar projetos' });
    }
    res.json(results);
  });
});

// ROTA: Cadastrar um novo projeto (Antigo app.post("/portal_aluno"))
router.post("/cadastrar", (req, res) => {

  // 1. Captura o ID do usuário logado
  const creators_id = req.session && req.session.usuario ? req.session.usuario.id : null;
  const creators_nome = req.session && req.session.usuario ? req.session.usuario.nome : "Aluno Logado";

  if (!creators_id) {
     return res.status(401).json({ mensagem: "Usuário não autenticado." });
  }

  // Verificar se arquivos chegaram
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({ mensagem: "Nenhum arquivo foi enviado." });
  }

  let name_project = req.body.newProjectTittle;
  let img_project = req.files.newProjectImg;
  let date_post = req.body.newProjectDate;
  let description_project = req.body.newProjectApresentation;
  let archives_project = req.files.newProjectArchives;
  let category_project = req.body.newProjectCategory || 'Geral'; 

  let creatorsIdsArray = [];
  try {
    if (req.body.creatorsIds) {
      creatorsIdsArray = JSON.parse(req.body.creatorsIds);
    }
  } catch (e) {
    return res.status(400).json({ mensagem: "Formato de IDs dos criadores inválido." });
  }

  if (!creatorsIdsArray.includes(creators_id)) {
    creatorsIdsArray.push(creators_id);
  }

  let name_creators = req.body.newProjecCreators || creators_nome;

  if (!img_project || !archives_project) {
    return res.status(400).json({ mensagem: "A imagem e os arquivos do projeto são obrigatórios." });
  }

  // BUSCA DINÂMICA: Descobrir a turma do aluno e quem é o professor responsável
  const queryDadosIniciais = `
    SELECT t.nome_turma, u.name_user AS nome_professor
    FROM users usr
    INNER JOIN turma t ON usr.turma_id = t.id_turma
    LEFT JOIN teacher te ON t.id_turma = te.turma_id
    LEFT JOIN users u ON te.user_id = u.id_user
    WHERE usr.id_user = ? LIMIT 1
  `;

  conexao.query(queryDadosIniciais, [creators_id], (errDados, resultDados) => {
    if (errDados || resultDados.length === 0) {
      console.error("Erro ao buscar dados de turma do aluno:", errDados);
      return res.status(500).json({ mensagem: "Erro ao validar perfil e turma do aluno." });
    }

    const nomeTurma = resultDados[0].nome_turma || "Não mapeada";
    const nomeProfessor = resultDados[0].nome_professor || "Sem orientador designado";

    // Tratamento e upload da Imagem
    let extension_img = path.extname(img_project.name);
    let img_name = uuidv4() + extension_img;
    let uploadPathImg = path.join(__dirname, "..", "..", "public", "uploads", img_name);

    img_project.mv(uploadPathImg, (err) => {
      if (err) {
        console.error("Erro ao salvar imagem:", err);
        return res.status(500).json({ mensagem: "Erro ao salvar a imagem do projeto." });
      }

      // Garantir que arquivos são um Array para salvar múltiplos
      let saved_archives_names = [];
      let archives_list = Array.isArray(archives_project) ? archives_project : [archives_project];
      let uploadErrors = false;

      for (let file of archives_list) {
        let extension_archive = path.extname(file.name);
        let archive_name = uuidv4() + extension_archive;
        saved_archives_names.push(archive_name);

        let uploadPathArchive = path.join(__dirname, "..", "..", "public", "uploads", archive_name);

        file.mv(uploadPathArchive, (err) => {
          if (err) {
            console.error("Erro ao salvar arquivo:", err);
            uploadErrors = true;
          }
        });
      }

      if (uploadErrors) {
        return res.status(500).json({ mensagem: "Erro ao salvar um ou mais arquivos do projeto." });
      }

      let archives_string_for_db = saved_archives_names.join(',');

      const new_project = `
          INSERT INTO project (name_project, img_project, creators_project, description_project, archives_project, category_project, class_project, teacher_project, status_project)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'enviado')`;

      conexao.query(new_project, [name_project, img_name, name_creators, description_project, archives_string_for_db, category_project, nomeTurma, nomeProfessor], (err, results) => {
        if (err) {
          console.log('Erro no banco de dados: ', err);
          return res.status(500).json({ mensagem: 'Erro ao salvar no banco de dados.' });
        }

        const novoProjetoId = results.insertId;

        // Cria as linhas de vinculo para cada criador selecionado
        const vinculos = creatorsIdsArray.map(idUser => [novoProjetoId, idUser]);
        const queryVinculo = `INSERT INTO project_creators (project_id, user_id) VALUES ?`;

        conexao.query(queryVinculo, [vinculos], (errVinculo) => {
          if (errVinculo) {
            console.error('Erro ao vincular criadores ao projeto:', errVinculo);
            return res.status(500).json({ mensagem: 'Projeto criado, mas houve erro ao associar os colaboradores.' });
          }
        
          return res.status(200).json({ mensagem: 'Projeto cadastrado com sucesso!' });
        });
      });
    });
  }); // Fechamento correto da queryDadosIniciais
});

// ROTA: Buscar projetos específicos do aluno logado (CORRIGIDA)
router.get("/my_projects", (req, res) => {
  const usuarioLogadoId = req.session && req.session.usuario ? req.session.usuario.id : null;

  if (!usuarioLogadoId) {
    return res.status(401).json({ mensagem: "Usuário não autenticado." });
  }

  // Alterado: Adicionado subquery ou GROUP_CONCAT para listar todos os participantes do projeto
  const queryMeusProjetos = `
    SELECT p.id_project, p.name_project, p.img_project, p.description_project, 
           p.archives_project, p.status_project, p.category_project, p.class_project, p.teacher_project,
           DATE_FORMAT(p.date_project, '%d/%m/%Y') AS date_project,
           (SELECT GROUP_CONCAT(u.name_user SEPARATOR ', ') 
            FROM project_creators pc2 
            INNER JOIN users u ON pc2.user_id = u.id_user 
            WHERE pc2.project_id = p.id_project) AS creators_project
    FROM project p
    INNER JOIN project_creators pc ON p.id_project = pc.project_id
    WHERE pc.user_id = ? 
    ORDER BY p.id_project DESC
  `;

  conexao.query(queryMeusProjetos, [usuarioLogadoId], function(err, results) {
    if (err) {
      console.error('Erro no banco de dados: ', err);
      return res.status(500).json({ erro: 'Erro interno ao buscar seus projetos' });
    }
    res.json(results);
  });
});

// ROTA: Salvar análise do professor e atualizar status do projeto (Aceito / Rejeitado)
router.put("/analisar/:id", (req, res) => {
  const id_project = req.params.id;
  const { analysis_text, teacher_name, status_project } = req.body;

  if (!analysis_text) {
    return res.status(400).json({ mensagem: "O texto da análise é obrigatório." });
  }

  const novoStatus = status_project || 'analisado';

  const queryAtualizar = `
    UPDATE project 
    SET alalysis_project = ?, teacher_project = ?, status_project = ? 
    WHERE id_project = ?
  `;

  conexao.query(queryAtualizar, [analysis_text, teacher_name || 'Professor', novoStatus, id_project], (err, results) => {
    if (err) {
      console.error('Erro ao atualizar análise no banco:', err);
      return res.status(500).json({ erro: 'Erro interno ao salvar análise.' });
    }
    
    if (results.affectedRows === 0) {
      return res.status(404).json({ mensagem: "Projeto não encontrado." });
    }

    res.json({ mensagem: `Projeto atualizado para '${novoStatus}' com sucesso!` });
  });
});

// ROTA: Buscar projetos já analisados
router.get("/analisados", (req, res) => {
  const queryAnalisados = `SELECT * FROM project WHERE status_project = 'analisado'`;

  conexao.query(queryAnalisados, function(err, results) {
    if (err) {
      console.error('Erro ao buscar projetos analisados:', err);
      return res.status(500).json({ erro: 'Erro interno ao buscar projetos' });
    }
    res.json(results);
  });
});

router.put("/aceitar_rejeitar/:id", (req, res) => {
  const id_project = req.params.id;
  const { status_project } = req.body;

  const novoStatus = status_project || 'analisado';

  const queryAtualizar = `
    UPDATE project 
    SET  status_project = ? 
    WHERE id_project = ?
  `;

  conexao.query(queryAtualizar, [novoStatus, id_project], (err, results) => {
    if (err) {
      console.error('Erro ao atualizar análise no banco:', err);
      return res.status(500).json({ erro: 'Erro interno ao salvar análise.' });
    }
    
    if (results.affectedRows === 0) {
      return res.status(404).json({ mensagem: "Projeto não encontrado." });
    }

    res.json({ mensagem: `Projeto atualizado para '${novoStatus}' com sucesso!` });
  });
});

// ROTA: Buscar dados consolidados e atividades recentes para a aba Início
router.get("/dashboard", (req, res) => {
  const creators_id = req.session && req.session.usuario ? req.session.usuario.id : null;

  if (!creators_id) {
    return res.status(401).json({ mensagem: "Usuário não autenticado." });
  }

  const queryTotal = `
    SELECT COUNT(*) AS total 
    FROM project_creators 
    WHERE user_id = ?
  `;
  
  const queryPendentes = `
    SELECT COUNT(*) AS total 
    FROM project p
    INNER JOIN project_creators pc ON p.id_project = pc.project_id
    WHERE pc.user_id = ? AND p.status_project IN ('enviado', 'analisado')
  `;
  
  const queryRecentes = `
    SELECT p.name_project, p.date_project, p.status_project, p.teacher_project 
    FROM project p
    INNER JOIN project_creators pc ON p.id_project = pc.project_id
    WHERE pc.user_id = ? 
    ORDER BY p.id_project DESC LIMIT 5
  `;

  conexao.query(queryTotal, [creators_id], (err, resTotal) => {
    if (err) return res.status(500).json({ erro: 'Erro ao contar total de projetos' });

    conexao.query(queryPendentes, [creators_id], (err, resPendentes) => {
      if (err) return res.status(500).json({ erro: 'Erro ao contar pendentes' });

      conexao.query(queryRecentes, [creators_id], (err, resRecentes) => {
        if (err) return res.status(500).json({ erro: 'Erro ao buscar atividades recentes' });

        const totalProjetos = resTotal[0].total;
        const totalPendentes = resPendentes[0].total;
        
        const atividades = resRecentes.map(proj => {
          let descricao = '';
          let tipo = 'criacao';

          if (proj.status_project === 'enviado') {
            descricao = `Você publicou o projeto <strong>"${proj.name_project}"</strong> e ele está aguardando a revisão do professor.`;
            tipo = 'criacao';
          } else if (proj.status_project === 'analisado') {
            descricao = `O professor <strong>${proj.teacher_project || 'Orientador'}</strong> adicionou uma análise ao projeto <strong>"${proj.name_project}"</strong> (Aguardando decisão do ADM).`;
            tipo = 'edicao'; 
          } else if (proj.status_project === 'aprovado') {
            descricao = `Parabéns! Seu projeto <strong>"${proj.name_project}"</strong> foi aprovado pelo administrador e está publicado.`;
            tipo = 'aprovado';
          } else if (proj.status_project === 'rejeitado') {
            descricao = `O projeto <strong>"${proj.name_project}"</strong> foi recusado pelo administrador. Verifique as correções.`;
            tipo = 'edicao';
          } else {
            descricao = `O projeto <strong>"${proj.name_project}"</strong> teve o status atualizado para de ${proj.status_project}.`;
            tipo = 'edicao';
          }

          const dataFormatada = new Date(proj.date_project).toLocaleDateString('pt-BR');

          return {
            tipo: tipo,
            descricao: descricao,
            tempo_passado: dataFormatada
          };
        });

        res.json({
          totalProjetos,
          totalPendentes,
          totalColaboracoes: totalProjetos, 
          atividades
        });
      });
    });
  });
});

module.exports = router;