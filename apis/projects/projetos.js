const express = require('express');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();
const conexao = require('../database/conexao');

// Servir a pasta de uploads publicamente associada ao Router principal
router.use('/uploads', express.static(path.join(__dirname, '..', '..', 'public', 'uploads')));

// =========================================================================
// ROTA: Buscar projetos pendentes (Apenas status 'enviado') - CORRIGIDA
// =========================================================================
router.get("/pendentes", (req, res) => {
  const project_for_analyzis = `
    SELECT p.id_project, p.name_project, p.img_project, p.description_project, 
           p.archives_project, p.status_project, p.class_project, p.teacher_project,
           DATE_FORMAT(p.date_project, '%Y-%m-%d') AS date_project,
           p.creators_project AS creators_project
    FROM project p
    WHERE p.status_project = 'enviado'
    ORDER BY p.id_project DESC
  `;

  conexao.query(project_for_analyzis, function(err, results) {
    if (err) {
      console.error('Erro no banco de dados (Pendentes): ', err);
      return res.status(500).json({ erro: 'Erro interno ao buscar projetos pendentes.' });
    }
    res.json(results);
  });
});

// =========================================================================
// ROTA: Buscar projetos analisados pelo professor (Apenas status 'analisado') - CORRIGIDA
// =========================================================================
router.get("/analisados", (req, res) => {
  const queryAnalisados = `
    SELECT p.id_project, p.name_project, p.img_project, p.description_project, 
           p.archives_project, p.status_project, p.category_project, p.class_project, 
           p.teacher_project, p.visibility_project, p.analysis_project AS feedback_project, 
           DATE_FORMAT(p.date_project, '%Y-%m-%d') AS date_project,
           p.creators_project AS creators_project
    FROM project p
    WHERE p.status_project = 'analisado'
    ORDER BY p.id_project DESC
  `;

  conexao.query(queryAnalisados, function(err, results) {
    if (err) {
      console.error('Erro ao buscar projetos analisados:', err);
      return res.status(500).json({ erro: 'Erro interno ao buscar projetos no banco de dados.' });
    }
    res.json(results);
  });
});

// =========================================================================
// ROTA: Salvar análise do professor (Modifica status para 'analisado')
// =========================================================================
router.put("/analisar/:id", (req, res) => {
  const id_project = req.params.id;
  const { analysis_text, teacher_name, status_project } = req.body;

  if (!analysis_text || !analysis_text.trim()) {
    return res.status(400).json({ mensagem: "O texto da análise é obrigatório." });
  }

  const novoStatus = status_project || 'analisado';
  const queryAtualizar = `
    UPDATE project 
    SET analysis_project = ?, teacher_project = ?, status_project = ? 
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

// =========================================================================
// ROTA: Cadastrar um novo projeto
// =========================================================================
router.post("/cadastrar", (req, res) => {
  const creators_id = req.session && req.session.usuario ? req.session.usuario.id : null;
  const creators_nome = req.session && req.session.usuario ? req.session.usuario.nome : "Aluno Logado";

  if (!creators_id) {
     return res.status(401).json({ mensagem: "Usuário não autenticado." });
  }

  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({ mensagem: "Nenhum arquivo foi enviado." });
  }

  let name_project = req.body.newProjectTittle;
  let img_project = req.files.newProjectImg;
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

  const queryDadosIniciais = `
    SELECT t.nome_turma, u.name_user AS nome_professor
    FROM users usr
    INNER JOIN turma t ON usr.turma_id = t.id_turma
    LEFT JOIN teacher te ON t.id_turma = te.turma_id
    LEFT JOIN users u ON te.user_id = u.id_user
    WHERE usr.id_user = ? LIMIT 1
  `;

  conexao.query(queryDadosIniciais, [creators_id], async (errDados, resultDados) => {
    if (errDados || resultDados.length === 0) {
      console.error("Erro ao buscar dados de turma do aluno:", errDados);
      return res.status(500).json({ mensagem: "Erro ao validar perfil e turma do aluno." });
    }

    const nomeTurma = resultDados[0].nome_turma || "Não mapeada";
    const nomeProfessor = resultDados[0].nome_professor || "Sem orientador designado";

    try {
      // Upload Assíncrono da Imagem
      let extension_img = path.extname(img_project.name);
      let img_name = uuidv4() + extension_img;
      let uploadPathImg = path.join(__dirname, "..", "..", "public", "uploads", img_name);
      await img_project.mv(uploadPathImg);

      // Upload Assíncrono de Múltiplos Arquivos
      let saved_archives_names = [];
      let archives_list = Array.isArray(archives_project) ? archives_project : [archives_project];
      
      const uploadPromises = archives_list.map(file => {
        let extension_archive = path.extname(file.name);
        let archive_name = uuidv4() + extension_archive;
        saved_archives_names.push(archive_name);
        let uploadPathArchive = path.join(__dirname, "..", "..", "public", "uploads", archive_name);
        return file.mv(uploadPathArchive); 
      });

      await Promise.all(uploadPromises);
      let archives_string_for_db = saved_archives_names.join(',');

      const new_project = `
         INSERT INTO project (name_project, img_project, creators_project, description_project, archives_project, category_project, class_project, teacher_project, status_project)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'enviado')`;

      conexao.query(new_project, [name_project, img_name, name_creators, description_project, archives_string_for_db, category_project, nomeTurma, nomeProfessor], (err, results) => {
        if (err) {
          console.error('Erro no banco de dados: ', err);
          return res.status(500).json({ mensagem: 'Erro ao salvar no banco de dados.' });
        }

        const novoProjetoId = results.insertId;
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

    } catch (uploadErr) {
      console.error("Erro no processamento de uploads:", uploadErr);
      return res.status(500).json({ mensagem: "Erro ao salvar os arquivos de mídia do projeto." });
    }
  });
});

// =========================================================================
// AS DEMAIS ROTAS (my_projects, atualizar, aceitar_rejeitar, dashboard, timeline) 
// permanecem iguais ao seu arquivo original...
// =========================================================================

// ROTA: Buscar projetos específicos do aluno logado
router.get("/my_projects", (req, res) => {
  const usuarioLogadoId = req.session && req.session.usuario ? req.session.usuario.id : null;
  if (!usuarioLogadoId) return res.status(401).json({ mensagem: "Usuário não autenticado." });

  const queryMeusProjetos = `
    SELECT p.id_project, p.name_project, p.img_project, p.description_project, 
           p.archives_project, p.status_project, p.category_project, p.class_project, p.teacher_project,
           DATE_FORMAT(p.date_project, '%d/%m/%Y') AS date_project,
           (SELECT GROUP_CONCAT(u.name_user SEPARATOR ', ') FROM project_creators pc2 INNER JOIN users u ON pc2.user_id = u.id_user WHERE pc2.project_id = p.id_project) AS creators_project,
           (SELECT JSON_ARRAYAGG(JSON_OBJECT('id', u.id_user, 'nome', u.name_user, 'email', u.email_user)) FROM project_creators pc3 INNER JOIN users u ON pc3.user_id = u.id_user WHERE pc3.project_id = p.id_project) AS creators_list_json
    FROM project p
    INNER JOIN project_creators pc ON p.id_project = pc.project_id
    WHERE pc.user_id = ? 
    ORDER BY p.id_project DESC
  `;

  conexao.query(queryMeusProjetos, [usuarioLogadoId], function(err, results) {
    if (err) return res.status(500).json({ erro: 'Erro interno ao buscar seus projetos' });
    results.forEach(proj => {
      proj.creators_lista = proj.creators_list_json ? (typeof proj.creators_list_json === 'string' ? JSON.parse(proj.creators_list_json) : proj.creators_list_json) : [];
    });
    res.json(results);
  });
});

router.post("/atualizar", (req, res) => {
  const usuarioLogadoId = req.session && req.session.usuario ? req.session.usuario.id : null;
  if (!usuarioLogadoId) return res.status(401).json({ mensagem: "Usuário não autenticado." });

  const { id_project, editProjectName, editProjectDescription } = req.body;
  if (!id_project) return res.status(400).json({ mensagem: "O ID do projeto é obrigatório para atualização." });

  let creatorsIdsArray = [];
  let arquivosRemovidos = [];
  try {
    if (req.body.creatorsIds) creatorsIdsArray = JSON.parse(req.body.creatorsIds);
    if (req.body.arquivosRemovidos) arquivosRemovidos = JSON.parse(req.body.arquivosRemovidos);
  } catch (e) {
    return res.status(400).json({ mensagem: "Dados auxiliares inválidos." });
  }

  if (!creatorsIdsArray.includes(usuarioLogadoId)) creatorsIdsArray.push(usuarioLogadoId);

  conexao.query(`SELECT img_project, archives_project, category_project FROM project WHERE id_project = ?`, [id_project], async (errBusca, resultBusca) => {
    if (errBusca || resultBusca.length === 0) return res.status(404).json({ mensagem: "Projeto não encontrado para edição." });

    const projetoOriginal = resultBusca[0];
    let img_final = projetoOriginal.img_project;
    let category_final = projetoOriginal.category_project || 'Geral';

    try {
      if (req.files && req.files.newProjectImg) {
        let extension_img = path.extname(req.files.newProjectImg.name);
        img_final = uuidv4() + extension_img;
        await req.files.newProjectImg.mv(path.join(__dirname, "..", "..", "public", "uploads", img_final));
      }

      let arquivosMantidos = projetoOriginal.archives_project ? projetoOriginal.archives_project.split(',').map(f => f.trim()).filter(Boolean).filter(arq => !arquivosRemovidos.includes(arq)) : [];
      let novosArquivosSalvos = [];

      if (req.files && req.files.newProjectArchives) {
        let archives_list = Array.isArray(req.files.newProjectArchives) ? req.files.newProjectArchives : [req.files.newProjectArchives];
        const updatePromises = archives_list.map(file => {
          let name_file = uuidv4() + path.extname(file.name);
          novosArquivosSalvos.push(name_file);
          return file.mv(path.join(__dirname, "..", "..", "public", "uploads", name_file));
        });
        await Promise.all(updatePromises);
      }

      let listaArquivosFinal = [...arquivosMantidos, ...novosArquivosSalvos];
      if (listaArquivosFinal.length === 0) return res.status(400).json({ mensagem: "O projeto não pode ficar sem nenhum arquivo anexado." });

      const queryUpdateProject = `UPDATE project SET name_project = ?, img_project = ?, description_project = ?, archives_project = ?, category_project = ?, status_project = 'enviado' WHERE id_project = ?`;
      conexao.query(queryUpdateProject, [editProjectName, img_final, editProjectDescription, listaArquivosFinal.join(','), category_final, id_project], (errUpdate) => {
        if (errUpdate) return res.status(500).json({ mensagem: "Erro ao atualizar dados do projeto." });

        conexao.query(`DELETE FROM project_creators WHERE project_id = ?`, [id_project], (errLimpar) => {
          if (errLimpar) return res.status(500).json({ mensagem: "Erro ao atualizar colaboradores." });

          const novosVinculos = creatorsIdsArray.map(idUser => [id_project, idUser]);
          conexao.query(`INSERT INTO project_creators (project_id, user_id) VALUES ?`, [novosVinculos], (errVinculos) => {
            if (errVinculos) return res.status(500).json({ mensagem: "Falhou ao reassociar colaboradores." });
            return res.status(200).json({ mensagem: "Projeto atualizado com sucesso e enviado para nova análise!" });
          });
        });
      });
    } catch (errAsync) {
      return res.status(500).json({ mensagem: "Erro crítico no upload de novos arquivos." });
    }
  });
});

router.put("/aceitar_rejeitar/:id", (req, res) => {
  const id_project = req.params.id;
  const { status_project, category_project, visibility_project } = req.body;
  if (!['aceito', 'rejeitado'].includes(status_project)) return res.status(400).json({ mensagem: "Status inválido." });

  conexao.query(`UPDATE project SET status_project = ?, category_project = ?, visibility_project = ? WHERE id_project = ?`, [status_project, category_project || 'Geral', visibility_project || 'privado', id_project], (err, results) => {
    if (err) return res.status(500).json({ erro: 'Erro interno no servidor.' });
    res.json({ mensagem: `Projeto avaliado com sucesso!` });
  });
});

router.get("/dashboard", (req, res) => {
  const creators_id = req.session && req.session.usuario ? req.session.usuario.id : null;
  if (!creators_id) return res.status(401).json({ mensagem: "Usuário não autenticado." });

  conexao.query(`SELECT COUNT(*) AS total FROM project_creators WHERE user_id = ?`, [creators_id], (err, resTotal) => {
    if (err) return res.status(500).json({ erro: 'Erro ao contar total de projetos' });

    conexao.query(`SELECT COUNT(*) AS total FROM project p INNER JOIN project_creators pc ON p.id_project = pc.project_id WHERE pc.user_id = ? AND p.status_project IN ('enviado', 'analisado')`, [creators_id], (err, resPendentes) => {
      if (err) return res.status(500).json({ erro: 'Erro ao contar pendentes' });

      conexao.query(`SELECT p.name_project, p.date_project, p.status_project, p.teacher_project FROM project p INNER JOIN project_creators pc ON p.id_project = pc.project_id WHERE pc.user_id = ? ORDER BY p.id_project DESC LIMIT 5`, [creators_id], (err, resRecentes) => {
        if (err) return res.status(500).json({ erro: 'Erro ao buscar atividades recentes' });

        const atividades = resRecentes.map(proj => {
          let descricao = `O projeto "${proj.name_project}" teve o status atualizado para ${proj.status_project}.`;
          let tipo = 'edicao';
          if (proj.status_project === 'enviado') descricao = `Você publicou o projeto <strong>"${proj.name_project}"</strong> (Aguardando professor).`;
          if (proj.status_project === 'analisado') { descricao = `O professor <strong>${proj.teacher_project || 'Orientador'}</strong> adicionou uma análise ao projeto <strong>"${proj.name_project}"</strong>.`; tipo = 'edicao'; }
          if (proj.status_project === 'aceito') { descricao = `Parabéns! Seu projeto <strong>"${proj.name_project}"</strong> foi aprovado e publicado.`; tipo = 'aprovado'; }
          if (proj.status_project === 'rejeitado') descricao = `O projeto <strong>"${proj.name_project}"</strong> foi recusado pelo administrador.`;
          return { tipo, descricao, tempo_passado: new Date(proj.date_project).toLocaleDateString('pt-BR') };
        });

        res.json({ totalProjetos: resTotal[0].total, totalPendentes: resPendentes[0].total, totalColaboracoes: resTotal[0].total, atividades });
      });
    });
  });
});

router.get("/", (req, res) => {
  conexao.query(`SELECT p.id_project, p.name_project, p.img_project, p.description_project, p.archives_project, p.status_project, p.category_project, p.class_project, p.teacher_project, p.visibility_project, DATE_FORMAT(p.date_project, '%Y-%m-%d') AS date_project, (SELECT GROUP_CONCAT(u.name_user SEPARATOR ', ') FROM project_creators pc2 INNER JOIN users u ON pc2.user_id = u.id_user WHERE pc2.project_id = p.id_project) AS creators_project FROM project p WHERE p.visibility_project = 'publico' ORDER BY p.id_project DESC`, function(err, results) {
    if (err) return res.status(500).json({ erro: 'Erro interno ao buscar projetos públicos.' });
    res.json(results);
  });
});

router.get("/dashboard-inicio", (req, res) => {
  const queryAlunos = `SELECT COUNT(*) AS total FROM users WHERE tipo = 'aluno'`;
  const queryProfessores = `SELECT COUNT(*) AS total FROM users WHERE tipo = 'professor'`;
  const queryProjetos = `SELECT COUNT(*) AS total FROM project WHERE status_project = 'aceito' AND visibility_project = 'publico'`;
  const queryPendentes = `SELECT COUNT(*) AS total FROM project WHERE status_project IN ('enviado', 'analisado')`;
  const queryProjetosRecentes = `SELECT p.name_project, p.date_project, p.status_project, p.teacher_project, COALESCE((SELECT GROUP_CONCAT(u.name_user SEPARATOR ', ') FROM project_creators pc2 INNER JOIN users u ON pc2.user_id = u.id_user WHERE pc2.project_id = p.id_project), p.creators_project, 'Autor Desconhecido') AS creators_project FROM project p ORDER BY p.id_project DESC LIMIT 5`;

  conexao.query(queryAlunos, (err, resAlunos) => {
    if (err) return res.status(500).json({ mensagem: "Erro ao contar alunos." });
    conexao.query(queryProfessores, (err, resProfessores) => {
      if (err) return res.status(500).json({ mensagem: "Erro ao contar professores." });
      conexao.query(queryProjetos, (err, resProjetos) => {
        if (err) return res.status(500).json({ mensagem: "Erro ao contar projetos aprovados." });
        conexao.query(queryPendentes, (err, resPendentes) => {
          if (err) return res.status(500).json({ mensagem: "Erro ao contar projetos pendentes." });
          conexao.query(queryProjetosRecentes, (err, resRecentes) => {
            if (err) return res.status(500).json({ mensagem: "Erro ao buscar atividades recentes." });

            const atividades = resRecentes.map(proj => {
              let descricao = `Mudança no projeto "${proj.name_project}"`;
              let statusActivity = "orange";
              if (proj.status_project === 'enviado') descricao = `Novo projeto submetido por <strong>${proj.creators_project}</strong>: "${proj.name_project}".`;
              if (proj.status_project === 'analisado') { descricao = `O professor <strong>${proj.teacher_project || 'Orientador'}</strong> revisou o projeto "${proj.name_project}".`; statusActivity = "padrao"; }
              if (proj.status_project === 'aceito') { descricao = `Projeto <strong>"${proj.name_project}"</strong> foi aprovado e publicado.`; statusActivity = "sucesso"; }
              if (proj.status_project === 'rejeitado') descricao = `O projeto <strong>"${proj.name_project}"</strong> foi recusado na auditoria.`;
              return { tipo: "projeto", status: statusActivity, descricao, tempo_passado: `Em ${proj.date_project ? new Date(proj.date_project).toLocaleDateString('pt-BR') : 'Data Indefinida'}` };
            });

            return res.json({ totalAlunos: resAlunos[0].total || 0, totalProfessores: resProfessores[0].total || 0, totalProjetos: resProjetos[0].total || 0, totalPendentes: resPendentes[0].total || 0, atividades });
          });
        });
      });
    });
  });
});

module.exports = router;