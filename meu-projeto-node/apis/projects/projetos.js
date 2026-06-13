// apis/projetos.js
const express = require('express');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();
const conexao = require('../database/conexao'); // Importa a conexão automática que criamos acima

const app = express();

// Servir a pasta de uploads publicamente para downloads
<<<<<<< HEAD
// Servir a pasta de uploads publicamente para downloads (Corrigido o caminho de pastas)
app.use('/uploads', express.static(path.join(__dirname, '..', '..', 'public', 'uploads')));
=======
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
>>>>>>> efd802116ee8446aad31fedaca1fa9fb08e21ebe

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

<<<<<<< HEAD
// ROTA: Cadastrar um novo projeto
router.post("/cadastrar", async (req, res) => { // Adicionado async

=======
// ROTA: Cadastrar um novo projeto (Antigo app.post("/portal_aluno"))
router.post("/cadastrar", (req, res) => {

  // 1. Captura o ID do usuário logado
>>>>>>> efd802116ee8446aad31fedaca1fa9fb08e21ebe
  const creators_id = req.session && req.session.usuario ? req.session.usuario.id : null;
  const creators_nome = req.session && req.session.usuario ? req.session.usuario.nome : "Aluno Logado";

  if (!creators_id) {
     return res.status(401).json({ mensagem: "Usuário não autenticado." });
  }

<<<<<<< HEAD
=======
  // Verificar se arquivos chegaram
>>>>>>> efd802116ee8446aad31fedaca1fa9fb08e21ebe
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({ mensagem: "Nenhum arquivo foi enviado." });
  }

  let name_project = req.body.newProjectTittle;
  let img_project = req.files.newProjectImg;
<<<<<<< HEAD
=======
  let date_post = req.body.newProjectDate;
>>>>>>> efd802116ee8446aad31fedaca1fa9fb08e21ebe
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

<<<<<<< HEAD
  conexao.query(queryDadosIniciais, [creators_id], async (errDados, resultDados) => {
=======
  conexao.query(queryDadosIniciais, [creators_id], (errDados, resultDados) => {
>>>>>>> efd802116ee8446aad31fedaca1fa9fb08e21ebe
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

<<<<<<< HEAD
    img_project.mv(uploadPathImg, async (err) => {
=======
    img_project.mv(uploadPathImg, (err) => {
>>>>>>> efd802116ee8446aad31fedaca1fa9fb08e21ebe
      if (err) {
        console.error("Erro ao salvar imagem:", err);
        return res.status(500).json({ mensagem: "Erro ao salvar a imagem do projeto." });
      }

<<<<<<< HEAD
      // CORREÇÃO: Tratando múltiplos arquivos com Promises
      let saved_archives_names = [];
      let archives_list = Array.isArray(archives_project) ? archives_project : [archives_project];
      
      try {
        const uploadPromises = archives_list.map(file => {
          let extension_archive = path.extname(file.name);
          let archive_name = uuidv4() + extension_archive;
          saved_archives_names.push(archive_name);
          let uploadPathArchive = path.join(__dirname, "..", "..", "public", "uploads", archive_name);
          
          return file.mv(uploadPathArchive); // Retorna a Promise do upload
        });

        await Promise.all(uploadPromises); // Espera TODOS os arquivos salvarem
      } catch (uploadErr) {
        console.error("Erro ao salvar arquivos:", uploadErr);
=======
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
>>>>>>> efd802116ee8446aad31fedaca1fa9fb08e21ebe
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
<<<<<<< HEAD
=======

        // Cria as linhas de vinculo para cada criador selecionado
>>>>>>> efd802116ee8446aad31fedaca1fa9fb08e21ebe
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
<<<<<<< HEAD
  });
});

// ROTA: Buscar projetos específicos do aluno logado (Modificada para retornar lista de criadores estruturada)
=======
  }); // Fechamento correto da queryDadosIniciais
});

// ROTA: Buscar projetos específicos do aluno logado (CORRIGIDA)
>>>>>>> efd802116ee8446aad31fedaca1fa9fb08e21ebe
router.get("/my_projects", (req, res) => {
  const usuarioLogadoId = req.session && req.session.usuario ? req.session.usuario.id : null;

  if (!usuarioLogadoId) {
    return res.status(401).json({ mensagem: "Usuário não autenticado." });
  }

<<<<<<< HEAD
=======
  // Alterado: Adicionado subquery ou GROUP_CONCAT para listar todos os participantes do projeto
>>>>>>> efd802116ee8446aad31fedaca1fa9fb08e21ebe
  const queryMeusProjetos = `
    SELECT p.id_project, p.name_project, p.img_project, p.description_project, 
           p.archives_project, p.status_project, p.category_project, p.class_project, p.teacher_project,
           DATE_FORMAT(p.date_project, '%d/%m/%Y') AS date_project,
           (SELECT GROUP_CONCAT(u.name_user SEPARATOR ', ') 
            FROM project_creators pc2 
            INNER JOIN users u ON pc2.user_id = u.id_user 
<<<<<<< HEAD
            WHERE pc2.project_id = p.id_project) AS creators_project,
           (SELECT JSON_ARRAYAGG(JSON_OBJECT('id', u.id_user, 'nome', u.name_user, 'email', u.email_user))
            FROM project_creators pc3
            INNER JOIN users u ON pc3.user_id = u.id_user
            WHERE pc3.project_id = p.id_project) AS creators_list_json
=======
            WHERE pc2.project_id = p.id_project) AS creators_project
>>>>>>> efd802116ee8446aad31fedaca1fa9fb08e21ebe
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
<<<<<<< HEAD
    
    // Converte a string de JSON que o MySQL retorna em objetos nativos JS
    results.forEach(proj => {
      if(proj.creators_list_json) {
        proj.creators_lista = typeof proj.creators_list_json === 'string' ? JSON.parse(proj.creators_list_json) : proj.creators_list_json;
      } else {
        proj.creators_lista = [];
      }
    });

=======
>>>>>>> efd802116ee8446aad31fedaca1fa9fb08e21ebe
    res.json(results);
  });
});

<<<<<<< HEAD
// ROTA CORRIGIDA: Atualizar características de um projeto existente
router.post("/atualizar", (req, res) => {
  const usuarioLogadoId = req.session && req.session.usuario ? req.session.usuario.id : null;
  if (!usuarioLogadoId) {
    return res.status(401).json({ mensagem: "Usuário não autenticado." });
  }

  const { id_project, editProjectName, editProjectDescription } = req.body;

  if (!id_project) {
    return res.status(400).json({ mensagem: "O ID do projeto é obrigatório para atualização." });
  }

  // 1. Parsear arrays enviados como JSON strings do front-end
  let creatorsIdsArray = [];
  let arquivosRemovidos = [];
  try {
    if (req.body.creatorsIds) creatorsIdsArray = JSON.parse(req.body.creatorsIds);
    if (req.body.arquivosRemovidos) arquivosRemovidos = JSON.parse(req.body.arquivosRemovidos);
  } catch (e) {
    return res.status(400).json({ mensagem: "Dados auxiliares corrompidos ou em formato inválido." });
  }

  // Garantir que o próprio usuário logado permaneça vinculado ao projeto
  if (!creatorsIdsArray.includes(usuarioLogadoId)) {
    creatorsIdsArray.push(usuarioLogadoId);
  }

  // 2. Buscar o estado atual do projeto no banco de dados para tratar arquivos antigos e imagens
  const queryBuscaAtual = `SELECT img_project, archives_project, category_project FROM project WHERE id_project = ?`;
  conexao.query(queryBuscaAtual, [id_project], (errBusca, resultBusca) => {
    if (errBusca || resultBusca.length === 0) {
      return res.status(404).json({ mensagem: "Projeto não encontrado para edição." });
    }

    const projetoOriginal = resultBusca[0];
    let img_final = projetoOriginal.img_project;
    
    // CORREÇÃO CRÍTICA 1: Como o select está disabled no HTML, o front não envia o valor.
    // Pegamos o valor que já estava salvo no banco de dados para não sobrescrever com 'Geral'.
    let category_final = projetoOriginal.category_project || 'Geral';

    // 3. Tratar upload de NOVA imagem de capa (se houver)
    if (req.files && req.files.newProjectImg) {
      let img_project = req.files.newProjectImg;
      let extension_img = path.extname(img_project.name);
      img_final = uuidv4() + extension_img;
      let uploadPathImg = path.join(__dirname, "..", "..", "public", "uploads", img_final);

      img_project.mv(uploadPathImg, (err) => {
        if (err) console.error("Erro ao substituir imagem:", err);
      });
    }

    // 4. Tratar Arquivos: Filtrar os mantidos + Adicionar os novos acumulados
    let arquivosMantidos = [];
    if (projetoOriginal.archives_project) {
      arquivosMantidos = projetoOriginal.archives_project.split(',').map(f => f.trim()).filter(Boolean);
      // Remove da lista os arquivos que o usuário clicou na lixeira da interface
      arquivosMantidos = arquivosMantidos.filter(arq => !arquivosRemovidos.includes(arq));
    }

    // CORREÇÃO CRÍTICA 2: Mapeamento dinâmico e seguro para múltiplos novos arquivos acumulados
    let novosArquivosSalvos = [];
    if (req.files && req.files.newProjectArchives) {
      let new_archives = req.files.newProjectArchives;
      // Garante que tratará como Array mesmo se vier um único arquivo isolado
      let archives_list = Array.isArray(new_archives) ? new_archives : [new_archives];

      for (let file of archives_list) {
        let extension_archive = path.extname(file.name);
        let archive_name = uuidv4() + extension_archive;
        novosArquivosSalvos.push(archive_name);

        let uploadPathArchive = path.join(__dirname, "..", "..", "public", "uploads", archive_name);
        file.mv(uploadPathArchive, (err) => {
          if (err) console.error("Erro ao gravar novo arquivo na edição:", err);
        });
      }
    }

    // Unifica o que restou do antigo com os uploads novos
    let listaArquivosFinal = [...arquivosMantidos, ...novosArquivosSalvos];
    if (listaArquivosFinal.length === 0) {
      return res.status(400).json({ mensagem: "O projeto não pode ficar sem nenhum arquivo anexado." });
    }
    let archives_string_for_db = listaArquivosFinal.join(',');

    // 5. Atualizar os dados principais na tabela 'project'
    // Status volta para 'enviado' para que o professor reanalise as alterações
    const queryUpdateProject = `
      UPDATE project 
      SET name_project = ?, img_project = ?, description_project = ?, archives_project = ?, category_project = ?, status_project = 'enviado'
      WHERE id_project = ?
    `;

    conexao.query(queryUpdateProject, [editProjectName, img_final, editProjectDescription, archives_string_for_db, category_final, id_project], (errUpdate) => {
      if (errUpdate) {
        console.error("Erro ao atualizar tabela de projetos:", errUpdate);
        return res.status(500).json({ mensagem: "Erro ao atualizar os dados do projeto no banco de dados." });
      }

      // 6. Sincronizar Relacionamento de Criadores (project_creators)
      // Remove vínculos antigos deste projeto específico e insere a nova grade atualizada
      const queryLimparCriadores = `DELETE FROM project_creators WHERE project_id = ?`;
      conexao.query(queryLimparCriadores, [id_project], (errLimpar) => {
        if (errLimpar) {
          return res.status(500).json({ mensagem: "Erro ao atualizar a lista de colaboradores." });
        }

        const novosVinculos = creatorsIdsArray.map(idUser => [id_project, idUser]);
        const queryReinserirCriadores = `INSERT INTO project_creators (project_id, user_id) VALUES ?`;

        conexao.query(queryReinserirCriadores, [novosVinculos], (errVinculos) => {
          if (errVinculos) {
            return res.status(500).json({ mensagem: "Projeto atualizado, mas falhou ao reassociar os colaboradores." });
          }

          return res.status(200).json({ mensagem: "Projeto atualizado com sucesso e enviado para nova análise!" });
        });
      });
    });
  });
});

=======
>>>>>>> efd802116ee8446aad31fedaca1fa9fb08e21ebe
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
<<<<<<< HEAD
    SET analysis_project = ?, teacher_project = ?, status_project = ? 
=======
    SET alalysis_project = ?, teacher_project = ?, status_project = ? 
>>>>>>> efd802116ee8446aad31fedaca1fa9fb08e21ebe
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

<<<<<<< HEAD
// ROTA CORRIGIDA: Buscar projetos prontos para a auditoria do Administrador (enviados e analisados)
router.get("/analisados", (req, res) => {
  const queryAnalisados = `
    SELECT 
        p.id_project, 
        p.name_project, 
        p.img_project, 
        p.description_project, 
        p.archives_project, 
        p.status_project, 
        p.category_project, 
        p.class_project, 
        p.teacher_project, 
        p.visibility_project, -- ADICIONADO AQUI
        p.analysis_project AS feedback_project, 
        DATE_FORMAT(p.date_project, '%Y-%m-%d') AS date_project,
        (SELECT GROUP_CONCAT(u.name_user SEPARATOR ', ') 
         FROM project_creators pc2 
         INNER JOIN users u ON pc2.user_id = u.id_user 
         WHERE pc2.project_id = p.id_project) AS creators_project
    FROM project p
    WHERE p.status_project IN ('enviado', 'analisado')
    ORDER BY p.id_project DESC
  `;

  conexao.query(queryAnalisados, function(err, results) {
    if (err) {
      console.error('Erro ao buscar projetos para o Admin:', err);
      return res.status(500).json({ erro: 'Erro interno ao buscar projetos no banco de dados.' });
=======
// ROTA: Buscar projetos já analisados
router.get("/analisados", (req, res) => {
  const queryAnalisados = `SELECT * FROM project WHERE status_project = 'analisado'`;

  conexao.query(queryAnalisados, function(err, results) {
    if (err) {
      console.error('Erro ao buscar projetos analisados:', err);
      return res.status(500).json({ erro: 'Erro interno ao buscar projetos' });
>>>>>>> efd802116ee8446aad31fedaca1fa9fb08e21ebe
    }
    res.json(results);
  });
});

<<<<<<< HEAD
// ROTA ATUALIZADA: Atualizar o status final, categoria e visibilidade do projeto via Painel Admin
router.put("/aceitar_rejeitar/:id", (req, res) => {
  const id_project = req.params.id;
  
  // Capturando as novas variáveis enviadas no corpo (body) da requisição
  const { status_project, category_project, visibility_project } = req.body;

  // Validação explícita de segurança de status para o escopo do administrador
  const statusPermitidos = ['aceito', 'rejeitado'];
  if (!statusPermitidos.includes(status_project)) {
    return res.status(400).json({ mensagem: "Status inválido fornecido para esta operação de auditoria." });
  }

  // Validação opcional para garantir valores padrões caso venham vazios
  const categoriaFinal = category_project || 'Geral';
  const visibilidadeFinal = visibility_project || 'privado';

  // Query atualizada para modificar também a categoria e a visibilidade no banco de dados
  const queryAtualizar = `
    UPDATE project 
    SET status_project = ?, 
        category_project = ?, 
        visibility_project = ? 
    WHERE id_project = ?
  `;

  conexao.query(queryAtualizar, [status_project, categoriaFinal, visibilidadeFinal, id_project], (err, results) => {
    if (err) {
      console.error('Erro ao atualizar dados do projeto no banco:', err);
      return res.status(500).json({ erro: 'Erro interno ao salvar atualização do administrador.' });
    }
    
    if (results.affectedRows === 0) {
      return res.status(404).json({ mensagem: "Projeto não localizado no sistema." });
    }

    const acao = status_project === 'aceito' ? 'aprovado e publicado' : 'recusado';
    res.json({ mensagem: `O projeto foi ${acao} com sucesso com a categoria "${categoriaFinal}" e modo "${visibilidadeFinal}"!` });
=======
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
>>>>>>> efd802116ee8446aad31fedaca1fa9fb08e21ebe
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
<<<<<<< HEAD
          } else if (proj.status_project === 'aceito') {
=======
          } else if (proj.status_project === 'aprovado') {
>>>>>>> efd802116ee8446aad31fedaca1fa9fb08e21ebe
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

<<<<<<< HEAD
// ROTA NOVA: Buscar ABSOLUTAMENTE TODOS os projetos (Para gerenciamento geral do Admin)
router.get("/", (req, res) => {
  const queryTodosOsProjetos = `
    SELECT 
        p.id_project, 
        p.name_project, 
        p.img_project, 
        p.description_project, 
        p.archives_project, 
        p.status_project, 
        p.category_project, 
        p.class_project, 
        p.teacher_project, 
        p.visibility_project,
        p.analysis_project,
        DATE_FORMAT(p.date_project, '%Y-%m-%d') AS date_project,
        (SELECT GROUP_CONCAT(u.name_user SEPARATOR ', ') 
         FROM project_creators pc2 
         INNER JOIN users u ON pc2.user_id = u.id_user 
         WHERE pc2.project_id = p.id_project) AS creators_project
    FROM project p
    ORDER BY p.id_project DESC
  `;

  conexao.query(queryTodosOsProjetos, function(err, results) {
    if (err) {
      console.error('Erro ao buscar todos os projetos para o Admin:', err);
      return res.status(500).json({ erro: 'Erro interno ao buscar projetos no banco de dados.' });
    }
    res.json(results);
  });
});

// =========================================================================
// ROTA DO DASHBOARD - DADOS CONSOLIDADOS E ATIVIDADES DO ADMINISTRADOR
// =========================================================================
router.get("/dashboard-inicio", (req, res) => {
  
  // 1. Queries de Contagem Estatística baseadas no seu Banco de Dados Real
  const queryAlunos = `SELECT COUNT(*) AS total FROM users WHERE tipo = 'aluno'`;
  const queryProfessores = `SELECT COUNT(*) AS total FROM users WHERE tipo = 'professor'`;
  const queryProjetos = `SELECT COUNT(*) AS total FROM project WHERE status_project = 'aceito'`;
  const queryPendentes = `SELECT COUNT(*) AS total FROM project WHERE status_project IN ('enviado', 'analisado')`;
  
  // 2. Query para buscar as últimas modificações de projetos no sistema para gerar o feed de atividades
  const queryProjetosRecentes = `
    SELECT name_project, date_project, status_project, teacher_project, creators_project 
    FROM project 
    ORDER BY id_project DESC 
    LIMIT 5
  `;

  // Executa o agrupamento de cheragas ao banco de dados
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

            // 3. Mapeando o histórico de projetos para criar o feed dinâmico do Admin
            const atividades = resRecentes.map(proj => {
              let descricao = "";
              let tipoActivity = "projeto"; // Padrão
              let statusActivity = "alerta"; // Padrão (bolinha laranja)

              // Adapta o texto e as cores das bolinhas com base no status real do projeto
              if (proj.status_project === 'enviado') {
                descricao = `Novo projeto submetido por <strong>${proj.creators_project}</strong>: "${proj.name_project}" (Aguardando professor).`;
                statusActivity = "alerta"; 
              } else if (proj.status_project === 'analisado') {
                descricao = `O professor <strong>${proj.teacher_project}</strong> revisou o projeto "${proj.name_project}" (Pronto para sua auditoria).`;
                statusActivity = "padrao"; // Bolinha azul
              } else if (proj.status_project === 'aceito') {
                descricao = `Projeto <strong>"${proj.name_project}"</strong> foi aprovado e publicado na plataforma.`;
                statusActivity = "sucesso"; // Bolinha verde
              } else if (proj.status_project === 'rejeitado') {
                descricao = `O projeto <strong>"${proj.name_project}"</strong> foi recusado na auditoria final.`;
                statusActivity = "alerta";
              }

              // Formata a data para exibir no front-end
              const dataFormatada = new Date(proj.date_project).toLocaleDateString('pt-BR');

              return {
                tipo: tipoActivity,
                status: statusActivity,
                descricao: descricao,
                tempo_passado: `Em ${dataFormatada}`
              };
            });

            // 4. Envia a resposta estruturada exatamente como o seu carregarDadosInicio() espera!
            return res.json({
              totalAlunos: resAlunos[0].total,
              totalProfessores: resProfessores[0].total,
              totalProjetos: resProjetos[0].total,
              totalPendentes: resPendentes[0].total,
              atividades: atividades
            });
          });
        });
      });
    });
  });
});

=======
>>>>>>> efd802116ee8446aad31fedaca1fa9fb08e21ebe
module.exports = router;