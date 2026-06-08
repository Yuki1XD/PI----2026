// apis/views.js
const express = require('express');
const path = require('path');
const router = express.Router();

const telasPath = path.join(__dirname, "..", "public", "Telas");

router.get("/", (req, res) => res.sendFile(path.join(telasPath, "index.html")));
router.get("/login", (req, res) => res.sendFile(path.join(telasPath, "Login.html")));
router.get("/cadastro", (req, res) => res.sendFile(path.join(telasPath, "criar_conta.html")));
router.get("/login_aluno", (req, res) => res.sendFile(path.join(telasPath, "login_aluno.html")));
router.get("/login_professor", (req, res) => res.sendFile(path.join(telasPath, "login_professor.html")));
router.get("/login_adm", (req, res) => res.sendFile(path.join(telasPath, "login_adm.html")));
router.get("/portal_aluno", (req, res) => res.sendFile(path.join(telasPath, "portal_aluno.html")));
router.get("/portal_professor", (req, res) => res.sendFile(path.join(telasPath, "portal_professor.html")));
router.get("/portal_admin", (req, res) => res.sendFile(path.join(telasPath, "portal_admin.html")));

module.exports = router;
