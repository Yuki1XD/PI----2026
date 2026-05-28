const express = require("express");
const path = require("path");
const authApi = require('./apis/auth');
const projetosApi = require('./apis/projetos');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); 
app.use('/api/auth', authApi);
app.use('/api/projetos', projetosApi);


app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "Telas", "index.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "Telas", "Login.html"));
});

app.get("/cadastro", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "Telas", "Cadastro.html"));
});

app.get("/perfil", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "Telas", "Cadastro2.html"));
});

app.get("/portal_aluno", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "Telas", "portal_aluno.html"));
});

app.get("/portal_professor", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "Telas", "portal_professor.html"));
});

app.get("/portal_adimin", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "Telas", "portal_adimin.html"));
});

app.listen(3000, () => {
  console.log("Servidor rodando em: http://localhost:3000");
});
