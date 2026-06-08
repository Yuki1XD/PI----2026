// index.js
const express = require("express");
const path = require("path");
const fileUpload = require('express-fileupload');

// Importação das rotas organizadas
const viewsRouter = require('./apis/views');
const authApi = require('./apis/auth/auth');
const projetosApi = require('./apis/projects/projetos');

const app = express();

// Middlewares globais
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(fileUpload());
app.use(express.static(path.join(__dirname, "public")));

// Atribuição das rotas
app.use('/', viewsRouter); // Cuida de entregar os HTMLs
app.use('/apis/auth', authApi); // Cuida do login/cadastro
app.use('/apis/projects', projetosApi); // Cuida dos projetos e uploads

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    });
const { Pool } = require('pg');

