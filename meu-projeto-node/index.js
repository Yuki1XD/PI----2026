const express = require("express");
const path = require("path");

const app = express();

// Servir arquivos estáticos (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, "Telas")));
app.use(express.static(path.join(__dirname, "css")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "Telas", "Cadastro.html"));
});

app.listen(3000, () => {
  console.log("http://localhost:3000");
});