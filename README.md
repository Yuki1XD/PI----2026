# TecOwl:
[![Senac](https://img.shields.io/badge/Institution-Senac%20College-blue)](https://www.senac.br/) 
##  Project Overview 
### Key Features

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

# 2. Run Backend 
npm install

# 3. Run Frontend 
npm install

node index.js

## Core API Endpoints
 
## Core API Endpoints

### Autenticação e Usuários (`auth.js`)
| Method | Endpoint | Description |
| :--- | :---: | ---: |
| POST | /login_aluno | Autentica o usuário (Aluno, Professor ou Admin) e inicia a sessão. |
| POST | /cadastrar_aluno | Cadastra um novo aluno e vincula ou cria a turma informada automaticamente. |
| GET | /buscar | Busca até 10 usuários ativos do tipo 'aluno' por nome ou e-mail. |
| GET | /profile | Retorna os dados de perfil (nome, e-mail, tipo, avatar) do usuário logado. |
| PUT | /change-password | Altera a senha do usuário logado após validar a senha atual. |
| GET | / | (Admin) Lista todos os usuários cadastrados no sistema. |
| PUT | /atualizar/:id | (Admin) Atualiza os dados e a foto de avatar de um usuário específico. |
| DELETE | /deletar/:id | (Admin) Remove permanentemente um usuário do banco e apaga sua foto de avatar do servidor. |

### Gerenciamento de Projetos (`projetos.js`)
| Method | Endpoint | Description |
| :--- | :---: | ---: |
| GET | / | Lista todos os projetos com visibilidade configurada como 'publico'. |
| POST | /cadastrar | Cadastra um novo projeto com upload de imagem de capa e múltiplos anexos. |
| POST | /atualizar | Edita os dados de um projeto, atualizando arquivos e reassociando colaboradores. |
| GET | /my_projects | Lista todos os projetos associados ao aluno atualmente logado. |
| GET | /pendentes | (Professor) Lista os projetos enviados que aguardam análise. |
| GET | /analisados | (Professor) Lista os projetos que já receberam uma avaliação. |
| PUT | /analisar/:id | (Professor) Salva o texto de feedback e atualiza o status de análise do projeto. |
| PUT | /aceitar_rejeitar/:id | (Admin/Professor) Altera o status do projeto para 'aceito' ou 'rejeitado' e define visibilidade. |
| GET | /dashboard | Retorna contagens de projetos e histórico de atividades recentes do aluno logado. |
| GET | /dashboard-inicio | Retorna estatísticas gerais de uso do sistema (total de alunos, professores e projetos públicos). |
| GET | /estatisticas | (Admin) Retorna o compilado completo de totais do sistema para o painel administrativo. |
| DELETE | /deletar/:id | (Admin) Remove permanentemente um projeto do banco de dados. |

## Future Improvements
If we , we plan to implement:

* IA

## Authors & Project Team

* Maria Sophia de Lima dos Santos - [GitHub](https://github.com/Yuki1XD)
* Gabriel - [GitHub](https://github.com/RazebaG)
* Erik - [GitHub](https://github.com/ARKSTAR64)
* João - [GitHub](https://github.com/Jv132)

* Academic Advisor / Professor: Prof. Filipe Carvalho
* Academic Advisor / Professor: Prof. Sonia Gomes
* Tech English Course Professor: Prof. Leonardo Trevas 
* Tech English Course Professor: Prof. Leonardo Trevas
* Tech English Course Professor: Prof. Leonardo Trevas
* Tech English Course Professor: Prof. Leonardo Trevas
* Tech English Course Professor: Prof. Leonardo Trevas 
