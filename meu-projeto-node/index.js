// 1. ADICIONE ESSA LINHA COMO A PRIMEIRA DE TUDO NO ARQUIVO!
require('dotenv').config(); 

const express = require("express");
const path = require("path");
const fileUpload = require('express-fileupload');
const session = require('express-session');
const cors = require('cors'); // Importado para evitar o erro de CORS no front

// Importação das rotas organizadas
const viewsRouter = require('./src/apis/views');
const authApi = require('./src/apis/auth/auth');
const projetosApi = require('./src/apis/projects/projetos');

const app = express();

// Middlewares globais
app.use(cors()); // Ativa o CORS antes das rotas
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(fileUpload());

// Configuração da Sessão
app.use(session({
  secret: process.env.SESSION_SECRET || 'seu_segredo_super_seguro_aqui', 
  resave: false,
  saveUninitialized: false,
  cookie: { 
    maxAge: 60000 * 30, // 30 minutos
    secure: false,      
    httpOnly: true      
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

// 2. CONFIGURAÇÃO DA PORTA DINÂMICA (Essencial para o Render)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Local: http://localhost:${PORT}`);
});