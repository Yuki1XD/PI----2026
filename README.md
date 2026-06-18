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
 
Método,Endpoint,Descrição
GET,/,Lista todos os projetos com visibilidade pública.
POST,/cadastrar,Cria um novo projeto com upload de imagem e múltiplos arquivos.
POST,/atualizar,"Edita os dados, colaboradores e arquivos de um projeto existente."
GET,/my_projects,Lista os projetos pertencentes ao aluno logado.
GET,/pendentes,(Professor) Busca projetos que estão aguardando análise (enviado).
GET,/analisados,(Professor) Busca projetos que já foram analisados (analisado).
PUT,/analisar/:id,(Professor) Salva o texto de feedback e atualiza o status do projeto.
PUT,/aceitar_rejeitar/:id,(Admin/Prof) Altera o status do projeto para aceito ou rejeitado.
GET,/dashboard,Retorna métricas e atividades recentes do aluno logado.
GET,/dashboard-inicio,"Retorna contagens gerais (alunos, projetos públicos) e timeline recente."
GET,/estatisticas,"(Admin) Retorna o compilado de totais do sistema (turmas, status, etc)."
DELETE,/deletar/:id,(Admin) Remove permanentemente um projeto do banco de dados.


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
