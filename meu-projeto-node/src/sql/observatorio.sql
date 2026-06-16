-- Active: 1779450411689@@127.0.0.1@3306
CREATE DATABASE IF NOT EXISTS observatorio;
USE observatorio;

-- 1. Cria a tabela de Turmas (precisa vir antes de users e teachers)
CREATE TABLE IF NOT EXISTS turma (
    id_turma INT PRIMARY KEY AUTO_INCREMENT,
    nome_turma VARCHAR(50) NOT NULL,
    ano_letivo INT NOT NULL
);

-- 2. Tabela de usuários ajustada
CREATE TABLE IF NOT EXISTS users (
    id_user INT PRIMARY KEY AUTO_INCREMENT,
    name_user VARCHAR(50) NOT NULL,
    email_user VARCHAR(50) NOT NULL,
    address_user VARCHAR(50),
    cpf_user VARCHAR(11),
    password_user VARCHAR(25) NOT NULL,
    tipo ENUM('aluno', 'professor', 'admin') NOT NULL,
    turma_id INT NULL, 
    status_user ENUM('ativo', 'inativo') NOT NULL DEFAULT 'ativo',
    avatar_user VARCHAR(100) DEFAULT NULL,
    FOREIGN KEY (turma_id) REFERENCES turma(id_turma) ON DELETE SET NULL
);

-- 3. Tabela de Professores (Vinculada a um Usuário e a uma Turma)
CREATE TABLE IF NOT EXISTS teacher (
    id_teacher INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    turma_id INT NOT NULL, 
    class_teacher VARCHAR(15), 
    function_teacher VARCHAR(50), 
    FOREIGN KEY (user_id) REFERENCES users(id_user) ON DELETE CASCADE,
    FOREIGN KEY (turma_id) REFERENCES turma(id_turma) ON DELETE CASCADE
);

-- 4. Tabela de projetos corrigida com os campos faltantes
CREATE TABLE IF NOT EXISTS project (
    id_project INT PRIMARY KEY AUTO_INCREMENT,
    name_project VARCHAR(150) NOT NULL UNIQUE, 
    img_project VARCHAR(100),
    creators_project VARCHAR(200) NOT NULL,
    date_project DATE DEFAULT (CURRENT_DATE),
    description_project VARCHAR(200),
    archives_project TEXT,
    tags_project VARCHAR(200),
    category_project VARCHAR(50) NOT NULL DEFAULT 'Não informada', -- ADICIONADO
    class_project VARCHAR(50) NOT NULL DEFAULT 'Não informada',    -- ADICIONADO
    teacher_project VARCHAR(50) NOT NULL DEFAULT 'Não informado',
    analysis_project VARCHAR(200),
    status_project VARCHAR(50) NOT NULL,
    visibility_project VARCHAR(15) DEFAULT 'privado'
);

-- 5. Tabela intermediária N para N (Criadores e Projetos)
CREATE TABLE IF NOT EXISTS project_creators (
    project_id INT,
    user_id INT,
    PRIMARY KEY (project_id, user_id),
    FOREIGN KEY (project_id) REFERENCES project(id_project) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id_user) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS atualizações (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    descricao TEXT,
    data_publicacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_id INT,
    FOREIGN KEY (usuario_id) REFERENCES users(id_user) ON DELETE CASCADE
);

-- Testes nas tabelas
show tables;
select * from users;
select * from project;
select * from project_creators;
ALTER TABLE project ADD COLUMN visibility_project VARCHAR(200);
USE observatorio;

-- Adiciona a coluna de status do usuário (Padrão: ativo)
ALTER TABLE users ADD COLUMN status_user ENUM('ativo', 'inativo') NOT NULL DEFAULT 'ativo';

-- Adiciona a coluna para a imagem de perfil do usuário
ALTER TABLE users ADD COLUMN avatar_user VARCHAR(100) DEFAULT NULL;
-- =========================================================================
-- 1. POPULANDO AS TURMAS
-- Precisamos de pelo menos 3 turmas para os 3 professores ficarem em turmas diferentes.
-- =========================================================================
INSERT INTO turma (nome_turma, ano_letivo) VALUES 
('1º Periodo ADS', 2026),
('2º Periodo ADS', 2026),
('3º Periodo ADS', 2026);


-- =========================================================================
-- 2. POPULANDO OS USUÁRIOS
-- Condições atendidas:
-- -> 2 Alunos na mesma turma (Turma 1) e 1 Aluno em outra (Turma 2).
-- -> 3 Professores criados (depois vamos vinculá-los às suas respectivas turmas na tabela teacher).
-- -> 3 Administradores criados.
-- =========================================================================
INSERT INTO users (name_user, email_user, address_user, cpf_user, password_user, tipo, turma_id) VALUES 
-- Alunos
('Lucas Silva', 'lucas@edu.com', 'Rua A, 123', 11122233344, 'senha123', 'aluno', 1),       -- Aluno 1 (Turma 1)
('Mariana Souza', 'mariana@edu.com', 'Rua B, 456', 55566677788, 'senha456', 'aluno', 1),   -- Aluno 2 (Turma 1 - Mesma classe de Lucas)
('Carlos Eduardo', 'carlos@edu.com', 'Rua C, 789', 99900011122, 'senha789', 'aluno', 2),  -- Aluno 3 (Turma 2 - Classe diferente)

-- Professores
('Reginaldo Leme', 'reginaldo@edu.com', 'Av. Central, 10', 12345678901, 'prof123', 'professor', 1),
('Ana Beatriz', 'ana.beatriz@edu.com', 'Av. Norte, 20', 23456789012, 'prof456', 'professor', 2),
('Sérgio Moro', 'sergio@edu.com', 'Av. Sul, 30', 34567890123, 'prof789', 'professor', 3),

-- Administradores (vinculados à Turma 1 apenas para cumprir a restrição NOT NULL)
('Diretora Glória', 'gloria@admin.com', 'Rua Principal, 1', 45678901234, 'admin123', 'admin', 1),
('Vice-Diretor Roberto', 'roberto@admin.com', 'Rua Lateral, 2', 56789012345, 'admin456', 'admin', 1),
('Coordenadora Marta', 'marta@admin.com', 'Rua Direita, 3', 67890123456, 'admin789', 'admin', 1);


-- =========================================================================
-- 3. POPULANDO A TABELA TEACHER
-- Aqui fazemos a amarração final do professor ao seu cargo e à sua respectiva turma.
-- Os IDs dos usuários professores criados acima serão 4, 5 e 6 (considerando o AUTO_INCREMENT).
-- =========================================================================
INSERT INTO teacher (user_id, turma_id, class_teacher, function_teacher) VALUES 
(4, 1, 'Requisitos', 'Regente'), -- Professor Reginaldo na Turma 1
(5, 2, 'Coding', 'Regente'),    -- Professora Ana na Turma 2
(6, 3, 'Banco de Dados', 'Colaborador');  -- Professor Sérgio na Turma 3

-- DROP de tabelas

-- 1. Apaga primeiro as tabelas que dependem de outras
DROP TABLE IF EXISTS class_students;
DROP TABLE IF EXISTS teacher;
DROP TABLE IF EXISTS project_creators;
DROP TABLE IF EXISTS atualizações;

-- 2. Agora que ninguém depende delas, apaga as tabelas principais
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS project;
DROP TABLE IF EXISTS turma;

-- DROP DA DATABASE
DROP DATABASE IF EXISTS observatorio;

INSERT INTO users (name_user, email_user, address_user, cpf_user, password_user, tipo, turma_id) VALUES 
('Lucas Silva', 'lucas@edu.com', 'Rua A, 123', 11122233344, 'senha123', 'aluno', 1),       
('Mariana Souza', 'mariana@edu.com', 'Rua B, 456', 55566677788, 'senha456', 'aluno', 1),   
('Carlos Eduardo', 'carlos@edu.com', 'Rua C, 789', 99900011122, 'senha789', 'aluno', 2),  
('Reginaldo Leme', 'reginaldo@edu.com', 'Av. Central, 10', 12345678901, 'prof123', 'professor', NULL),
('Ana Beatriz', 'ana.beatriz@edu.com', 'Av. Norte, 20', 23456789012, 'prof456', 'professor', NULL),
('Sérgio Moro', 'sergio@edu.com', 'Av. Sul, 30', 34567890123, 'prof789', 'professor', NULL),
('Diretora Glória', 'gloria@admin.com', 'Rua Principal, 1', 45678901234, 'admin123', 'admin', NULL),
('Vice-Diretor Roberto', 'roberto@admin.com', 'Rua Lateral, 2', 56789012345, 'admin456', 'admin', NULL),
('Coordenadora Marta', 'marta@admin.com', 'Rua Direita, 3', 67890123456, 'admin789', 'admin', NULL);

INSERT INTO teacher (user_id, turma_id, class_teacher, function_teacher) VALUES 
(4, 1, 'Requisitos', 'Regente'), 
(5, 2, 'Coding', 'Regente'),    
(6, 3, 'Banco de Dados', 'Colaborador');