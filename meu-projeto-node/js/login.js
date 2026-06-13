document.getElementById('form-login').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    try {
        const response = await fetch('http://localhost:3000/api/usuarios/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });

        const dados = await response.json();

        if (response.ok) {
            alert('Bem-vindo, ' + dados.user.nome);
            localStorage.setItem('usuarioId', dados.user.id);
            
            window.location.href = '/aluno'; 
        } else {
            alert(dados.erro);
        }
    } catch (error) {
        console.error('Erro ao logar:', error);
        alert('Erro ao conectar com o servidor.');
    }
});