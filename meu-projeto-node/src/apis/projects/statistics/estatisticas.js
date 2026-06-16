const express = require('express');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();
const conexao = require('../database/conexao'); // Nome correto da variável



router.get("/api/projects/statistics", (req, res) => {
    
    // 1. Conta o total de alunos ativos
    const queryUsuarios = "SELECT COUNT(*) AS total FROM users WHERE tipo = 'aluno'";
    
    // 2. Conta o total de projetos publicados
    const queryProjetos = "SELECT COUNT(*) AS total FROM project";
    
    // 3. Agrupa os projetos pelas categorias reais
    const queryCategorias = `
        SELECT category_project AS nome, COUNT(*) AS quantidade 
        FROM project 
        GROUP BY category_project
    `;

    // 🌟 CORRIGIDO: Alterado 'db.query' para 'conexao.query'
    conexao.query(queryUsuarios, (err, resultadosUsuarios) => {
        if (err) {
            console.error("Erro ao buscar usuários:", err);
            return res.status(500).json({ erro: "Erro ao buscar dados de usuários" });
        }

        conexao.query(queryProjetos, (err, resultadosProjetos) => {
            if (err) {
                console.error("Erro ao buscar projetos:", err);
                return res.status(500).json({ erro: "Erro ao buscar dados de projetos" });
            }

            conexao.query(queryCategorias, (err, resultadosCategorias) => {
                if (err) {
                    console.error("Erro ao buscar categorias:", err);
                    return res.status(500).json({ erro: "Erro ao buscar dados de categorias" });
                }

                // Captura os totais dos arrays de resultados do MySQL
                const totalAlunos = resultadosUsuarios[0].total;
                const totalProjetos = resultadosProjetos[0].total;

                // Cálculo de taxa de aprovação
                const taxaAprovacao = totalProjetos > 0 ? "100%" : "0%";

                // Envia a resposta limpa para o Front-end
                return res.json({
                    novosUsuarios: totalAlunos,      
                    projetosPublicados: totalProjetos, 
                    taxaAprovacao: taxaAprovacao,       
                    categorias: resultadosCategorias // Retorna o array de categorias [{nome: '...', quantidade: X}]
                });
            });
        });
    });
});

module.exports = router;
