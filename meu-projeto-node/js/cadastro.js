document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-cadastro');

    if (!form) {
        console.error("ERRO: O formulário 'form-cadastro' não foi encontrado no HTML.");
        return;
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault(); // Impede a página de recarregar
        console.log("Formulário enviado! Coletando dados...");

        const dados = {
            nome: document.getElementById('nome').value,
            matricula: document.getElementById('matricula').value,
            turma: document.getElementById('turma').value,
            email: document.getElementById('email').value,
            senha: document.getElementById('senha').value
        };

        console.log("Dados prontos para envio:", dados);

        try {
            const response = await fetch('http://localhost:3000/api/usuarios/cadastrar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dados)
            });

            const resultado = await response.json();

            if (response.ok) {
                alert(' Usuário cadastrado com sucesso!');
                window.location.href = '/Login'; 
            } else {
                console.error("Erro do servidor:", resultado);
                alert(' Erro ao cadastrar: ' + (resultado.erro || 'Verifique o terminal do Node'));
            }

        } catch (error) {
            console.error("Erro na requisição Fetch:", error);
            alert(' O servidor está desligado ou a URL está errada. ');
        }
    });
});