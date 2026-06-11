CREATE DATABASE IF NOT EXISTS observatorio;
USE observatorio;

-- 1. Cria a tabela de usuários primeiro (base para as outras)
CREATE TABLE IF NOT EXISTS users (
    id_user INT PRIMARY KEY AUTO_INCREMENT,
    name_user VARCHAR(50) NOT NULL,
    email_user VARCHAR(50) NOT NULL,
    address_user VARCHAR(50),
    cpf_user INT,
    password_user VARCHAR(25) NOT NULL,
    tipo ENUM('aluno', 'professor', 'admin') NOT NULL
);

-- 2. NOVA: Tabela de Turmas
CREATE TABLE IF NOT EXISTS turma (
    id_turma INT PRIMARY KEY AUTO_INCREMENT,
    nome_turma VARCHAR(50) NOT NULL,
    ano_letivo INT NOT NULL
);

-- 3. NOVA: Vinculo de Alunos com as Turmas (N para N)
CREATE TABLE IF NOT EXISTS turma_alunos (
    turma_id INT,
    aluno_id INT,
    PRIMARY KEY (turma_id, aluno_id),
    FOREIGN KEY (turma_id) REFERENCES  turma(id_turma) ON DELETE CASCADE,
    FOREIGN KEY (aluno_id) REFERENCES users(id_user) ON DELETE CASCADE
);

-- 4. AJUSTADA: Tabela de Professores (Vinculada a um Usuário e a uma Turma)
CREATE TABLE IF NOT EXISTS teacher (
    id_teacher INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    turma_id INT NOT NULL,
    class_teacher VARCHAR(15), -- Ex: "Sala 04" ou "Laboratório"
    function_teacher VARCHAR(50), -- Ex: "Regente", "Substituto"
    FOREIGN KEY (user_id) REFERENCES users(id_user) ON DELETE CASCADE,
    FOREIGN KEY (turma_id) REFERENCES turma(id_turma) ON DELETE CASCADE
);

-- 2. Cria a tabela principal de projetos (sem o campo individual creators_id)
CREATE TABLE IF NOT EXISTS project (
    id_project INT PRIMARY KEY AUTO_INCREMENT,
    name_project VARCHAR(150) NOT NULL UNIQUE, -- Aumentado o tamanho do nome do projeto
    img_project VARCHAR(100),
    creators_project VARCHAR(200) NOT NULL,
    date_project DATE DEFAULT (CURRENT_DATE),
    description_project VARCHAR(200),
    archives_project TEXT,
    tags_project VARCHAR(200),
    teacher_project VARCHAR(50),
    alalysis_project VARCHAR(200),
    status_project VARCHAR(50) NOT NULL
);

-- 3. Cria a tabela intermediária que vincula N usuários a N projetos
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

-- Insere o usuário de teste padrão
insert into users (name_user, email_user, password_user, tipo) values 
('Erik Melado', 'erik_me_da_o_email@please.com', '44444444', 'professor'),
('Maria Sophia', 'Maria.santos4960041@edu.pe.senac.br', '123456789', 'aluno'),
('Gabriel Felipe', 'gabriefbm@gmail.com', '987654321', 'aluno');


-- DROP de tabelas
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS project;
DROP TABLE IF EXISTS project_creators;

-- DROP DA DATABASE
DROP DATABASE IF EXISTS observatorio;