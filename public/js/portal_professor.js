// === CORREÇÃO DO MENU LATERAL ===
const menuButton = document.getElementById("menuButton");
const header = document.getElementById('header');
const menuSide = document.getElementById('menuSide');
const contentContainer = document.getElementById('contentContainerId');

if (menuButton) {
    menuButton.addEventListener('click', () => {
        header.classList.toggle('movimentHeader');
        menuSide.classList.toggle('openMenuSide');
        
        // CORREÇÃO: Aplica a classe que moverá todo o container de conteúdo para a direita
        contentContainer.classList.toggle('movimentContent');
    });
}

const buttonTab = document.querySelectorAll('.buttonTab')

buttonTab.forEach(buttonTab => buttonTab.addEventListener('click', () => tabClicked(buttonTab)))

const tabClicked = (buttonTab) => {
    const contentTab = document.querySelectorAll('.contentTab')

    contentTab.forEach(content => content.classList.remove('show'))

    const contentId = buttonTab.getAttribute('content-id') 

    const content = document.getElementById(contentId)

    content.classList.add('show')

    console.log(contentId)
}

const newProjectImg = document.getElementById('newProjectImg')

if (newProjectImg) {
    const spanAddArchive = document.querySelector('.spanAddArchive')
    spanAddArchive.innerHTML = '<i class="fi fi-rr-add-image"></i>Escolha um Arquivo para fazer upload'

    newProjectImg.addEventListener('change', function(e) {

        const inputImg = e.target
        const img = inputImg.files[0]

        if (img) {
            const reader = new FileReader()

            reader.addEventListener('load', function(e) {
                const thisReader = e.target

                const createImg = document.createElement('img')
                createImg.src = thisReader.result
                createImg.classList.add('newAddImg')

                spanAddArchive.innerHTML = ''

                spanAddArchive.appendChild(createImg)

            })

            reader.readAsDataURL(img)
        }
        else {
            spanAddArchive.innerHTML = '<i class="fi fi-rr-add-image"></i>Escolha um Arquivo para fazer upload'
        }

    })
}

// ==========================================
// CARREGAR DADOS DO PROFESSOR LOGADO
// ==========================================
async function carregarDadosProfessor() {
    const imgContainer = document.getElementById("teacherImgContainer");
    const nomePerfil = document.getElementById("teacherName");
    const cargoPerfil = document.getElementById("teacherRole");

    // Seleciona os inputs da aba de configurações para preenchê-los automaticamente
    const formConfig = document.querySelector("#configurations form");
    
    try {
        // Faz a requisição para a rota do back-end
        const response = await fetch('/apis/projects/profile'); 
        
        if (!response.ok) throw new Error("Erro ao buscar dados do professor");
        
        const professor = await response.json();

        // 1. Atualiza os dados no Menu Lateral (Sidebar)
        if (nomePerfil) nomePerfil.textContent = professor.name_teacher || "Nome do Professor";
        if (cargoPerfil) cargoPerfil.textContent = professor.function_teacher || "Professor";
        
        // Define se exibe a imagem de perfil ou o ícone de usuário vazio
        if (imgContainer) {
            if (professor.img_teacher) {
                // Se tiver imagem no banco, renderiza a tag IMG
                imgContainer.innerHTML = `<img src="/uploads/${professor.img_teacher}" class="imgPerfil" id="teacherImg" alt="Foto do Professor">`;
            } else {
                // Se NÃO tiver imagem, insere o ícone de usuário padrão da sua biblioteca UIcons
                imgContainer.innerHTML = `<i class="fi fi-rr-user" id="teacherImg" style="font-size: 40px; color: #ccc; background: #f0f0f0; padding: 10px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; width: 50px; height: 50px;"></i>`;
            }
        }

        // 2. Preenche os campos da aba "Configurações Pessoais" dinamicamente
        if (formConfig) {
            const inputs = formConfig.querySelectorAll('input');
            if (inputs.length >= 3) {
                inputs[0].value = professor.name_teacher || "";
                inputs[1].value = professor.email_teacher || "";
                inputs[2].value = professor.function_teacher || "Professor";
            }
        }

    } catch (err) {
        console.error("Erro ao carregar perfil do professor:", err);
        if (imgContainer) {
            imgContainer.innerHTML = `<i class="fi fi-rr-user" style="font-size: 40px; color: #ccc;"></i>`;
        }
    }
}

// Array global para armazenar todos os arquivos selecionados consecutivamente
let arquivosAcumulados = [];

const newProjectArchives = document.getElementById('newProjectArchives');
const fileListContainer = document.getElementById('fileListContainer');

if (newProjectArchives && fileListContainer) {

    newProjectArchives.addEventListener('change', function(e) {
        // Transforma a FileList do input em um Array nativo
        const novosArquivos = Array.from(e.target.files);

        // Adiciona os novos arquivos ao nosso histórico acumulado
        novosArquivos.forEach(arquivo => {
            // Opcional: evita duplicados com o mesmo nome e tamanho
            const jaExiste = arquivosAcumulados.some(arq => arq.name === arquivo.name && arq.size === arquivo.size);
            if (!jaExiste) {
                arquivosAcumulados.push(arquivo);
            }
        });

        // Atualiza a interface da tela
        renderizarListaArquivos();

        // Limpa o valor do input para que o navegador detecte se o usuário selecionar o mesmo arquivo novamente
        newProjectArchives.value = '';
    });
}

// Função responsável por desenhar os arquivos na tela
function renderizarListaArquivos() {
    fileListContainer.innerHTML = ''; // Limpa a listagem visual anterior

    arquivosAcumulados.forEach((arquivo, index) => {
        const extensao = arquivo.name.split('.').pop().toLowerCase();
        let icone = 'fi-rr-document';

        if (extensao === 'pdf') icone = 'fi-rr-file-pdf';
        else if (['xls', 'xlsx', 'csv'].includes(extensao)) icone = 'fi-rr-file-excel';
        else if (['doc', 'docx'].includes(extensao)) icone = 'fi-rr-file-word';

        // Cria a estrutura do item
        const fileItem = document.createElement('div');
        fileItem.classList.add('file-item');

        fileItem.innerHTML = `
            <div class="file-item-info">
                <i class="fi ${icone}"></i>
                <span>${arquivo.name}</span>
            </div>
            <button class="remove-file-btn" data-index="${index}">
                <i class="fi fi-rr-trash"></i>
            </button>
        `;

        // Adiciona o evento para remover o arquivo específico da lista caso clique na lixeira
        fileItem.querySelector('.remove-file-btn').addEventListener('click', function(e) {
            const idx = parseInt(this.getAttribute('data-index'));
            arquivosAcumulados.splice(idx, 1); // Remove do array
            renderizarListaArquivos(); // Redesenha a lista atualizada
        });

        fileListContainer.appendChild(fileItem);
    });
}


// JS para a SearchBar

const searchInput = document.querySelector('.searchInput')

searchInput.addEventListener('input', (event) => {

    const value = FormaString(event.target.value)

    const items = document.querySelectorAll(".ProjectAnalizying")

    const noResultsForSearch = document.querySelectorAll('.noResultsForSearch')

    let hasResults = false

    items.forEach(item =>{
        if (FormaString(item.textContent).indexOf(value) !== -1) {
            item.style.display = 'flex'

            hasResults = true
        }
        else {
            item.style.display = 'none'
        }
    })

    if (noResultsForSearch) {
        if (hasResults) {
            noResultsForSearch.style.display = 'none'
        }
        else {
            noResultsForSearch.style.display = 'block'
        }   
    }
    

})

function FormaString(value) {
    return value.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

// JS para o Modal

const openModal = document.querySelectorAll('.postagem-card')

openModal.forEach(button => {
    button.addEventListener('click', () => {
        const modalID = button.getAttribute('data-modal')
        const modal = document.getElementById(modalID)

        modal.showModal() 
    })
})

const closeModal = document.querySelectorAll('.closeModal')

closeModal.forEach(button => {
    button.addEventListener('click', () => {
        const modalID = button.getAttribute('data-modal')
        const modal = document.getElementById(modalID)

        modal.close()
    })
})

// === INTERCEPTAR O ENVIO DO FORMULÁRIO E ENVIAR COM OS ARQUIVOS ACUMULADOS ===

const formAddProject = document.getElementById('formAddProject');

if (formAddProject) {
    formAddProject.addEventListener('submit', function(e) {
        e.preventDefault(); 
        
        const formData = new FormData(formAddProject);

        formData.delete('newProjectArchives');
        
        if (arquivosAcumulados.length === 0) {
            alert('Por favor, adicione ao menos um arquivo ao projeto.');
            return;
        }

        arquivosAcumulados.forEach(arquivo => {
            
            formData.append('newProjectArchives', arquivo);
        });

        fetch('/apis/projects/cadastrar', {
            method: 'POST',
            body: formData 
        })

        .then(async response => {
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.mensagem || 'Erro ao publicar projeto.');
            }
            return data;
        })
        .then(data => {
            alert('Projeto publicado com sucesso!');
            
            window.location.reload(); 
        })
        .catch(error => {
            console.error('Erro no envio:', error);
            alert(error.message);
        });
    });
}

// FETCH API para adicionar projetos

// VARIÁVEIS GLOBAIS PARA ARMAZENAR OS DADOS LOGO APÓS O FETCH
let listaProjetosPendentes = [];
let listaProjetosAnalisados = [];

// ==========================================
// 1. CARREGAR PROJETOS PENDENTES (Rota: /pendentes)
// ==========================================
// Antes: const response = await fetch('/pendentes');
// Depois (Correto):
// Projetos Pendentes
async function loadProjects() {
    const container = document.getElementById("listProjectsTeacher");
    if (!container) return;
    try {
        const response = await fetch('/apis/projects/pendentes'); // Correto!
        if (!response.ok) throw new Error("Erro ao buscar projetos pendentes");
        listaProjetosPendentes = await response.json();
        renderizarProjetos(listaProjetosPendentes, container, false);
    } catch (err) { console.error(err); }
}

// Projetos Analisados
async function loadAnalyzedProjects() {
    const container = document.getElementById("listAnalyzedProjectsTeacher"); 
    if (!container) return;
    try {
        const response = await fetch('/apis/projects/analisados'); // Correto!
        if (!response.ok) throw new Error("Erro ao buscar projetos analisados");
        listaProjetosAnalisados = await response.json();
        renderizarProjetos(listaProjetosAnalisados, container, true); 
    } catch (err) { console.error(err); }
}

// ==========================================
// 3. FUNÇÃO AUXILIAR DE RENDERIZAÇÃO DOS CARDS
// ==========================================
function renderizarProjetos(projetos, container, ehAnalisado) {
    const noResults = container.parentElement.querySelector('.noResultsForSearch');
    
    if (projetos.length === 0) {
        if (noResults) noResults.style.display = 'block';
        container.innerHTML = '';
        return;
    }

    if (noResults) noResults.style.display = 'none';
    container.innerHTML = '';

    projetos.forEach(projeto => {
        const statusClass = projeto.status_project === 'analisado' ? 'status-analisado' : 'status-pendente';
        const card = document.createElement('div');
        
        // CORREÇÃO: Força o card dinâmico a se comportar como bloco fluido dentro do container pai
        card.classList.add('ProjectAnalizying'); 
        
        card.setAttribute('data-name', (projeto.name_project || '').toLowerCase());
        card.setAttribute('data-class', projeto.class_project || '');
        card.setAttribute('data-date', projeto.date_project || ''); 

        card.innerHTML = `
                <div class="textContentOfProject" style="width: 100%;">
                    <div class="containerCard">
                        <button class="postagem-card" data-modal="modal-${projeto.id_project}">
                            <div class="postagem-topo">
                                <img src="/uploads/${projeto.img_project || 'default.png'}">
                            </div>
                            <div class="postagem-cont">
                                <h3>${projeto.name_project || 'Sem Título'}</h3>
                                <p>${projeto.description_project || 'Sem descrição.'}</p>
                            </div>
                            <div class="postagem-inf">
                                <span>${projeto.creators_project || 'Não informado'}</span>
                                <span>${projeto.date_project || ''}</span>
                            </div>
                        </button>
                    </div>

                    <dialog id="modal-${projeto.id_project}" class="modalWindow">
                        <button data-modal="modal-${projeto.id_project}" class="closeModal">
                            <i class="fi-rr-x"></i>
                        </button>

                        <div class="imgProjectDetails">
                            <img src="/uploads/${projeto.img_project || 'default.png'}" alt="Imagem do Projeto">
                        </div>

                        <div class="modalDetails">
                            <h1>${projeto.name_project || 'Sem Título'}</h1>

                            <div class="lineDetail">
                                <i class="fi-rr-users"></i>
                                <div>
                                    <p class="listOfContentTittle">Criadores</p>
                                    <p>${projeto.creators_project || 'Não informado'}</p>
                                </div>
                            </div>

                            <div class="lineDetail">
                                <i class="fi-rr-calendar"></i>
                                <div>
                                    <p class="listOfContentTittle">Data de Postagem</p>
                                    <p>${projeto.date_project || 'Não informada'}</p>
                                </div>
                            </div>

                            <div class="lineDetail">
                                <i class="fi-rr-document"></i>
                                <div>
                                    <p class="listOfContentTittle">Categoria</p>
                                    <p>${projeto.category_project || 'Não definida'}</p>
                                </div>
                            </div>

                            <div class="lineDetail">
                                <i class="fi-rr-users"></i>
                                <div>
                                    <p class="listOfContentTittle">Turma</p>
                                    <p>${projeto.class_project || 'Não definida'}</p>
                                </div>
                            </div>

                            <div class="lineDetail">
                                <i class="fi-rr-users"></i>
                                <div>
                                    <p class="listOfContentTittle">Professor Orientador</p>
                                    <p>${projeto.teacher_project || 'Não atribuído'}</p>
                                </div>
                            </div>

                            <div class="lineDetail">
                                <i class="fi-rr-folder"></i>
                                <div>
                                    <p class="listOfContentTittle">Arquivos do projeto</p>
                                    <div id="modalFilesContainer-${projeto.id_project}" class="files-download-box">
                                        ${gerarLinksArquivos(projeto.archives_project)}
                                    </div>
                                </div>
                            </div>

                            <div class="lineDetail">
                                <i class="fi-rr-info"></i>
                                <div>
                                    <p class="listOfContentTittle">Status</p>
                                    <p class="ModalStatus ${statusClass}">${projeto.status_project || 'Pendente'}</p>
                                </div>
                            </div>
                                
                            <div class="lineDetail">
                                <i class="fi-rr-text"></i>
                                <div>
                                    <p class="listOfContentTittle">Descrição</p>
                                    <p class="modalDesc">${projeto.description_project || 'Sem descrição disponível.'}</p>
                                </div>
                            </div>

                            <div>
                                <label for="textarea-${projeto.id_project}" class="listOfContentTittle">Texto de Análise</label>
                                <textarea id="textarea-${projeto.id_project}" class="analysis-textarea" placeholder="Digite aqui sua análise do projeto..."></textarea>
                                <button type="button" class="sendAnalizy" data-id="${projeto.id_project}" style="margin-top: 10px; background: #5cb85c; color: #fff; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer;">
                                    <i class="fi fi-rr-paper-plane"></i> Enviar Análise
                                </button>
                            </div>

                        </div>
                    </dialog>
                </div>
            `;

        container.appendChild(card);
    });

    inicializarEventosModais();
}

// Auxiliar para quebrar a string de arquivos separados por vírgula em links <a>
function gerarLinksArquivos(archivesString) {
    if (!archivesString) return '<p>Nenhum arquivo anexado.</p>';
    return archivesString.split(',').map(arq => {
        const nomeLimpo = arq.trim();
        return `<a href="/uploads/${nomeLimpo}" download="${nomeLimpo}" class="download-file-btn"><i class="fi fi-rr-document"></i> ${nomeLimpo}</a>`;
    }).join('');
}

// ==========================================
// 4. ENVIO DA ANÁLISE (Rota: PUT /apis/projects/analisar/:id)
// ==========================================
document.addEventListener('click', async function(e) {
    if (e.target && e.target.classList.contains('sendAnalizy')) {
        const idProjeto = e.target.getAttribute('data-id');
        const textRevisao = document.getElementById(`textarea-${idProjeto}`).value;

        if (!textRevisao.trim()) {
            alert("Por favor, digite um texto para a análise.");
            return;
        }

        try {
            // CORREÇÃO: Adicionado o prefixo correto da API (/apis/projects)
            const response = await fetch(`/apis/projects/analisar/${idProjeto}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    analysis_text: textRevisao,
                    teacher_name: "Professor Logado", 
                    status_project: 'analisado'
                })
            });

            if (response.ok) {
                alert("Análise enviada com sucesso!");
                document.getElementById(`modal-${idProjeto}`).close();
                
                // Atualiza tudo de forma assíncrona e fluida
                loadProjects();
                loadAnalyzedProjects();
                carregarDashboardInicio(); 
            }
        } catch (err) {
            console.error("Erro na requisição PUT:", err);
        }
    }
});

// ==========================================
// 5. SISTEMA DE FILTRAGEM (INTEGRAÇÃO COM OS SELECTS DO SEU HTML)
// ==========================================
function aplicarFiltros(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const secaoPai = container.closest('.contentTab');
    const searchInput = secaoPai.querySelector('.searchInput').value.toLowerCase();
    const alfabeticOrder = secaoPai.querySelector('select[name="alfabeticOrder"]').value;
    const dateOrder = secaoPai.querySelector('select[name="dateOrder"]').value;
    const classOrder = secaoPai.querySelector('select[name="classOrder"]').value;

    let cards = Array.from(container.querySelectorAll('.ProjectAnalizying'));
    let encontrouAlgum = false;

    // 1. Filtro de Visibilidade (Texto da Busca e Turma)
    cards.forEach(card => {
        const nome = card.getAttribute('data-name');
        const turma = card.getAttribute('data-class');

        const bateNome = nome.includes(searchInput);
        // Verifica se a opção selecionada bate com a turma (ex: "TI-2024-C") ou se está em lote padrão
        const bateTurma = (classOrder === "" || classOrder.includes(turma) || turma.includes(classOrder));

        if (bateNome && bateTurma) {
            card.style.display = "";
            encontrouAlgum = true;
        } else {
            card.style.display = "none";
        }
    });

    // Exibe ou oculta a mensagem de "Nenhum resultado encontrado"
    const noResults = secaoPai.querySelector('.noResultsForSearch');
    if (noResults) noResults.style.display = encontrouAlgum ? 'none' : 'block';

    // 2. Ordenação A-Z / Z-A
    if (alfabeticOrder === 'az_order') {
        cards.sort((a, b) => a.getAttribute('data-name').localeCompare(b.getAttribute('data-name')));
    } else if (alfabeticOrder === 'za_order') {
        cards.sort((a, b) => b.getAttribute('data-name').localeCompare(a.getAttribute('data-name')));
    }

    // Reordena fisicamente no DOM baseado nos selects
    cards.forEach(card => container.appendChild(card));
}

// Ouvintes de eventos para capturar digitação e cliques nos filtros do seu HTML
document.querySelectorAll('.contentTab').forEach(aba => {
    const inputBusca = aba.querySelector('.searchInput');
    const selects = aba.querySelectorAll('.selectFilter');
    const containerProjetos = aba.querySelector('.alaizyProjects');

    if (containerProjetos) {
        const idContainer = containerProjetos.id;

        if (inputBusca) {
            inputBusca.addEventListener('input', () => aplicarFiltros(idContainer));
        }
        selects.forEach(sel => {
            sel.addEventListener('change', () => aplicarFiltros(idContainer));
        });
    }
});

function inicializarEventosModais() {
    // Evento para abrir o modal correspondente ao card
    document.querySelectorAll('.postagem-card').forEach(btn => {
        btn.onclick = function() {
            const idModal = this.getAttribute('data-modal');
            const modal = document.getElementById(idModal);
            if (modal) modal.showModal();
        }
    });

    // Evento para fechar o modal
    document.querySelectorAll('.closeModal').forEach(btn => {
        btn.onclick = function() {
            const idModal = this.getAttribute('data-modal');
            const modal = document.getElementById(idModal);
            if (modal) modal.close();
        }
    });
}

// =========================================================================
// ATUALIZAÇÃO AUTOMÁTICA DA ABA INÍCIO (DASHBOARD)
// =========================================================================
async function carregarDashboardInicio() {
    const activityList = document.querySelector('#start .activity-list');
    const cardPendentes = document.querySelector('#start .card:nth-child(1) h3');
    const cardAnalisados = document.querySelector('#start .card:nth-child(2) h3');

    try {
        // Faz a requisição para a rota específica do dashboard inicial
        const response = await fetch('/apis/projects/dashboard-inicio');
        if (!response.ok) throw new Error("Erro ao carregar dados do dashboard.");

        const data = await response.json();

        // 1. Atualiza os contadores dos Cards informativos
        if (cardPendentes) {
            cardPendentes.textContent = `${data.totalPendentes || 0} Pendentes`;
        }
        if (cardAnalisados) {
            // Nota: Se o banco contabilizar apenas aceitos no totalProjetos, adaptamos dinamicamente
            cardAnalisados.textContent = `${data.totalProjetos || 0} Aprovados`;
            const cardAnalisadosSub = document.querySelector('#start .card:nth-child(2) p');
            if (cardAnalisadosSub) cardAnalisadosSub.textContent = "Projetos publicados";
        }

        // 2. Atualiza a lista de Atividades Recentes baseada no log do back-end
        if (activityList) {
            activityList.innerHTML = ''; // Limpa os dados estáticos/mocado do HTML

            if (!data.atividades || data.atividades.length === 0) {
                activityList.innerHTML = '<p style="padding: 15px; color: #777;">Nenhuma atividade registrada no sistema.</p>';
                return;
            }

            data.atividades.forEach(atividade => {
                const item = document.createElement('div');
                item.classList.add('activity-item');

                // Define a classe da bolinha indicadora de cor dinamicamente
                let dotColor = 'dot-blue';
                if (atividade.status === 'orange') dotColor = 'dot-orange';
                if (atividade.status === 'sucesso') dotColor = 'dot-green';

                item.innerHTML = `
                    <div class="activity-text">
                        <span class="dot ${dotColor}"></span>
                        <p>${atividade.descricao}</p>
                    </div>
                    <span class="activity-time">${atividade.tempo_passado}</span>
                `;
                activityList.appendChild(item);
            });
        }

    } catch (error) {
        console.error("Falha ao atualizar a aba Início:", error);
    }
}

// =========================================================================
// INTEGRAÇÃO COM SEUS EVENTOS EXISTENTES
// =========================================================================

// Modifique o bloco DOMContentLoaded para incluir a nova função:
document.addEventListener("DOMContentLoaded", () => {
    carregarDadosProfessor
    loadProjects();
    loadAnalyzedProjects();
    carregarDashboardInicio(); // Carrega os dados da aba Início assim que entra na página
});
