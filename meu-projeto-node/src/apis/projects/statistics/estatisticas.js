const express = require('express');
const router = express.Router();
const conexao = require('../database/conexao');

router.get("/api/projects/statistics", (req, res) => {
    
    // 1. Estatísticas de Usuários
    const queryUsuarios = `
        SELECT 
            COUNT(CASE WHEN tipo = 'aluno' AND status_user = 'ativo' THEN 1 END) AS ativos,
            COUNT(CASE WHEN status_user = 'inativo' THEN 1 END) AS desativados,
            COUNT(*) AS totalGeral
        FROM users
    `;
    
    // 2. Estatísticas de Projetos (Status e Totais)
    const queryProjetos = `
        SELECT 
            COUNT(*) AS total,
            COUNT(CASE WHEN status_project = 'aceito' THEN 1 END) AS aceitos,
            COUNT(CASE WHEN status_project = 'rejeitado' THEN 1 END) AS rejeitados
        FROM project
    `;
    
    // 3. Projetos agrupados por Categorias
    const queryCategorias = `
        SELECT IFNULL(category_project, 'Não informada') AS nome, COUNT(*) AS quantidade 
        FROM project 
        GROUP BY category_project
    `;

    // 4. Tags mais utilizadas (Exemplo considerando que você tenha um campo tags_project string separada por vírgula)
    // Se não tiver a coluna, a query retornará vazio sem quebrar o sistema.
    const queryTags = `
        SELECT tags_project FROM project WHERE tags_project IS NOT NULL AND tags_project != ''
    `;

    conexao.query(queryUsuarios, (err, resUsuarios) => {
        if (err) return res.status(500).json({ erro: "Erro ao buscar dados de usuários" });

        conexao.query(queryProjetos, (err, resProjetos) => {
            if (err) return res.status(500).json({ erro: "Erro ao buscar dados de projetos" });

            conexao.query(queryCategorias, (err, resCategorias) => {
                if (err) return res.status(500).json({ erro: "Erro ao buscar dados de categorias" });

                conexao.query(queryTags, (err, resTags) => {
                    // Se der erro nas tags (ex: coluna não existe), definimos um array vazio para não travar
                    let tagsIniciais = resTags || [];

                    const totalProjetos = resProjetos[0].total || 0;
                    const aceitos = resProjetos[0].aceitos || 0;
                    const rejeitados = resProjetos[0].rejeitados || 0;

                    // Cálculos de taxas percentuais
                    const taxaAprovacao = totalProjetos > 0 ? ((aceitos / totalProjetos) * 100).toFixed(1) + "%" : "0%";
                    const taxaRejeicao = totalProjetos > 0 ? ((rejeitados / totalProjetos) * 100).toFixed(1) + "%" : "0%";

                    // Processamento lógico de Tags (Separa strings por vírgula e conta a frequência)
                    let contagemTags = {};
                    tagsIniciais.forEach(row => {
                        // Verifica se o campo existe (pode se chamar tags_project ou similar)
                        const textoTags = row.tags_project || row.tags || "";
                        textoTags.split(',').forEach(tag => {
                            let t = tag.trim().toLowerCase();
                            if(t) contagemTags[t] = (contagemTags[t] || 0) + 1;
                        });
                    });

                    // Transforma o objeto de tags em um array ordenado das mais usadas
                    const listaTagsOrdenadas = Object.keys(contagemTags).map(tag => ({
                        nome: tag,
                        quantidade: contagemTags[tag]
                    })).sort((a, b) => b.quantidade - a.quantidade).slice(0, 5); // Pega as 5 principais

                    // Envia os dados completos unificados
                    return res.json({
                        // Aba Visão Geral / Usuários
                        novosUsuarios: resUsuarios[0].ativos, // Mantido a chave antiga para não quebrar o front básico
                        usuariosAtivos: resUsuarios[0].ativos,
                        usuariosDesativados: resUsuarios[0].desativados,
                        totalUsuarios: resUsuarios[0].totalGeral,
                        
                        // Aba Projetos
                        projetosPublicados: totalProjetos, 
                        projetosAceitos: aceitos,
                        projetosRejeitados: rejeitados,
                        taxaAprovacao: taxaAprovacao,       
                        taxaRejeicao: taxaRejeicao,

                        // Listas estruturadas
                        categorias: resCategorias,
                        tags: listaTagsOrdenadas
                    });
                });
            });
        });
    });
});

module.exports = router;
