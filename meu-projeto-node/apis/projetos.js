const express = require('express');
const router = express.Router();
const db = require('./database/db');

// Rota para cadastrar projeto
router.post('/criar', (req, res) => {
    const { titulo, descricao, usuario_id } = req.body;

    const sql = "INSERT INTO projetos (titulo, descricao, usuario_id) VALUES (?, ?, ?)";
    
    db.query(sql, [titulo, descricao, usuario_id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ erro: "Erro ao salvar projeto" });
        }
        res.status(201).json({ mensagem: "Projeto criado!", id: result.insertId });
    });
});




// Rota de busca: http://localhost:3000/api/projetos/busca?q=projeto
router.get("/busca", (req, res) => {
    const termoBusca = req.query.q; 
    if (!termoBusca) {
        return res.json([]); 
    }

    
    const sql = "SELECT * FROM projetos WHERE titulo LIKE ? OR descricao LIKE ?";
    const valor = `%${termoBusca}%`;

    db.query(sql, [valor, valor], (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Erro na busca" });
        }
        res.json(results);
    });
});

module.exports = router;