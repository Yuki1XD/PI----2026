const express = require('express');
const router = express.Router();
const conexao = require('../database/conexao');

router.get("/api/projects/statistics", (req, res) => {
    // Captura o período enviado pelo Front-end (all, today, week, month)
    const periodo = req.query.period || 'all';
    
    // Filtros SQL padrão (1=1 traz tudo por padrão)
    let filtroUsuario = " WHERE 1=1 ";
    let filtroProjeto = " WHERE 1=1 ";

    // Aplica o filtro de tempo se as colunas forem 'created_at' ou 'data_criacao'
    if (periodo === 'today') {
        filtroUsuario += " AND DATE(created_at) = CURDATE() ";
        filtroProjeto += " AND DATE(created_at) = CURDATE() ";
    } else if (periodo === 'week') {
        filtroUsuario += " AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) ";
        filtroProjeto += " AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) ";
    } else if (periodo === 'month') {
        filtroUsuario += " AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) ";
        filtroProjeto += " AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) ";
    }

    // 1. Estatísticas de Usuários (Ativos, Inativos e Criados no período)
    const queryUsuarios = `
        SELECT 
            COUNT(CASE WHEN tipo = 'aluno' AND status_user = 'ativo' THEN 1 END) AS ativos,
            COUNT(CASE WHEN status_user = 'inativo' OR status_user = 'desativado' THEN 1 END) AS desativados,
            COUNT(*) AS totalGeral
        FROM users
        ${filtroUsuario}
    `;
    
    // 2. Estatísticas de Projetos (Criados, Aceitos e Rejeitados no período)
    const queryProjetos = `
        SELECT 
            COUNT(*) AS total,
            COUNT(CASE WHEN status_project = 'aceito' THEN 1 END) AS aceitos,
            COUNT(CASE WHEN status_project = 'rejeitado' THEN 1 END) AS rejeitados
        FROM project
        ${filtroProjeto}
    `;
    
    // 3. Categorias Populares filtradas por período
    const queryCategorias = `
        SELECT IFNULL(category_project, 'Não informada') AS nome, COUNT(*) AS quantidade 
        FROM project 
        ${filtroProjeto}
        GROUP BY category_project
    `;

    // 4. Tags mais usadas filtradas por período
    const queryTags = `
        SELECT tags_project FROM project 
        ${filtroProjeto} AND tags_project IS NOT NULL AND tags_project != ''
    `;

    conexao.query(queryUsuarios, (err, resUsuarios) => {
        if (err) return res.status(500).json({ erro: "Erro ao buscar dados de usuários" });

        conexao.query(queryProjetos, (err, resProjetos) => {
            if (err) return res.status(500).json({ erro: "Erro ao buscar dados de projetos" });

            conexao.query(containerCategorias => {}, queryCategorias, (err, resCategorias) => {
                if (err) return res.status(500).json({ erro: "Erro ao buscar dados de categorias" });

                conexao.query(queryTags, (err, resTags) => {
                    let tagsIniciais = resTags || [];
                    const totalProjetos = resProjetos[0].total || 0;
                    const aceitos = resProjetos[0].aceitos || 0;
                    const rejeitados = resProjetos[0].rejeitados || 0;

                    // Cálculo matemático das taxas percentuais
                    const taxaAprovacao = totalProjetos > 0 ? ((aceitos / totalProjetos) * 100).toFixed(1) + "%" : "0%";
                    const taxaRejeicao = totalProjetos > 0 ? ((rejeitados / totalProjetos) * 100).toFixed(1) + "%" : "0%";

                    // Processamento de Tags por vírgula
                    let contagemTags = {};
                    tagsIniciais.forEach(row => {
                        const textoTags = row.tags_project || "";
                        textoTags.split(',').forEach(tag => {
                            let t = tag.trim().toLowerCase();
                            if(t) contagemTags[t] = (contagemTags[t] || 0) + 1;
                        });
                    });

                    const listaTagsOrdenadas = Object.keys(contagemTags).map(tag => ({
                        nome: tag,
                        quantidade: contagemTags[tag]
                    })).sort((a, b) => b.quantidade - a.quantidade).slice(0, 5);

                    // Retorna resposta estruturada para o Front
                    return res.json({
                        usuariosAtivos: resUsuarios[0].ativos || 0,
                        usuariosDesativados: resUsuarios[0].desativados || 0,
                        totalUsuarios: resUsuarios[0].totalGeral || 0,
                        projetosPublicados: totalProjetos, 
                        projetosAceitos: aceitos,
                        projetosRejeitados: rejeitados,
                        taxaAprovacao: taxaAprovacao,       
                        taxaRejeicao: taxaRejeicao,
                        categorias: resCategorias,
                        tags: listaTagsOrdenadas
                    });
                });
            });
        });
    });
});

module.exports = router;
