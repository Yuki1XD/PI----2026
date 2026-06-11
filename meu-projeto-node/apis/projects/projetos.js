// apis/projetos.js
const express = require('express');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();
const conexao = require('../database/conexao'); // Importa a conexão automática que criamos acima

const app = express()

// Servir a pasta de uploads publicamente para downloads
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// ROTA: Buscar projetos pendentes (Antigo app.get("/apis/projetos/pendentes"))
// Como no index.js você usará app.use('/api/projetos', projetosApi), aqui o caminho vira apenas '/pendentes'
router.get("/pendentes", (req, res) => {
  const project_for_analyzis = `SELECT id_project, name_project, img_project, creators_project, description_project, 
                                      archives_project, status_project,
                                      DATE_FORMAT(date_project, '%d/%m/%Y') AS date_project 
                                FROM project
                                WHERE status_project = 'enviado'`;

  conexao.query(project_for_analyzis, function(err, results) {
    if (err) {
      console.log('Erro no banco de dados: ', err);
      return res.status(500).json({ erro: 'Erro interno ao buscar projetos' });
    }
    res.json(results);
  });
});

// ROTA: Cadastrar um novo projeto (Antigo app.post("/portal_aluno"))
// Movido para cá para organizar a lógica de criação do projeto
router.post("/cadastrar", (req, res) => {

  // 1. Captura o ID do usuário logado (Assumindo que você usa express-session ou similar)
  // Caso envie temporariamente pelo corpo da requisição, mude para: const creators_id = req.body.userId;
  // Alterado de usuario.id_user para usuario.id
  const creators_id = req.session && req.session.usuario ? req.session.usuario.id : null;
  const creators_nome = req.session && req.session.usuario ? req.session.usuario.nome : "Aluno Logado";

  // Descomente esta validação quando o sistema de login estiver ativo:
  if (!creators_id) {
     return res.status(401).json({ mensagem: "Usuário não autenticado." });
  }

  // 1. Verifica se os arquivos de fato chegaram
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({ mensagem: "Nenhum arquivo foi enviado." });
  }

  let name_project = req.body.newProjectTittle;
  let img_project = req.files.newProjectImg;
  let date_post = req.body.newProjectDate;
  let description_project = req.body.newProjectApresentation;
  // Aqui pegamos os arquivos do acumulador do front-end
  let archives_project = req.files.newProjectArchives; 

  // Captura os IDs enviados pelo array dinâmico do front-end
  let creatorsIdsArray = [];
  try {
    if (req.body.creatorsIds) {
      creatorsIdsArray = JSON.parse(req.body.creatorsIds);
    }
  } catch (e) {
    return res.status(400).json({ mensagem: "Formato de IDs dos criadores inválido." });
  }

  // Garante que o criador que está logado e enviando também seja incluído no projeto obrigatoriamente
  if (!creatorsIdsArray.includes(creators_id)) {
    creatorsIdsArray.push(creators_id);
  }

  // Se o formulário não enviou nomes de texto, usamos o nome do usuário logado como o criador principal na tabela antiga
  let name_creators = req.body.newProjecCreators || creators_nome;

  if (!img_project || !archives_project) {
    return res.status(400).json({ mensagem: "A imagem e os arquivos do projeto são obrigatórios." });
  }

  // 2. CORREÇÃO DE CAMINHO: Subir dois níveis (__, "..", "..") para sair de apis/projects e achar a raiz
  let extension_img = path.extname(img_project.name);
  let img_name = uuidv4() + extension_img;
  let uploadPathImg = path.join(__dirname, "..", "..", "public", "uploads", img_name);

  img_project.mv(uploadPathImg, (err) => {
    if (err) {
      console.error("Erro ao salvar imagem:", err);
      return res.status(500).json({ mensagem: "Erro ao salvar a imagem do projeto." });
    }
  });

  // 3. CORREÇÃO DOS ARQUIVOS: Garantir que tratamos sempre como Array
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

  const new_project = `INSERT INTO project (name_project, img_project, creators_project, description_project, archives_project, status_project)
                       VALUES (?, ?, ?, ?, ?, 'enviado')`;

  conexao.query(new_project, [name_project, img_name, name_creators, description_project, archives_string_for_db], (err, results) => {
    if (err) {
      console.log('Erro no banco de dados: ', err);
      return res.status(500).json({ mensagem: 'Erro ao salvar no banco de dados.' });
    }

    const novoProjetoId = results.insertId;

    // 2. Cria as linhas de vinculo para cada criador selecionado
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

// ROTA: Buscar projetos específicos do aluno logado
router.get("/my_projects", (req, res) => {
  const usuarioLogadoId = req.session && req.session.usuario ? req.session.usuario.id : null;

  if (!usuarioLogadoId) {
    return res.status(401).json({ mensagem: "Usuário não autenticado." });
  }

  // Seleciona os projetos através da tabela associativa usando JOIN
  const queryMeusProjetos = `
    SELECT id_project, name_project, img_project, creators_project, description_project, 
        archives_project, status_project,
        DATE_FORMAT(date_project, '%d/%m/%Y') AS date_project 
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
  // Agora recebemos também o status escolhido pelo administrador
  const { analysis_text, teacher_name, status_project } = req.body;

  if (!analysis_text) {
    return res.status(400).json({ mensagem: "O texto da análise é obrigatório." });
  }

  // Define um status padrão caso não venha nenhum do front-end
  const novoStatus = status_project || 'analisado';

  // Atualiza a análise, o nome do professor e muda o status dinamicamente
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
  // Agora recebemos também o status escolhido pelo administrador
  const { analysis_text, teacher_name, status_project } = req.body;

  // Define um status padrão caso não venha nenhum do front-end
  const novoStatus = status_project || 'analisado';

  // Atualiza a análise, o nome do professor e muda o status dinamicamente
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

  // Query 1: Conta o total de projetos do aluno
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
        
        // Mapeia o histórico com as novas regras de mensagens
        const atividades = resRecentes.map(proj => {
          let descricao = '';
          let tipo = 'criacao';

          if (proj.status_project === 'enviado') {
            descricao = `Você publicou o projeto <strong>"${proj.name_project}"</strong> e ele está aguardando a revisão do professor.`;
            tipo = 'criacao';
          } else if (proj.status_project === 'analisado') {
            descricao = `O professor <strong>${proj.teacher_project || 'Orientador'}</strong> adicionou uma análise ao projeto <strong>"${proj.name_project}"</strong> (Aguardando decisão do ADM).`;
            tipo = 'edicao'; // Cor azul para destacar que mudou de estado
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
          totalColaboracoes: totalProjetos, // Agora todo projeto com múltiplos criadores conta aqui
          atividades
        });
      });
    });
  });
});

module.exports = router;