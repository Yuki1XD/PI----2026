const express = require('express');
const path = require('path');
const router = express.Router();

const telasPath = path.join(__dirname, "..", "..", "public", "Telas");

// MIDDLEWARES DE PROTEÇÃO
// 1. Verifica se está logado como Aluno
function protegerAluno(req, res, next) {
    if (req.session.usuario && req.session.usuario.tipo === 'aluno') {
        return next(); // Autorizado, pode prosseguir
    }
    res.redirect('/login'); // Não autorizado, vai para o login
}

// 2. Verifica se está logado como Professor
function protegerProfessor(req, res, next) {
    if (req.session.usuario && req.session.usuario.tipo === 'professor') {
        return next();
    }
    res.redirect('/login');
}

// 3. Verifica se está logado como Admin
function protegerAdmin(req, res, next) {
    if (req.session.usuario && req.session.usuario.tipo === 'admin') {
        return next();
    }
    res.redirect('/login');
}

// --- ROTAS PÚBLICAS ---
router.get("/", (req, res) => res.sendFile(path.join(telasPath, "index.html")));
router.get("/projetos", (req, res) => res.sendFile(path.join(telasPath, "projetos_inicial.html")));
router.get("/categorias", (req, res) => res.sendFile(path.join(telasPath, "categorias_inicial.html")));
router.get("/sobre", (req, res) => res.sendFile(path.join(telasPath, "sobre_inicial.html")));
router.get("/login", (req, res) => res.sendFile(path.join(telasPath, "login.html")));
router.get("/cadastro", (req, res) => res.sendFile(path.join(telasPath, "criar_conta.html")));
router.get("/cadastro_aluno", (req, res) => res.sendFile(path.join(telasPath, "cadastro_aluno.html")));
router.get("/login_professor", (req, res) => res.sendFile(path.join(telasPath, "login_professor.html")));
router.get("/login_adm", (req, res) => res.sendFile(path.join(telasPath, "login_adm.html")));

// --- ROTAS PROTEGIDAS (Adicionamos o respectivo middleware antes do callback) ---
router.get("/portal_aluno", protegerAluno, (req, res) => {
    res.sendFile(path.join(telasPath, "portal_aluno.html"));
});

router.get("/portal_professor", protegerProfessor, (req, res) => {
    res.sendFile(path.join(telasPath, "portal_professor.html"));
});

router.get("/portal_admin", protegerAdmin, (req, res) => {
    res.sendFile(path.join(telasPath, "portal_admin.html"));
});

// Rota opcional para fazer Logout (limpar a sessão)
router.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

// ROTA: Buscar usuários por nome ou e-mail (Retorna apenas alunos para o vínculo)
router.get("/buscar_colaboradores", (req, res) => {
  const search = req.query.search;

  if (!search) {
    return res.status(400).json([]);
  }

  // Busca que filtra por parte do nome ou do e-mail, limitando a alunos
  const queryBusca = `
    SELECT id_user AS id, name_user AS nome, email_user AS email 
    FROM users 
    WHERE (name_user LIKE ? OR email_user LIKE ?) AND tipo = 'aluno'
    LIMIT 10
  `;

  const valorBusca = `%${search}%`;

  conexao.query(queryBusca, [valorBusca, valorBusca], (err, results) => {
    if (err) {
      console.error('Erro ao buscar usuários:', err);
      return res.status(500).json({ erro: 'Erro interno ao buscar usuários' });
    }
    res.json(results);
  });
});

module.exports = router;