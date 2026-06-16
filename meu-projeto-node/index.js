const express = require("express");
const path = require("path");
const fileUpload = require('express-fileupload');
const session = require('express-session');

// Importação das rotas organizadas
const viewsRouter = require('./src/apis/views');
const authApi = require('./src/apis/auth/auth');
const projetosApi = require('./src/apis/projects/projetos');
// const usuariosApi = require('./src/apis/users/usuarios'); // Descomente quando criar este arquivo

const app = express();

// Middlewares globais
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(fileUpload());

// Configuração da Sessão
app.use(session({
  secret: 'seu_segredo_super_seguro_aqui', 
  resave: false,
  saveUninitialized: false,
  cookie: { 
    maxAge: 60000 * 30, // 30 minutos
    secure: false,      // Mude para true se usar HTTPS futuramente
    httpOnly: true      // Protege contra ataques XSS de leitura de cookie
  } 
}));

// Servir arquivos estáticos da pasta public
app.use(express.static(path.join(__dirname, "public")));

// Expõe a pasta de uploads globalmente para o front-end
app.use('/uploads', express.static(path.join(__dirname, "public", "uploads")));

// Atribuição das rotas
app.use('/', viewsRouter); 
app.use('/src/apis/auth', authApi); 
app.use('/src/apis/projects', projetosApi); 
// app.use('/src/apis/users', usuariosApi); // Mapeamento correto para a API de usuários

app.listen(3000, () => {
  console.log("Servidor rodando em: http://localhost:3000");
});