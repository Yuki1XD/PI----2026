document.getElementById('loginForm').addEventListener('submit', async function(event) {
    // Evita que a página recarregue antes de falar com o servidor
    event.preventDefault(); 
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    try {
        // Faz a requisição POST para a sua API do Express
        const resposta = await fetch('/apis/auth/login_aluno', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                emailAluno: email,
                passwordAluno: senha
            })
        });
        const dados = await resposta.json();
        if (resposta.ok && dados.sucesso) {
            // Se o banco validou e retornou sucesso, o navegador redireciona
            window.location.href = dados.redirecionar;
        } else {
            // Exibe a mensagem de erro vinda do servidor (Ex: "E-mail ou senha incorretos.")
            document.getElementById('mensagem-erro').innerText = dados.mensagem;
        }
    } catch (erro) {
        console.error("Erro ao tentar fazer login:", erro);
        alert("Não foi possível conectar ao servidor.");
    }
});