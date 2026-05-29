const express = require("express");
const path = require("path");
const authApi = require('./apis/auth');
const projetosApi = require('./apis/projetos');
const mysql = require('mysql2')

const app = express();

const conexao = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'observatorio'
})

conexao.connect(function(err) {
  if (err) throw err;
  console.log('Conexão com o banco de dados realizada!')
})

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({extended:false}))
app.use('/api/auth', authApi);
app.use('/api/projetos', projetosApi);


app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "Telas", "index.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "Telas", "Login.html"));
});

app.get("/cadastro", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "Telas", "criar_conta.html"));
});

app.get("/login_aluno", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "Telas", "login_aluno.html"));
});

app.post("/login_aluno", (req, res) => {

  let name_student = req.body.emailAluno
  let password_student = req.body.passwordAluno

  const select = `SELECT * FROM users WHERE email_user = ? AND password_user = ?`

  conexao.query(select, [name_student, password_student], (err, results) => {
    if (err) {
      console.log('Erro no banco de dados: ', err)
      return res.status(500).json({mensagem: 'Erro interno no servidor.'})
    }

    if (results.length > 0) {
      res.redirect('/portal_aluno')
    } else {
      return res.status(401).json({ mensagem: "E-mail ou senha incorretos." });
    }
  })

});

app.get("/login_professor", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "Telas", "login_professor.html"));
});

app.get("/login_adm", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "Telas", "login_adm.html"));
});

app.get("/portal_aluno", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "Telas", "portal_aluno.html"));
});

app.post("/portal_aluno", (req, res) => {

  let name_project = req.body.newProjectTittle
  let img_project = req.body.newProjectImg
  let name_creators = req.body.newProjecCreators 
  
});

app.get("/portal_professor", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "Telas", "portal_professor.html"));
});

app.get("/portal_admin", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "Telas", "portal_admin.html"));
});

app.listen(3000, () => {
  console.log("Servidor rodando em: http://localhost:3000");
});
