document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Impede a página de recarregar

    const nomeAluno = document.getElementById('nome').value;
    const matriculaAluno = document.getElementById('matricula').value;
    const turmaAluno = document.getElementById('turma').value;
    const emailAluno = document.getElementById('email').value;
    const passwordAluno = document.getElementById('senha').value;
    const confirmarPasswordAluno = document.getElementById('confirmar-senha').value;
    const mensagemErro = document.getElementById('mensagem-erro');

    // Limpa mensagens anteriores
    mensagemErro.innerText = "";
    mensagemErro.style.color = "red";

    if (passwordAluno !== confirmarPasswordAluno) {
        mensagemErro.innerText = "As senhas não coincidem!";
        return;
    }

    // Monta o objeto com os dados fornecidos pelo formulário
    const dadosCadastro = {
        nomeAluno,
        matriculaAluno,
        turmaAluno,
        emailAluno,
        passwordAluno,
        confirmarPasswordAluno
    };

    // Faz a requisição POST para a nossa nova rota do backend
    fetch('/auth/cadastrar_aluno', { // Certifique-se de que o prefixo das rotas no app.js seja /auth
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dadosCadastro)
    })
    .then(response => response.json().then(data => ({ status: response.status, body: data })))
    .then(res => {
        if (res.status === 201) {
            mensagemErro.style.color = "green";
            mensagemErro.innerText = res.body.mensagem;
            
            // Limpa o formulário após 2 segundos e pode redirecionar
            setTimeout(() => {
                document.getElementById('loginForm').reset();
                window.location.href = '/cadastro'; // Altere para a rota da sua tela de login
            }, 2000);
        } else {
            // Exibe o erro retornado pelo servidor
            mensagemErro.innerText = res.body.mensagem || "Erro ao realizar cadastro.";
        }
    })
    .catch(error => {
        console.error("Erro na requisição:", error);
        mensagemErro.innerText = "Erro ao conectar com o servidor.";
    });
});