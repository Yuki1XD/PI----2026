// utimas postagens
async function Utimas_postagens() {
    try {
        // 1. Busca os dados da API
        const resposta = await fetch(API_URL);
        const postagens = await resposta.json();
        
        const container = document.getElementById('container-postagens');
        container.innerHTML = ''; // Limpa o container antes de carregar

        // 2. Passa por cada postagem e monta o HTML dinâmico
        postagens.forEach(post => {
            const cardHTML = `
                <div class="postagem-card" data-id="${post.id}">
                    <div class="postagem-topo">
                        <img src="${post.imagem_url}" alt="${post.titulo}">
                    </div>
                    <div class="postagem-cont">
                        <h3>${post.titulo}</h3>
                        <p>${post.descricao}</p>
                    </div>
                    <div class="postagem-inf">
                        <span>${post.autor}</span>
                        <span>${post.data_publicacao}</span>
                    </div>
                </div>
            `;
            
            // 3. Injeta o card dentro do container
            container.innerHTML += cardHTML;
        });
    } catch (erro) {
        console.error('Erro ao carregar as postagens:', erro);
    }
}
// Função para carregar as alterações recentes
async function Alteracoes_Recientes() {
    try {
        // 1. Busca os dados da API
        const resposta = await fetch(API_URL);
        const alteracoes = await resposta.json();

        const container = document.getElementById('container-alteracoes');
        container.innerHTML = ''; // Limpa o container antes de carregar

        // 2. Passa por cada alteração e monta o HTML dinâmico
        alteracoes.forEach(alteracao => {
            const cardHTML = `
                <div class="alteracao-card" data-id="${alteracao.id}">
                    <div class="alteracao-topo">
                        <img src="${alteracao.imagem_url}" alt="${alteracao.titulo}">
                    </div>
                    <div class="alteracao-cont">
                        <h3>${alteracao.titulo}</h3>
                        <p>${alteracao.descricao}</p>
                    </div>
                    <div class="alteracao-inf">
                        <span>${alteracao.autor}</span>
                        <span>${alteracao.data_alteracao}</span>
                    </div>
                </div>
            `;

            // 3. Injeta o card dentro do container
            container.innerHTML += cardHTML;
        });
    } catch (erro) {
        console.error('Erro ao carregar as alterações:', erro);
    }
}
// Função para carregar as estatísticas da plataforma
async function Estatísticas_da_Plataforma () {
    try {
        // 1. Busca os dados da API
        const resposta = await fetch(API_URL);
        const estatisticas = await resposta.json();
 
         const container = document.getElementById('container-estatisticas');
        container.innerHTML = ''; // Limpa o container antes de carregar

        // 2. Monta o HTML dinâmico para as estatísticas       
// Executa a função quando a página carregar
        const estatisticasHTML = `
            <div class="estatistica-card">
                <h3>Total de Postagens</h3>
                <p>${estatisticas.total_postagens}</p>
            </div>
            <div class="estatistica-card">
                <h3>Total de Usuários</h3>
                <p>${estatisticas.total_usuarios}</p>
            </div>
            <div class="estatistica-card">
                <h3>Total de Comentários</h3>
                <p>${estatisticas.total_comentarios}</p>
            </div>
        `;
        
        // 3. Injeta o HTML dentro do container
        container.innerHTML = estatisticasHTML;
    } catch (erro) {
        console.error('Erro ao carregar as estatísticas:', erro);
    }
}

window.onload = Utimas_postagens;
window.onload = Alteracoes_Recientes;
window.onload = Estatísticas_da_Plataforma;

