// index.js
const express = require("express");
const path = require("path");
const fileUpload = require('express-fileupload');
const session = require('express-session');

// Importação das rotas organizadas
const viewsRouter = require('./apis/views');
const authApi = require('./apis/auth/auth');
const projetosApi = require('./apis/projects/projetos');

const app = express();

// Middlewares globais
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(fileUpload());

app.use(session({
  secret: 'seu_segredo_super_seguro_aqui', // Mude para uma string aleatória
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 60000 * 30 } // Sessão expira em 30 minutos
}));

app.use(express.static(path.join(__dirname, "public")));

// Atribuição das rotas
app.use('/', viewsRouter); // Cuida de entregar os HTMLs
app.use('/apis/auth', authApi); // Cuida do login/cadastro
app.use('/apis/projects', projetosApi); // Cuida dos projetos e uploads

app.listen(3000, () => {
  console.log("Servidor rodando em: http://localhost:3000");
});