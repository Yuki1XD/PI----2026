const express = require('express');
const router = express.Router();
const conexao = require('../database/conexao');
const path = require('path');
const fs = require('fs');

// Define o caminho da pasta de uploads baseada na estrutura do seu app.js (dentro de public)
const CAMINHO_UPLOADS = path.join(__dirname, '../../public/uploads');

// Garante que a pasta de uploads existe
if (!fs.existsSync(CAMINHO_UPLOADS)) {
  fs.mkdirSync(CAMINHO_UPLOADS, { recursive: true });
}

// =========================================================================
// ROTAS DE AUTENTICAÇÃO EXISTENTES (LOGIN / BUSCAR)
// =========================================================================

router.post("/login_aluno", (req, res) => {
  // .trim() limpa qualquer espaço invisível digitado no formulário
  let email_student = req.body.emailAluno ? req.body.emailAluno.trim() : '';
  let password_student = req.body.passwordAluno ? req.body.passwordAluno.trim() : '';

  console.log(`[Login] Tentativa com e-mail: ${email_student}`);

  // Query ajustada para validar apenas usuários que estão ativos no novo sistema
  const select = `SELECT id_user, email_user, tipo, name_user FROM users WHERE email_user = ? AND password_user = ? AND status_user = 'ativo'`;

  conexao.query(select, [email_student, password_student], (err, results) => {
    if (err) {
      console.error('Erro no banco de dados durante login: ', err);
      return res.status(500).json({ mensagem: 'Erro interno no servidor.' });
    }

    if (results.length > 0) {
      const usuario = results[0];

      req.session.usuario = {
        id: usuario.id_user,
        nome: usuario.name_user,
        tipo: usuario.tipo
      };

      let urlRedirecionamento = '/portal_aluno';

      if (usuario.tipo === 'professor') {
        urlRedirecionamento = '/portal_professor';
      } else if (usuario.tipo === 'admin') {
        urlRedirecionamento = '/portal_admin';
      }

      console.log(`[Login] Sucesso! Redirecionando ${usuario.name_user} para ${urlRedirecionamento}`);

      return res.status(200).json({
        sucesso: true,
        redirecionar: urlRedirecionamento
      });
    } else {
      console.log(`[Login] Falha: Credenciais incorretas para o e-mail ${email_student}`);
      return res.status(401).json({ sucesso: false, mensagem: "E-mail ou senha incorretos ou usuário inativo." });
    }
  });
});

router.get("/buscar", (req, res) => {
  const search = req.query.search;

  if (!search) {
    return res.status(400).json([]);
  }

  const queryBusca = `
    SELECT id_user AS id, name_user AS nome, email_user AS email 
    FROM users 
    WHERE (name_user LIKE ? OR email_user LIKE ?) AND tipo = 'aluno' AND status_user = 'ativo'
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

// =========================================================================
// ROTAS DO ADMINISTRADOR - GERENCIAMENTO DE USUÁRIOS
// =========================================================================

// 1. ROTA GET: Lista todos os usuários
router.get("/", (req, res) => {
  const query = `
    SELECT 
      id_user, 
      name_user, 
      email_user, 
      tipo AS role_user, 
      status_user, 
      avatar_user 
    FROM users 
    ORDER BY name_user ASC
  `;

  conexao.query(query, (err, results) => {
    if (err) {
      console.error("Erro ao listar usuários para o Admin:", err);
      return res.status(500).json({ mensagem: "Erro ao buscar dados dos usuários." });
    }
    return res.json(results);
  });
});

// 2. ROTA PUT: Atualiza as informações do usuário + FOTO
router.put("/atualizar/:id", (req, res) => {
  const idUsuario = req.params.id;
  const { name_user, email_user, role_user, status_user } = req.body;

  if (!name_user || !email_user || !role_user || !status_user) {
    return res.status(400).json({ mensagem: "Todos os campos editáveis precisam ser preenchidos." });
  }

  // Garante que a role vá para o ENUM do banco em letras minúsculas ('aluno', 'professor', 'admin')
  const roleTratada = role_user.toLowerCase().trim();

  // Verifica se uma nova foto foi enviada via express-fileupload
  if (req.files && req.files.avatar_user) {
    const arquivoAvatar = req.files.avatar_user;

    // Validação simples de tipo de arquivo
    if (!arquivoAvatar.mimetype.startsWith('image/')) {
      return res.status(400).json({ mensagem: "Apenas arquivos de imagem são permitidos." });
    }

    // Gera um nome único para a imagem
    const sufixoUnico = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extensao = path.extname(arquivoAvatar.name);
    const novoNomeAvatar = 'avatar-' + sufixoUnico + extensao;
    const caminhoDestino = path.join(CAMINHO_UPLOADS, novoNomeAvatar);

    // Busca a foto antiga para apagar e não acumular lixo no servidor
    const queryBuscaAntiga = `SELECT avatar_user FROM users WHERE id_user = ?`;
    conexao.query(queryBuscaAntiga, [idUsuario], (errAntigo, resultadosAntigos) => {
      if (!errAntigo && resultadosAntigos.length > 0 && resultadosAntigos[0].avatar_user) {
        const caminhoFotoAntiga = path.join(CAMINHO_UPLOADS, resultadosAntigos[0].avatar_user);
        if (fs.existsSync(caminhoFotoAntiga)) {
          fs.unlink(caminhoFotoAntiga, (err) => { if (err) console.log("Não pôde deletar foto antiga:", err); });
        }
      }

      // Move o novo arquivo para a pasta de uploads
      arquivoAvatar.mv(caminhoDestino, (errMv) => {
        if (errMv) {
          console.error("Erro ao mover arquivo de avatar:", errMv);
          return res.status(500).json({ mensagem: "Erro ao salvar a imagem no servidor." });
        }

        // Atualiza o banco com os dados e o novo nome do avatar
        const queryUpdateComFoto = `
              UPDATE users 
              SET name_user = ?, email_user = ?, tipo = ?, status_user = ?, avatar_user = ? 
              WHERE id_user = ?
            `;

        conexao.query(queryUpdateComFoto, [name_user.trim(), email_user.trim(), roleTratada, status_user, novoNomeAvatar, idUsuario], (err, result) => {
          if (err) {
            console.error("Erro ao atualizar usuário com foto no banco:", err);
            return res.status(500).json({ mensagem: "Falha interna ao salvar atualizações." });
          }
          return res.json({ mensagem: "Diretrizes e foto do usuário salvos com sucesso!" });
        });
      });
    });

  } else {
    // Se nenhuma foto nova foi enviada, mantém o avatar atual
    const queryUpdateSemFoto = `
      UPDATE users 
      SET name_user = ?, email_user = ?, tipo = ?, status_user = ? 
      WHERE id_user = ?
    `;

    conexao.query(queryUpdateSemFoto, [name_user.trim(), email_user.trim(), roleTratada, status_user, idUsuario], (err, result) => {
      if (err) {
        console.error("Erro ao atualizar usuário sem foto no banco:", err);
        return res.status(500).json({ mensagem: "Falha interna ao salvar atualizações." });
      }
      return res.json({ mensagem: "Diretrizes e dados salvos com sucesso!" });
    });
  }
});

// 3. ROTA DELETE: Remove o usuário (Limpa arquivo físico também)
router.delete("/deletar/:id", (req, res) => {
  const idUsuario = req.params.id;

  const queryBuscaFoto = `SELECT avatar_user FROM users WHERE id_user = ?`;
  conexao.query(queryBuscaFoto, [idUsuario], (err, results) => {
    if (!err && results.length > 0 && results[0].avatar_user) {
      const caminhoArquivo = path.join(CAMINHO_UPLOADS, results[0].avatar_user);
      if (fs.existsSync(caminhoArquivo)) {
        fs.unlinkSync(caminhoArquivo);
      }
    }

    const queryDelete = `DELETE FROM users WHERE id_user = ?`;
    conexao.query(queryDelete, [idUsuario], (errDelete, result) => {
      if (errDelete) {
        console.error("Erro ao deletar usuário:", errDelete);
        return res.status(500).json({ mensagem: "Erro ao processar exclusão no banco de dados." });
      }
      return res.json({ mensagem: "Usuário e dados deletados com sucesso!" });
    });
  });
});

// =========================================================================
// ROTA PARA BUSCAR PERFIL DO PROFESSOR LOGADO
// =========================================================================
router.get("/profile", (req, res) => {
  if (!req.session || !req.session.usuario) {
    return res.status(401).json({ mensagem: "Não autorizado. Faça login novamente." });
  }

  const idUsuarioLogado = req.session.usuario.id;

  const queryPerfil = `
    SELECT 
      u.name_user AS name_teacher, 
      u.email_user AS email_teacher, 
      u.tipo AS role_user,
      u.avatar_user AS img_teacher,
      t.function_teacher AS function_teacher
    FROM users u
    LEFT JOIN teacher t ON u.id_user = t.user_id
    WHERE u.id_user = ?
  `;

  conexao.query(queryPerfil, [idUsuarioLogado], (err, results) => {
    if (err) {
      console.error("Erro ao buscar perfil do professor:", err);
      return res.status(500).json({ mensagem: "Erro interno ao buscar perfil." });
    }

    if (results.length === 0) {
      return res.status(404).json({ mensagem: "Professor não encontrado." });
    }

    return res.json(results[0]);
  });
});

// =========================================================================
// ROTA PARA ALTERAR APENAS A SENHA DO PROFESSOR LOGADO
// =========================================================================
router.put("/change-password", (req, res) => {
  if (!req.session || !req.session.usuario) {
    return res.status(401).json({ mensagem: "Não autorizado. Faça login novamente." });
  }

  const idUsuarioLogado = req.session.usuario.id;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ mensagem: "Todos os campos de senha são obrigatórios." });
  }

  const queryVerificaSenha = `SELECT password_user FROM users WHERE id_user = ?`;

  conexao.query(queryVerificaSenha, [idUsuarioLogado], (err, results) => {
    if (err) {
      console.error("Erro ao verificar senha atual:", err);
      return res.status(500).json({ mensagem: "Erro interno no servidor." });
    }

    if (results.length === 0) {
      return res.status(404).json({ mensagem: "Usuário não encontrado." });
    }

    const senhaBanco = results[0].password_user;

    if (currentPassword.trim() !== senhaBanco) {
      return res.status(401).json({ mensagem: "A senha atual digitada está incorreta." });
    }

    const queryAtualizaSenha = `UPDATE users SET password_user = ? WHERE id_user = ?`;

    conexao.query(queryAtualizaSenha, [newPassword.trim(), idUsuarioLogado], (errUpdate, resultUpdate) => {
      if (errUpdate) {
        console.error("Erro ao atualizar nova senha:", errUpdate);
        return res.status(500).json({ mensagem: "Falha ao atualizar a senha no banco de dados." });
      }

      return res.json({ sucesso: true, mensagem: "Senha atualizada com sucesso!" });
    });
  });
});

module.exports = router;