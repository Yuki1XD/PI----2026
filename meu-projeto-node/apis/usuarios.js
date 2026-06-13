const express = require('express'); 
const router = express.Router();    
const db = require('./database/db'); 

// Rota de cadastro de usuário aluno
router.post('/cadastrar', (req, res) => {
    const { nome, matricula, turma, email, senha } = req.body;
    
    
    const sql = "INSERT INTO usuarios (nome, matricula, turma, email, senha) VALUES (?, ?, ?, ?, ?)";
    
    db.query(sql, [nome, matricula, turma, email, senha], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ erro: "Erro no banco de dados" });
        }
        res.status(201).json({ mensagem: "Usuário cadastrado com sucesso!" });
    });
});

// Rota de cadastro de usuário professor
router.post('/cadastrar', (req, res) => {
    const { nome, matricula, turma, email, senha, tipo } = req.body;
    const tipoUsuario = tipo || 'aluno'; 

    const sql = "INSERT INTO usuarios (nome, matricula, turma, email, senha, tipo) VALUES (?, ?, ?, ?, ?, ?)";
    
    db.query(sql, [nome, matricula, turma, email, senha, tipoUsuario], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ erro: err.sqlMessage });
        }
        res.status(201).json({ mensagem: "Cadastrado com sucesso!" });
    });
});

module.exports = router;

// Rota de Login
router.post('/login', (req, res) => {
    const { email, senha } = req.body;

    const sql = "SELECT * FROM usuarios WHERE email = ? AND senha = ?";
    
    db.query(sql, [email, senha], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ erro: "Erro no servidor" });
        }

        if (results.length > 0) {
            const usuario = results[0];
            res.status(200).json({ 
                mensagem: "Login realizado!", 
                user: { id: usuario.id, nome: usuario.nome, tipo: usuario.tipo } 
            });
        } else {
            res.status(401).json({ erro: "E-mail ou senha incorretos" });
        }
    });
});


