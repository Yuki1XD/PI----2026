const express = require("express");
const router = express.Router();

//teste: http://localhost:3000/api/auth/teste
router.get("/teste", (req, res) => {
  res.json({ message: "API de Autenticação conectada!" });
});


module.exports = router;