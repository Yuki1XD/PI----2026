// apis/projetos.js
const express = require('express');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();
const conexao = require('../database/conexao'); // Importa a conexão automática que criamos acima

// ROTA: Buscar projetos pendentes (Antigo app.get("/apis/projetos/pendentes"))
// Como no index.js você usará app.use('/api/projetos', projetosApi), aqui o caminho vira apenas '/pendentes'
router.get("/pendentes", (req, res) => {
  const project_for_analyzis = `SELECT * FROM projeto WHERE status_project = 'enviado'`;

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
  // 1. Verifica se os arquivos de fato chegaram
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({ mensagem: "Nenhum arquivo foi enviado." });
  }

  let name_project = req.body.newProjectTittle;
  let img_project = req.files.newProjectImg;
  let name_creators = req.body.newProjecCreators;
  let date_post = req.body.newProjectDate;
  let description_project = req.body.newProjectApresentation;
  
  // Aqui pegamos os arquivos do acumulador do front-end
  let archives_project = req.files.newProjectArchives; 

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

  const new_project = `INSERT INTO projeto (name_project, img_project, creators_project, description_project, archives_project, status_project)
                       VALUES (?, ?, ?, ?, ?, 'enviado')`;

  conexao.query(new_project, [name_project, img_name, name_creators, description_project, archives_string_for_db], (err, results) => {
    if (err) {
      console.log('Erro no banco de dados: ', err);
      return res.status(500).json({ mensagem: 'Erro ao salvar no banco de dados.' });
    }
    return res.status(200).json({ mensagem: 'Projeto cadastrado com sucesso!' });
  });
});

module.exports = router;
