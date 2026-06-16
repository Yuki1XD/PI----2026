document.getElementById('loginForm').addEventListener('submit', async function(event) {
    // Evita que a página recarregue antes de falar com o servidor
    event.preventDefault(); 
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    try {
        // Faz a requisição POST para a sua API do Express
        // Altere a linha 8 do cadastro.js para:
        const resposta = await fetch('/src/apis/auth/login_aluno', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                emailAluno: email,
                passwordAluno: senha
            })
        });
        // ... dentro do try do seu addEventListener ...
        const dados = await resposta.json();

        if (resposta.ok && dados.sucesso) {
            // Se o banco validou e retornou sucesso, redireciona
            window.location.href = dados.redirecionar;
        } else {
            // Agora, qualquer erro (401, 400, etc) vai cair aqui e mostrar a mensagem
            document.getElementById('mensagem-erro').innerText = dados.mensagem || "Erro ao realizar login.";
        }
    } catch (erro) {
        console.error("Erro ao tentar fazer login:", erro);
        alert("Não foi possível conectar ao servidor.");
    }
});