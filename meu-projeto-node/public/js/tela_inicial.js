let listaProjetosGlobal = [];

document.addEventListener("DOMContentLoaded", () => {
    carregarEstatisticasEAtividades();
    carregarUltimosProjetos();
    configurarFiltros();
});

// 1. CONSOME A ROTA /dashboard-inicio
async function carregarEstatisticasEAtividades() {
    try {
        const response = await fetch('/src/apis/projects/dashboard-inicio');
        if (!response.ok) throw new Error("Erro ao buscar dados do dashboard");
        
        const dados = await response.json();

        if(document.getElementById("stat-publicados")) document.getElementById("stat-publicados").innerText = dados.totalProjetos || 0;
        if(document.getElementById("stat-ativos")) document.getElementById("stat-ativos").innerText = dados.totalAlunos || 0;
        if(document.getElementById("stat-pendentes")) document.getElementById("stat-pendentes").innerText = dados.totalPendentes || 0;
        if(document.getElementById("stat-professores")) document.getElementById("stat-professores").innerText = dados.totalProfessores || 0;

        const containerAlteracoes = document.getElementById("container-alteracoes");
        if (containerAlteracoes) {
            containerAlteracoes.innerHTML = ""; 

            if (dados.atividades && dados.atividades.length > 0) {
                dados.atividades.forEach(ativ => {
                    let classeCor = "orange";
                    let icone = "fa-folder";
                    
                    if (ativ.status === "sucesso") {
                        classeCor = "green";
                        icone = "fa-check-circle";
                    } else if (ativ.status === "padrao") {
                        classeCor = "blue";
                        icone = "fa-info-circle";
                    }

                    const itemHtml = `
                        <div class="update-item">
                            <div class="icon-circle ${classeCor}"><i class="fas ${icone}"></i></div>
                            <div class="update-text">
                                <p>${ativ.descricao}</p>
                            </div>
                            <span class="update-time">${ativ.tempo_passado}</span>
                        </div>
                    `;
                    containerAlteracoes.insertAdjacentHTML("beforeend", itemHtml);
                });
            } else {
                containerAlteracoes.innerHTML = `<p class="sem-dados">Nenhuma atualização recente no sistema.</p>`;
            }
        }

    } catch (erro) {
        console.error("Erro na carga do Dashboard Inicial:", erro);
    }
}

// 2. CONSOME A ROTA GET / (Retorna apenas projetos públicos)
async function carregarUltimosProjetos() {
    try {
        const response = await fetch('/src/apis/projects');
        if (!response.ok) throw new Error("Erro ao carregar projetos");

        listaProjetosGlobal = await response.json();
        
        atualizarContadoresCategorias(listaProjetosGlobal);
        renderizarProjetos(listaProjetosGlobal);

    } catch (erro) {
        console.error("Erro na carga das postagens de projetos:", erro);
        const container = document.getElementById("container-postagens");
        if(container) container.innerHTML = `<p class="erro-dados">Erro ao carregar postagens.</p>`;
    }
}

// 3. FUNÇÃO DE RENDERIZAÇÃO DOS CARDS
function renderizarProjetos(projetosParaExibir) {
    const containerPostagens = document.getElementById("container-postagens");
    if (!containerPostagens) return;

    containerPostagens.innerHTML = ""; 

    if (projetosParaExibir.length > 0) {
        projetosParaExibir.forEach(proj => {
            const imgUrl = proj.img_project ? `/uploads/${proj.img_project}` : '/imgs/default-thumbnail.jpg';
            
            let dataExibicao = proj.date_project;
            if(dataExibicao && dataExibicao.includes('-')) {
                const partes = dataExibicao.split('-');
                dataExibicao = `${partes[2]}/${partes[1]}/${partes[0]}`;
            }

            const postagemHtml = `
                <div class="postagem-card">
                    <div class="postagem-topo">
                        <img src="${imgUrl}" alt="${proj.name_project}">
                    </div>
                    <div class="postagem-cont">
                        <h3>${proj.name_project}</h3>
                        <p>${proj.description_project || 'Sem descrição fornecida.'}</p>
                    </div>
                    <div class="postagem-inf">
                        <span><i class="fi fi-rr-user"></i> ${proj.creators_project || 'Autor Desconhecido'}</span>
                        <span><i class="fi fi-rr-calendar"></i> ${dataExibicao || ''}</span>
                    </div>
                </div>
            `;
            containerPostagens.insertAdjacentHTML("beforeend", postagemHtml);
        });
    } else {
        containerPostagens.innerHTML = `<p class="sem-dados">Nenhum projeto encontrado para a sua busca.</p>`;
    }
}

// 4. GERADOR DINÂMICO DE CATEGORIAS
function atualizarContadoresCategorias(todosProjetos) {
    const containerCategorias = document.getElementById("container-categorias-dinamicas");
    if (!containerCategorias) return;

    containerCategorias.innerHTML = ""; 

    const configsVisuais = {
        'tecnologia': { nome: 'Tecnologia da Informação', classe: 'icon-ti', icone: 'fi-rr-brackets-curly', desc: 'Desenvolvimento de software, aplicativos mobile, sistemas web e soluções inovadoras.' },
        'ti':         { nome: 'Tecnologia da Informação', classe: 'icon-ti', icone: 'fi-rr-brackets-curly', desc: 'Desenvolvimento de software, aplicativos mobile, sistemas web e soluções inovadoras.' },
        'informatica':{ nome: 'Tecnologia da Informação', classe: 'icon-ti', icone: 'fi-rr-brackets-curly', desc: 'Desenvolvimento de software, aplicativos mobile, sistemas web e soluções inovadoras.' },
        'design':     { nome: 'Design e Comunicação', classe: 'icon-design', icone: 'fi-rr-palette', desc: 'Projetos de design gráfico, identidade visual, UI/UX e comunicação visual.' },
        'comunicacao':{ nome: 'Design e Comunicação', classe: 'icon-design', icone: 'fi-rr-palette', desc: 'Projetos de design gráfico, identidade visual, UI/UX e comunicação visual.' },
        'gestao':     { nome: 'Gestão e Negócios', classe: 'icon-gestao', icone: 'fi-rr-stats', desc: 'Planos de negócios, análises de mercado e estratégias empresariais.' },
        'negocios':   { nome: 'Gestão e Negócios', classe: 'icon-gestao', icone: 'fi-rr-stats', desc: 'Planos de negócios, análises de mercado e estratégias empresariais.' },
        'marketing':  { nome: 'Marketing Digital', classe: 'icon-mkt', icone: 'fi-rr-megaphone', desc: 'Campanhas digitais, estratégias de redes sociais e marketing de conteúdo.' },
        'mkt':        { nome: 'Marketing Digital', classe: 'icon-mkt', icone: 'fi-rr-megaphone', desc: 'Campanhas digitais, estratégias de redes sociais e marketing de conteúdo.' }
    };

    const categoriasEncontradas = {};

    todosProjetos.forEach(p => {
        if (p.category_project) {
            const termoBruto = p.category_project.toLowerCase().trim();
            const termoNormalizado = termoBruto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

            let chaveMestre = termoNormalizado;
            let visual = configsVisuais[termoNormalizado];

            if (visual) {
                if (termoNormalizado === 'ti' || termoNormalizado === 'informatica') chaveMestre = 'tecnologia';
                if (termoNormalizado === 'comunicacao') chaveMestre = 'design';
                if (termoNormalizado === 'negocios') chaveMestre = 'gestao';
                if (termoNormalizado === 'mkt') chaveMestre = 'marketing';
            } else {
                configsVisuais[chaveMestre] = {
                    nome: p.category_project, 
                    classe: 'icon-ti', 
                    icone: 'fi-rr-folder', 
                    desc: `Veja os projetos desenvolvidos na área de ${p.category_project}.`
                };
            }

            if (!categoriasEncontradas[chaveMestre]) {
                categoriasEncontradas[chaveMestre] = {
                    qtd: 0,
                    dadosVisuais: configsVisuais[chaveMestre]
                };
            }
            categoriasEncontradas[chaveMestre].qtd++;
        }
    });

    const chavesValidas = Object.keys(categoriasEncontradas);

    if (chavesValidas.length === 0) {
        containerCategorias.innerHTML = `<p class="sem-dados">Nenhuma categoria com projetos públicos no momento.</p>`;
        return;
    }

    chavesValidas.forEach(chave => {
        const categoria = categoriasEncontradas[chave];
        const cardHtml = `
            <div class="card">
                <div class="card-icon ${categoria.dadosVisuais.classe}">
                    <i class="fi ${categoria.dadosVisuais.icone}"></i>
                </div>
                <h3>${categoria.dadosVisuais.nome}</h3>
                <span class="count-${chave}">${categoria.qtd} ${categoria.qtd === 1 ? 'projeto' : 'projetos'}</span>
                <p>${categoria.dadosVisuais.desc}</p>
                <a href="javascript:void(0)" onclick="filtrarPorBotaoCategoria('${chave}')" class="btn-ver-projetos">Ver projetos</a>
            </div>
        `;
        containerCategorias.insertAdjacentHTML("beforeend", cardHtml);
    });
}

// 5. CONFIGURAÇÃO DOS EVENTOS DE FILTRO
function configurarFiltros() {
    const inputBusca = document.getElementById("search-input");
    const selectOrdem = document.getElementById("select-ordem");

    if (inputBusca) {
        inputBusca.addEventListener("keyup", aplicarFiltrosERenderizar);
    }
    if (selectOrdem) {
        selectOrdem.addEventListener("change", aplicarFiltrosERenderizar);
    }

    verificarCategoriaViaURL();
}

// 6. MOTOR DE FILTRAGEM UNIFICADO
function aplicarFiltrosERenderizar() {
    const inputElement = document.getElementById("search-input");
    const selectElement = document.getElementById("select-ordem");

    const termoBusca = inputElement ? inputElement.value.toLowerCase().trim() : '';
    const ordem = selectElement ? selectElement.value : 'more_new';

    let projetosFiltrados = listaProjetosGlobal.filter(p => {
        const nome = p.name_project ? p.name_project.toLowerCase() : '';
        const descricao = p.description_project ? p.description_project.toLowerCase() : '';
        const autores = p.creators_project ? p.creators_project.toLowerCase() : '';
        const categoria = p.category_project ? p.category_project.toLowerCase() : '';
        
        return nome.includes(termoBusca) || 
               descricao.includes(termoBusca) || 
               autores.includes(termoBusca) ||
               categoria.includes(termoBusca); 
    });

    projetosFiltrados.sort((a, b) => {
        if (ordem === 'more_new') {
            return b.id_project - a.id_project; 
        } else {
            return a.id_project - b.id_project; 
        }
    });

    renderizarProjetos(projetosFiltrados);
}

// 7. FILTRAR POR CLIQUE NO BOTÃO DA CATEGORIA
function filtrarPorBotaoCategoria(categoriaAlvo) {
    if (!listaProjetosGlobal || listaProjetosGlobal.length === 0) return;

    let projetosFiltrados = listaProjetosGlobal.filter(p => {
        const cat = p.category_project ? p.category_project.toLowerCase() : '';
        
        if (categoriaAlvo === 'tecnologia') {
            return cat.includes('tecnologia') || cat.includes('ti') || cat.includes('informática');
        } else if (categoriaAlvo === 'design') {
            return cat.includes('design') || cat.includes('comunicação');
        } else if (categoriaAlvo === 'gestao') {
            return cat.includes('gestão') || cat.includes('negócios');
        } else if (categoriaAlvo === 'marketing') {
            return cat.includes('marketing') || cat.includes('mkt');
        }
        return false;
    });

    renderizarProjetos(projetosFiltrados);

    const containerPostagens = document.getElementById("container-postagens");
    if (containerPostagens) {
        containerPostagens.scrollIntoView({ behavior: 'smooth' });
    }
}

// 8. VERIFICAR PARÂMETROS DA URL
function verificarCategoriaViaURL() {
    const params = new URLSearchParams(window.location.search);
    const categoriaUrl = params.get('categoria'); 
    const searchInput = document.getElementById("search-input");

    if (categoriaUrl && searchInput) {
        let termoBusca = "";
        
        if (categoriaUrl === 'ti') termoBusca = "tecnologia";
        else if (categoriaUrl === 'design') termoBusca = "design";
        else if (categoriaUrl === 'gestao') termoBusca = "gestão";
        else if (categoriaUrl === 'marketing') termoBusca = "marketing";

        if (termoBusca) {
            searchInput.value = termoBusca; 
            aplicarFiltrosERenderizar();    
        }
    }
}