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
  secret: 'seu_segredo_super_seguro_aqui', 
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 60000 * 30 } // Sessão expira em 30 minutos
}));

// Servir arquivos estáticos da pasta public
app.use(express.static(path.join(__dirname, "public")));

// CORREÇÃO CRÍTICA: Expõe de forma global a pasta de uploads para o front-end achar as fotos/arquivos
app.use('/uploads', express.static(path.join(__dirname, "public", "uploads")));

// Atribuição das rotas
app.use('/', viewsRouter); 
app.use('/apis/auth', authApi); 
app.use('/apis/projects', projetosApi); 

app.use('/apis/users', authApi);

app.listen(3000, () => {
  console.log("Servidor rodando em: http://localhost:3000");
});