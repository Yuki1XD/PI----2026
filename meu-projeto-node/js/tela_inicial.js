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