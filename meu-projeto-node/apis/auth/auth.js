const express = require('express');
const router = express.Router();
const conexao = require('../database/conexao'); 

router.post("/login_aluno", (req, res) => {
  let name_student = req.body.emailAluno;
  let password_student = req.body.passwordAluno;

  // Buscamos o usuário correspondente
  const select = `SELECT id_user, email_user, tipo, name_user FROM users WHERE email_user = ? AND password_user = ?`;

  conexao.query(select, [name_student, password_student], (err, results) => {
    if (err) {
      console.log('Erro no banco de dados: ', err);
      return res.status(500).json({ mensagem: 'Erro interno no servidor.' });
    }

    // Se encontrou o usuário
    if (results.length > 0) {
      const usuario = results[0]; // Pega o primeiro resultado encontrado
      
      // SALVA O USUÁRIO NA SESSÃO (Aqui dentro do callback, onde 'usuario' existe!)
      req.session.usuario = {
          id: usuario.id_user,
          nome: usuario.name_user,
          tipo: usuario.tipo 
      };

      // Verifica a função (tipo) e define o destino
      let urlRedirecionamento = '/portal_aluno'; // padrão
      
      if (usuario.tipo === 'professor') {
        urlRedirecionamento = '/portal_professor';
      } else if (usuario.tipo === 'admin') {
        urlRedirecionamento = '/portal_admin';
      }

      // Retornamos um único JSON confirmando o sucesso e indicando para onde ir
      return res.status(200).json({ 
        sucesso: true, 
        redirecionar: urlRedirecionamento 
      });

    } else {
      // Se não encontrou, o login falhou
      return res.status(401).json({ sucesso: false, mensagem: "E-mail ou senha incorretos." });
    }
  });
});

// No arquivo de rotas de login/usuários (o segundo arquivo que você mandou)
// Cole este bloco antes do module.exports = router;

router.get("/buscar", (req, res) => {
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

  conexao.query(queryBusca, [valorBusca, valorBusca], (err, results) => {
    if (err) {
      console.error('Erro ao buscar usuários:', err);
      return res.status(500).json({ erro: 'Erro interno ao buscar usuários' });
    }
    res.json(results);
  });
});

module.exports = router;