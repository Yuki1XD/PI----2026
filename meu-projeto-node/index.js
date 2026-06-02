const express = require("express");
const path = require("path");
const mysql = require('mysql2');
const fileUpload = require('express-fileupload');
const { v4: uuidv4 } = require('uuid');

// Tenta carregar as rotas externas de forma segura
let authApi, projetosApi;
try {
  authApi = require('./apis/auth');
  projetosApi = require('./apis/projetos');
} catch (e) {
  console.log("⚠️ Atenção: Não foi possível carregar os arquivos da pasta './apis/'. Verifique se eles existem.");
}

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));
app.use(fileUpload());

if (authApi) app.use('/api/auth', authApi);
if (projetosApi) app.use('/api/projetos', projetosApi);

// ==========================================
// CONEXÃO COM O BANCO DE DADOS & START DO SERVIDOR
// ==========================================
const conexao = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: '1234'
});

conexao.connect(function(err) {
  if (err) {
    console.error('Erro ao conectar no MySQL:', err);
    return;
  }
  console.log('✅ Conectado ao servidor MySQL!');

  conexao.query("CREATE DATABASE IF NOT EXISTS observatorio", function (err) {
    if (err) throw err;
    console.log("✅ Banco de dados 'observatorio' verificado/criado.");

    conexao.changeUser({ database: 'observatorio' }, function (err) {
      if (err) throw err;

      // Cria a tabela de usuários
      const tabelaUsers = `
        CREATE TABLE IF NOT EXISTS users (
          id_user INT AUTO_INCREMENT PRIMARY KEY,
          email_user VARCHAR(255) NOT NULL,
          password_user VARCHAR(255) NOT NULL
        );`;
      
      conexao.query(tabelaUsers, function (err) {
        if (err) throw err;
      });

      // Cria a tabela de projetos
      const tabelaProjeto = `
        CREATE TABLE IF NOT EXISTS projeto (
          id_project INT AUTO_INCREMENT PRIMARY KEY,
          name_project VARCHAR(255),
          img_project VARCHAR(255),
          creators_project VARCHAR(255),
          date_project VARCHAR(255),
          description_project TEXT,
          archives_project TEXT,
          status_project VARCHAR(50) DEFAULT 'enviado'
        );`;

      conexao.query(tabelaProjeto, function (err) {
        if (err) throw err;
        console.log('✅ Conexão com o banco realizada e tabelas prontas!');
        
        // 🚀 O SERVIDOR SÓ LIGA AGORA, DEPOIS QUE O BANCO ESTÁ 100% PRONTO
        app.listen(3000, () => {
          console.log("🚀 SERVIDOR ONLINE! Acesse em: http://localhost:3000");
        });
      });
    });
  });
});

// ==========================================
// ROTAS DO SEU SITE
// ==========================================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "Telas", "index.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "Telas", "Login.html"));
});

app.get("/cadastro", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "Telas", "criar_conta.html"));
});

app.get("/login_aluno", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "Telas", "login_aluno.html"));
});

app.post("/login_aluno", (req, res) => {
  let name_student = req.body.emailAluno;
  let password_student = req.body.passwordAluno;

  const select = `SELECT * FROM users WHERE email_user = ? AND password_user = ?`;

  conexao.query(select, [name_student, password_student], (err, results) => {
    if (err) {
      console.log('Erro no banco de dados: ', err);
      return res.status(500).json({ mensagem: 'Erro interno no servidor.' });
    }

    if (results.length > 0) {
      res.redirect('/portal_aluno');
    } else {
      return res.status(401).json({ mensagem: "E-mail ou senha incorretos." });
    }
  });
});

app.get("/login_professor", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "Telas", "login_professor.html"));
});

app.get("/login_adm", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "Telas", "login_adm.html"));
});

app.get("/portal_aluno", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "Telas", "portal_aluno.html"));
});

app.post("/portal_aluno", (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({ mensagem: "Nenhum arquivo foi enviado." });
  }

  let name_project = req.body.newProjectTittle;
  let img_project = req.files.newProjectImg;
  let name_creators = req.body.newProjecCreators;
  let date_post = req.body.newProjectDate;
  let description_project = req.body.newProjectApresentation;
  let archives_project = req.files.newProjectArchives;

  if (!img_project || !archives_project) {
    return res.status(400).json({ mensagem: "A imagem e os arquivos do projeto são obrigatórios." });
  }

  let extension_img = path.extname(img_project.name);
  let img_name = uuidv4() + extension_img;

  img_project.mv(path.join(__dirname, "public", "uploads", img_name), (err) => {
    if (err) return res.status(500).send(err);
  });

  let saved_archives_names = [];
  let archives_list = Array.isArray(archives_project) ? archives_project : [archives_project];

  for (let file of archives_list) {
    let extension_archive = path.extname(file.name);
    let archive_name = uuidv4() + extension_archive;

    saved_archives_names.push(archive_name);

    file.mv(path.join(__dirname, "public", "uploads", archive_name), (err) => {
      if (err) return res.status(500).send(err);
    });
  }

  let archives_string_for_db = saved_archives_names.join(',');

  const new_project = `INSERT INTO projeto (name_project, img_project, creators_project, date_project, description_project, archives_project, status_project)
  values (?, ?, ?, ?, ?, ?, 'enviado')`;

  conexao.query(new_project, [name_project, img_name, name_creators, date_post, description_project, archives_string_for_db], (err, results) => {
    if (err) {
      console.log('Erro no banco de dados: ', err);
    }
    return res.status(200).json({ mensagem: 'Projeto Cadastrado com sucesso' });
  });
});

app.get("/portal_professor", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "Telas", "portal_professor.html"));
});

app.get("/apis/projetos/pendentes", (req, res) => {
  const project_for_analyzis = `SELECT * FROM projeto WHERE status_project = 'enviado'`;

  conexao.query(project_for_analyzis, function(err, results) {
    if (err) {
      console.log('Erro no banco de dados: ', err);
      return res.status(500).json({ erro: 'Erro interno ao buscar projetos' });
    }
    res.json(results);
  });
});

app.get("/portal_admin", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "Telas", "portal_admin.html"));
});