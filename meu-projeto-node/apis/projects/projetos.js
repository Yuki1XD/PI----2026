const express = require("express");
const router = express.Router();

// teste: http://localhost:3000/api/projects/projetos/teste
router.get("/teste", (req, res) => {
  res.json({ message: "API de Projetos conectada!" });
});


module.exports = router;