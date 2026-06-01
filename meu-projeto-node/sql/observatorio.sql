create database observatorio;

use observatorio;

create table if not exists projeto (
id_project int primary key auto_increment,
name_project varchar(50) not null unique,
img_project varchar(100),
creators_project varchar(200) not null,
date_project date,
description_project varchar(200),
archives_project text,
tags_project varchar(200),
teacher_project varchar(50),
alalysis_project varchar(200),
status_project varchar(50) not null
);

create table if not exists users (
id_user int primary key auto_increment,
name_user varchar(50) not null,
email_user varchar(50) not null,
address_user varchar(50),
cpf_user int,
password_user varchar(25) not null,
tipo ENUM('aluno', 'professor', 'admin')
);

create table if not exists teacher (
class_teacher varchar(15),
functioon_teacher varchar(50)
);

CREATE TABLE IF NOT EXISTS atualizações (
id INT AUTO_INCREMENT PRIMARY KEY,
titulo VARCHAR(150) NOT NULL,
descricao TEXT,
data_publicacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
usuario_id INT,
FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

select * from users;
drop table projeto;
select * from projeto;

insert into users (name_user, email_user, password_user) values ('Maria Sophia', 'Maria.santos4960041@edu.pe.senac.br', '123456789');
