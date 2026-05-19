const express = require("express");
const path = require("path");

const app = express();


app.use(express.static(path.join(__dirname, "Telas")));
app.use(express.static(path.join(__dirname, "css")));
app.use("/imgs", express.static(path.join(__dirname, "imgs"))); 


app.get("/", (req, res) => {
  res.redirect("/tela_incial");
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "Telas", "Login.html"));
});

app.get("/cadastro", (req, res) => {
  res.sendFile(path.join(__dirname, "Telas", "Cadastro.html"));
});

app.get("/perfil", (req, res) => {
  res.sendFile(path.join(__dirname, "Telas", "Cadastro2.html"));
});

app.get("/tela_incial", (req, res) => {
  res.sendFile(path.join(__dirname, "Telas", "tela_incial.html"));
});

app.get("/aluno", (req, res) => {
  res.sendFile(path.join(__dirname, "Telas", "tela_incial_aluno.html"));
});

app.get("/criar_projeto", (req, res) => {
  res.sendFile(path.join(__dirname, "Telas", "Criar_Projeto.html"));
});


app.listen(3000, () => {
  console.log("Servidor rodando em: http://localhost:3000");
});