document.getElementById('form-cadastro-professor').addEventListener('submit', async (e) => {
    e.preventDefault();

    const dados = {
        nome: document.getElementById('nome').value,
        email: document.getElementById('email').value,
        senha: document.getElementById('senha').value,
        turma: document.getElementById('turma').value, // Usando o campo turma para disciplina
        tipo: 'professor' // <--- ISSO define que é um professor no banco
    };

    const response = await fetch('http://localhost:3000/api/usuarios/cadastrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
    });

    if (response.ok) {
        alert('Professor cadastrado!');
        window.location.href = 'login.html';
    } else {
        alert('Erro ao cadastrar professor.');
    }
});