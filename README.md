# TecOwl:
> A web platform for repository of Integrative Projects (*Projeto Integrador*) for the **Systems Analysis and Development Program** at **Senac College**. 

[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE) 

[![Senac](https://img.shields.io/badge/Institution-Senac%20College-blue)](https://www.senac.br/) 

[![LGPD](https://img.shields.io/badge/Compliance-LGPD%20Ready-blueviolet)](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm) 
##  Project Overview 

This project is a repository of Integrative Projects, where students can post their projects to be viewed by various people and analyzed by their teachers, in an easy and intuitive way.

## LGPD & Data Privacy Compliance

Because this application processes **Sensitive Personal Data** (*dados pessoais sensíveis*), privacy by design was a core requirement of this project in compliance with Brazilian Federal Law nº 13.709/2018 (LGPD).

## Tech Stack 

* **Frontend:** Html, css

* **Backend:** Node.js

* **Database:** MySql

* **Testing:** Render

## Getting Started (Local Development) 
Follow these steps to run the project environment locally. 

### 1. Prerequisites 

Ensure you have installed: 

* [Git](https://git-scm.com) 
* [Node.js](https://nodejs.org/) (v18.0.0 or higher)
* [mysql](https://dev.mysql.com/downloads/installer/)

## Setup and Execution

# 1. Clone the repository 
git clone 

cd meu-projeto-node

npm install

# 2. Run Frontend 

node index.js
 
## Core API Endpoints

### Authentication and Users (`auth.js`)
| Method | Endpoint | Description |
| :--- | :---: | ---: |
| POST | /login_aluno | Authenticates the user (Student, Teacher, or Admin) and starts the session. |
| POST | /cadastrar_aluno | Registers a new student and automatically links or creates the specified class. |
| GET | /buscar | Search for up to 10 active users of the 'student' type by name or email. |
| GET | /profile | Retorna os dados de perfil (nome, e-mail, tipo, avatar) do usuário logado. |
| PUT | /change-password | Returns the profile data (name, email, type, avatar) of the logged-in user. |
| GET | / | (Admin) Lists all users registered in the system. |
| PUT | /atualizar/:id | (Admin) Updates the data and avatar photo of a specific user. |
| DELETE | /deletar/:id | (Admin) Permanently removes a user from the database and deletes their avatar photo from the server. |

### Project Management (`projetos.js`)
| Method | Endpoint | Description |
| :--- | :---: | ---: |
| GET | / | Lists all projects with visibility set to 'public'.. |
| POST | /cadastrar | Register a new project by uploading a cover image and multiple attachments. |
| POST | /atualizar | Edita os dados de um projeto, atualizando arquivos e reassociando colaboradores. |
| GET | /my_projects | Edit project data, updating files and reassociating collaborators. |
| GET | /pendentes | (Professor) Lists the submitted projects that are awaiting review. |
| GET | /analisados | (Professor) List the projects that have already received an evaluation. |
| PUT | /analisar/:id | (Professor) Saves the feedback text and updates the project review status. |
| PUT | /aceitar_rejeitar/:id | (Admin/Professor) Changes the project status to 'accepted' or 'rejected' and sets visibility. |
| GET | /dashboard | Returns project counts and recent activity history for the logged-in student. |
| GET | /dashboard-inicio | Returns general system usage statistics (total students, teachers, and public projects). |
| GET | /estatisticas | (Admin) Returns the complete compilation of system totals to the administrative panel. |
| DELETE | /deletar/:id | (Admin) Permanently remove a project from the database. |

## Future Improvements
If we do so, we plan to implement:

* IA

## Authors & Project Team

* Maria Sophia de Lima dos Santos - [GitHub](https://github.com/Yuki1XD)
* Gabriel Felipe Belo de Moura - [GitHub](https://github.com/RazebaG)
* Erik Melado Carvalho - [GitHub](https://github.com/ARKSTAR64)
* João Vitor - [GitHub](https://github.com/Jv132)

* Academic Advisor / Professor: Prof. Filipe Carvalho
* Academic Advisor / Professor: Prof. Sonia Gomes
* Tech English Course Professor: Prof. Leonardo Trevas 

