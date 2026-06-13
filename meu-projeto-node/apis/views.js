const express = require('express');
const path = require('path');
const router = express.Router();

// 1. IMPORTANTE: Você precisa importar a sua conexão com o banco de dados aqui!
// Ajuste o caminho abaixo para onde está o seu arquivo de configuração do banco (ex: mysql/pg)
const conexao = require('./auth/auth'); // <-- OU o arquivo correto de conexão (ex: ../config/db)

// CORREÇÃO DO CAMINHO: Subindo 1 nível para achar a pasta public correta
const telasPath = path.join(__dirname, "..", "public", "Telas"); 

// MIDDLEWARES DE PROTEÇÃO
function protegerAluno(req, res, next) {
    if (req.session.usuario && req.session.usuario.tipo === 'aluno') {
        return next(); 
    }
    res.redirect('/login_aluno'); 
}

function protegerProfessor(req, res, next) {
    if (req.session.usuario && req.session.usuario.tipo === 'professor') {
        return next();
    }
    res.redirect('/login_professor');
}

function protegerAdmin(req, res, next) {
    if (req.session.usuario && req.session.usuario.tipo === 'admin') {
        return next();
    }
    res.redirect('/login_adm');
}

// --- ROTAS PÚBLICAS ---
router.get("/", (req, res) => res.sendFile(path.join(telasPath, "index.html")));
router.get("/login", (req, res) => res.sendFile(path.join(telasPath, "Login.html")));
router.get("/cadastro", (req, res) => res.sendFile(path.join(telasPath, "criar_conta.html")));
router.get("/login_aluno", (req, res) => res.sendFile(path.join(telasPath, "login_aluno.html")));
router.get("/login_professor", (req, res) => res.sendFile(path.join(telasPath, "login_professor.html")));
router.get("/login_adm", (req, res) => res.sendFile(path.join(telasPath, "login_adm.html")));

// --- ROTAS PROTEGIDAS ---
router.get("/portal_aluno", protegerAluno, (req, res) => {
    res.sendFile(path.join(telasPath, "portal_aluno.html"));
});

router.get("/portal_professor", protegerProfessor, (req, res) => {
    res.sendFile(path.join(telasPath, "portal_professor.html"));
});

router.get("/portal_admin", protegerAdmin, (req, res) => {
    res.sendFile(path.join(telasPath, "portal_admin.html"));
});

// Logout
router.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

// ROTA: Buscar usuários (Protegida contra travamentos por falta de 'conexao')
router.get("/buscar_colaboradores", (req, res) => {
  const search = req.query.search;

  if (!search) {
    return res.status(400).json([]);
  }

  const queryBusca = `
    SELECT id_user AS id, name_user AS nome, email_user AS email 
    FROM users 
    WHERE (name_user LIKE ? OR email_user LIKE ?) AND tipo = 'aluno'
    LIMIT 10
  `;

  const valorBusca = `%${search}%`;

  // Se você não importou a conexão ainda, este bloco try/catch evita que o Node trave a página
  try {
      conexao.query(queryBusca, [valorBusca, valorBusca], (err, results) => {
        if (err) {
          console.error('Erro ao buscar usuários:', err);
          return res.status(500).json({ erro: 'Erro interno ao buscar usuários' });
        }
        res.json(results);
      });
  } catch (error) {
      console.error("Erro crítico: A variável 'conexao' não está configurada neste arquivo.", error);
      res.status(500).json({ erro: "Erro de configuração no servidor." });
  }
});

module.exports = router;