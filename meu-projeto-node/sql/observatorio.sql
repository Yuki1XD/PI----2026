create database observatorio;

use observatorio;

create table projeto (
id int primary key auto_increment,
name_project varchar(50) not null,
description_project varchar(200),
archives_projects int,
creators_project varchar(200) not null,
date_project date,
tags_project varchar(200),
teacher_project varchar(50),
alalysis_project varchar(200),
status varchar(50) not null
);

create table users (
id_user int primary key auto_increment,
name_user varchar(50) not null,
email_user varchar(50) not null,
address_user varchar(50),
cpf_user int,
password_user varchar(25) not null,
function_user varchar(25)
);

create table teacher (
class_teacher varchar(15),
functioon_teacher varchar(50)
);