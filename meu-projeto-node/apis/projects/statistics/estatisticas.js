router.get("/api/projects/statistics", (req, res) => {
    
    // 1. Conta o total de alunos ativos (Filtrando pelo tipo 'aluno')
    const queryUsuarios = "SELECT COUNT(*) AS total FROM users WHERE tipo = 'aluno'";
    
    // 2. Conta o total de projetos publicados (Geral ou use um status específico se tiver, ex: WHERE status_project = 'Aprovado')
    const queryProjetos = "SELECT COUNT(*) AS total FROM project";
    
    // 3. Agrupa os projetos pelas categorias reais cadastradas no banco
    const queryCategorias = `
        SELECT category_project AS nome, COUNT(*) AS quantidade 
        FROM project 
        GROUP BY category_project
    `;

    // Executa a busca de Usuários/Alunos
    db.query(queryUsuarios, (err, resUsuarios) => {
        if (err) {
            console.error("Erro ao buscar usuários:", err);
            return res.status(500).json({ erro: "Erro ao buscar dados de usuários" });
        }

        // Executa a busca de Projetos
        db.query(queryProjetos, (err, resProjetos) => {
            if (err) {
                console.error("Erro ao buscar projetos:", err);
                return res.status(500).json({ erro: "Erro ao buscar dados de projetos" });
            }

            // Executa a contagem por Categoria
            db.query(queryCategorias, (err, resCategorias) => {
                if (err) {
                    console.error("Erro ao buscar categorias:", err);
                    return res.status(500).json({ erro: "Erro ao buscar dados de categorias" });
                }

                const totalAlunos = resUsuarios[0].total;
                const totalProjetos = resProjetos[0].total;

                // Cálculo simples para a taxa de aprovação baseada no seu HTML
                // Como não há dados complexos de rejeição explícita ainda, definimos uma taxa padrão ou dinâmica
                const taxaAprovacao = totalProjetos > 0 ? "100%" : "0%";

                // Envia a resposta mastigada para o Front-end
                res.json({
                    novosUsuarios: totalAlunos,      // Vai para o ID "num-usuarios"
                    projetosPublicados: totalProjetos, // Vai para o ID "num-projetos"
                    taxaAprovacao: taxaAprovacao,       // Vai para o ID "taxa-aprovacao"
                    categorias: resCategorias          // Vai renderizar a lista de barras de progresso
                });
            });
        });
    });
});