document.getElementById("menuButton").addEventListener('click', () => {
    document.getElementById('header').classList.toggle('movimentHeader')
    document.getElementById('menuSide').classList.toggle('openMenuSide')
    document.getElementById('contentContainerId').classList.toggle('contentContainer')
})

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

// === SISTEMA DE BUSCA E SELEÇÃO DINÂMICA DE CRIADORES/COLABORADORES ===

let criadoresSelecionados = []; // Array que guardará os IDs dos alunos selecionados

const creatorsInput = document.getElementById('newProjectCreatorsInput');
const suggestionsList = document.getElementById('creatorsSuggestionsList');
const selectedContainer = document.getElementById('selectedCreatorsContainer');

if (creatorsInput && suggestionsList && selectedContainer) {
    
    // Evento de digitação para buscar usuários
    creatorsInput.addEventListener('input', async function(e) {
        const query = e.target.value.trim();
        
        // Só busca se o usuário digitar pelo menos 2 caracteres
        if (query.length < 2) {
            suggestionsList.innerHTML = '';
            suggestionsList.style.display = 'none';
            return;
        }

        try {
            // Rota fictícia /apis/users/buscar (ajustaremos quando você mandar o back-end)
            // No portal_aluno.js (Aproximadamente linha 83)
            // Mude para /apis/auth/buscar:
            const response = await fetch(`/apis/auth/buscar?search=${encodeURIComponent(query)}`);
            if (!response.ok) throw new Error("Erro ao buscar usuários");
            
            const usuarios = await response.json();
            
            renderizarSugestoes(usuarios);
        } catch (err) {
            console.error("Erro na busca de colaboradores:", err);
        }
    });

    // Fecha a lista de sugestões se clicar fora do container
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.creators-search-container')) {
            suggestionsList.style.display = 'none';
        }
    });
}

// Função para renderizar a lista suspensa de usuários encontrados
function renderizarSugestoes(usuarios) {
    suggestionsList.innerHTML = '';
    
    if (usuarios.length === 0) {
        suggestionsList.innerHTML = '<li class="no-suggestion">Nenhum usuário encontrado</li>';
        suggestionsList.style.display = 'block';
        return;
    }

    usuarios.forEach(usuario => {
        // Evita mostrar na lista alguém que já foi selecionado
        const jaSelecionado = criadoresSelecionados.some(u => u.id === usuario.id);
        if (jaSelecionado) return;

        const li = document.createElement('li');
        li.className = 'suggestion-item';
        li.innerHTML = `
            <div class="user-suggest-info">
                <strong>${usuario.nome}</strong>
                <span>(${usuario.email})</span>
            </div>
        `;

        // Ao clicar no usuário da lista
        li.addEventListener('click', () => {
            adicionarCriador(usuario);
            creatorsInput.value = ''; // Limpa o input
            suggestionsList.innerHTML = '';
            suggestionsList.style.display = 'none';
        });

        suggestionsList.appendChild(li);
    });

    suggestionsList.style.display = 'block';
}

// Função para adicionar o usuário ao array e criar a tag visual
function adicionarCriador(usuario) {
    criadoresSelecionados.push(usuario);
    renderizarTagsCriadores();
}

// Função que desenha as tags na tela
function renderizarTagsCriadores() {
    selectedContainer.innerHTML = '';

    criadoresSelecionados.forEach((usuario, index) => {
        const tag = document.createElement('div');
        tag.className = 'creator-tag';
        tag.innerHTML = `
            <span>${usuario.nome}</span>
            <button type="button" class="remove-tag-btn" data-index="${index}">&times;</button>
        `;

        // Evento para remover a tag/criador
        tag.querySelector('.remove-tag-btn').addEventListener('click', function() {
            const idx = parseInt(this.getAttribute('data-index'));
            criadoresSelecionados.splice(idx, 1);
            renderizarTagsCriadores();
        });

        selectedContainer.appendChild(tag);
    });
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

        if (criadoresSelecionados.length === 0) {
            alert('Por favor, adicione pelo menos um criador ao projeto.');
            return;
        }
        formData.append('creatorsIds', JSON.stringify(criadoresSelecionados.map(u => u.id)));
            
        fetch('/apis/projects/cadastrar', {
            method: 'POST',
            body: formData, 
            credentials: 'include'
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

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('listProjectsTeacher')) {
        loadProjects()
    }

    // NOVA VERIFICAÇÃO: Se existir o container de "Meus Projetos", carrega-os
    if (document.getElementById('listMyProjects')) {
        loadMyProjects();
    }

    // NOVA CHAMADA AUTOMÁTICA: Carrega os dados da aba Início se ela existir na tela
    if (document.getElementById('start')) {
        loadDashboardData();
    }
})

async function loadMyProjects() {
    const container = document.getElementById("listMyProjects");
    const noResultsForSearch = document.querySelector('.noResultsForSearch');
    
    try {
        const response = await fetch('/apis/projects/my_projects');
        if (!response.ok) throw new Error("Erro ao buscar projetos no servidor");

        const projetos = await response.json();

        if (projetos.length === 0) {
            if (noResultsForSearch) noResultsForSearch.style.display = 'block';
            return;
        }

        if (noResultsForSearch) noResultsForSearch.style.display = 'none';
        container.innerHTML = '';

        projetos.forEach(projeto => {
            const projetoCard = document.createElement('div');
            projetoCard.classList.add('alaizyProjects'); // Mantido conforme seu padrão CSS

            // Tratamento dinâmico de Status
            let statusClass = 'status-pendente';
            let statusTexto = 'Em análise';
            if (projeto.status_project === 'aprovado' || projeto.status_project === 'analisado') {
                statusClass = 'status-aprovado';
                statusTexto = 'Aprovado';
            } else if (projeto.status_project === 'rejeitado') {
                statusClass = 'status-rejeitado';
                statusTexto = 'Recusado';
            }

            // ATENÇÃO: Verifique se os nomes após 'projeto.' batem com as chaves do seu JSON do Back-end
            projetoCard.innerHTML = `
                <div class="textContentOfProject">
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
                                    <div id="modalFilesContainer-${projeto.id_project}" class="files-download-box"></div>
                                </div>
                            </div>

                            <div class="lineDetail">
                                <i class="fi-rr-info"></i>
                                <div>
                                    <p class="listOfContentTittle">Status</p>
                                    <p class="ModalStatus ${statusClass}">${projeto.status_project}</p>
                                </div>
                            </div>
                                
                            <div class="lineDetail">
                                <i class="fi-rr-text"></i>
                                <div>
                                    <p class="listOfContentTittle">Descrição</p>
                                    <p class="modalDesc">${projeto.description_project || 'Sem descrição disponível.'}</p>
                                </div>
                            </div>

                            <div class="lineDetail action-box">
                                <button type="button" class="btn-editar-gatilho" id="edit-btn-${projeto.id_project}" style="background: #0275d8; color: #fff; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer;">
                                    <i class="fi fi-rr-edit"></i> Editar Características do Projeto
                                </button>
                            </div>

                        </div>
                    </dialog>
                </div>
            `;
            container.appendChild(projetoCard);

            // Vincula o evento do botão de editar recém-injetado
            const gatilhoEdicao = document.getElementById(`edit-btn-${projeto.id_project}`);
            if (gatilhoEdicao) {
                gatilhoEdicao.addEventListener('click', (e) => {
                    e.preventDefault();
                    
                    // Fecha a janela de visualização do modal atual
                    const modalVisualizar = document.getElementById(`modal-${projeto.id_project}`);
                    if (modalVisualizar) modalVisualizar.close();
                    
                    // Inicia o processo de preenchimento do formulário passando o objeto 'projeto' vindo do banco
                    abrirEdicaoProjeto(projeto);
                });
            }

            // Renderização dos links de download dos arquivos
            const filesContainer = document.getElementById(`modalFilesContainer-${projeto.id_project}`);
            if (filesContainer && projeto.archives_project) {
                const listaArquivos = projeto.archives_project.split(',');

                listaArquivos.forEach(nomeArquivo => {
                    nomeArquivo = nomeArquivo.trim(); 
                    if (!nomeArquivo) return;

                    const linkDownload = document.createElement('a');
                    linkDownload.href = `/uploads/${nomeArquivo}`;
                    linkDownload.download = nomeArquivo;
                    linkDownload.classList.add('download-file-btn');
                    
                    const extensao = nomeArquivo.split('.').pop().toLowerCase();
                    let icone = 'fi-rr-document';
                    if (extensao === 'pdf') icone = 'fi-rr-file-pdf';
                    else if (['xls', 'xlsx', 'csv'].includes(extensao)) icone = 'fi-rr-file-excel';
                    else if (['doc', 'docx'].includes(extensao)) icone = 'fi-rr-file-word';

                    linkDownload.innerHTML = `
                        <i class="fi ${icone}"></i>
                        <span>Baixar Arquivo (${extensao.toUpperCase()})</span>
                    `;
                    filesContainer.appendChild(linkDownload);
                });
            }
        });

        rebinModalEvents();

    } catch (err) {
        console.error('Erro ao carregar projetos: ', err);
    }
}

function rebinModalEvents() {
    document.querySelectorAll('.postagem-card').forEach(button => {
        button.onclick = (e) => {
            e.preventDefault()
            const modalID = button.getAttribute('data-modal')
            const modal = document.getElementById(modalID)
            if(modal) {
                modal.showModal()
            }
        }
    })

    document.querySelectorAll('.closeModal').forEach(button => {
        button.onclick = (e) => {
            e.preventDefault();
            const modalID = button.getAttribute('data-modal')
            const modal = document.getElementById(modalID)
            if(modal) {
                modal.close()
            }
        }
    })
}

// Função responsável por atualizar os cards e a atividade recente
async function loadDashboardData() {
    try {
        const response = await fetch('/apis/projects/dashboard');
        if (!response.ok) throw new Error("Erro ao buscar dados do painel do aluno");

        const data = await response.json();

        // 1. Atualiza os textos dos cards dinamicamente
        const cardsText = document.querySelectorAll('.cards-grid .card .card-details h3');
        if (cardsText.length >= 3) {
            cardsText[0].innerText = `${data.totalProjetos} Projetos`;
            cardsText[1].innerText = `${data.totalPendentes} Pendentes`;
            cardsText[2].innerText = `${data.totalColaboracoes} Colaborações`;
        }

        // 2. Atualiza a lista visual de "Atividade Recente"
        const activityList = document.querySelector('.activity-list');
        if (activityList) {
            if (!data.atividades || data.atividades.length === 0) {
                activityList.innerHTML = '<p style="padding: 15px; color: #777;">Nenhuma atividade recente encontrada.</p>';
                return;
            }

            activityList.innerHTML = ''; // Limpa as duas atividades estáticas que estavam no HTML

            data.atividades.forEach(ativ => {
                const item = document.createElement('div');
                item.classList.add('activity-item');

                // Escolhe a classe de cor da bolinha baseada no tipo mapeado no backend
                let dotClass = 'dot-orange';
                if (ativ.tipo === 'edicao') dotClass = 'dot-blue';
                if (ativ.tipo === 'aprovado') dotClass = 'dot-green'; // se quiser adicionar .dot-green no CSS

                item.innerHTML = `
                    <div class="activity-text">
                        <span class="dot ${dotClass}"></span>
                        <p>${ativ.descricao}</p>
                    </div>
                    <span class="activity-time">${ativ.tempo_passado}</span>
                `;
                activityList.appendChild(item);
            });
        }
    } catch (err) {
        console.error('Erro ao processar informações do Dashboard:', err);
    }
}

// === SISTEMA DE CONTROLE DE ESTADOS DE EDIÇÃO (TOTALMENTE CORRIGIDO) ===
let editandoProjetoId = null;
let arquivosRemovidosNoEdit = []; 
let arquivosOriginaisDoProjeto = []; 

// Elementos específicos do Modal de Edição mapeados via ID
const editCreatorsInput = document.getElementById('editProjectCreatorsInput');
const editSuggestionsList = document.getElementById('editCreatorsSuggestionsList');
const editProjectImg = document.getElementById('editProjectImg');
const editProjectArchives = document.getElementById('editProjectArchives');

// 1. LISTENER PARA PREVIEW DA IMAGEM DENTRO DO MODAL DE EDIÇÃO
if (editProjectImg) {
    editProjectImg.addEventListener('change', function(e) {
        const editSpanAddArchive = document.querySelector('.editSpanAddArchive');
        const inputImg = e.target;
        const img = inputImg.files[0];

        if (img && editSpanAddArchive) {
            const reader = new FileReader();
            reader.addEventListener('load', function(e) {
                editSpanAddArchive.innerHTML = `<img src="${e.target.result}" class="newAddImg">`;
            });
            reader.readAsDataURL(img);
        }
    });
}

// 2. LISTENER PARA NOVOS DOCUMENTOS ADICIONADOS CONSECUTIVAMENTE NA EDIÇÃO
if (editProjectArchives) {
    editProjectArchives.addEventListener('change', function(e) {
        const novosArquivos = Array.from(e.target.files);

        novosArquivos.forEach(arquivo => {
            const jaExiste = arquivosAcumulados.some(arq => arq.name === arquivo.name && arq.size === arquivo.size);
            if (!jaExiste) {
                arquivosAcumulados.push(arquivo);
            }
        });

        // Atualiza a listagem visual específica da edição
        renderizarListaArquivosEdicao();
        editProjectArchives.value = ''; 
    });
}

// 3. BUSCA DINÂMICA DE USUÁRIOS DENTRO DO MODAL DE EDIÇÃO
if (editCreatorsInput && editSuggestionsList) {
    editCreatorsInput.addEventListener('input', async function(e) {
        const query = e.target.value.trim();
        
        if (query.length < 2) {
            editSuggestionsList.innerHTML = '';
            editSuggestionsList.style.display = 'none';
            return;
        }

        try {
            const response = await fetch(`/apis/auth/buscar?search=${encodeURIComponent(query)}`);
            if (!response.ok) throw new Error("Erro ao buscar usuários");
            
            const usuarios = await response.json();
            renderizarSugestoesEdicao(usuarios);
        } catch (err) {
            console.error("Erro na busca de colaboradores na edição:", err);
        }
    });

    document.addEventListener('click', function(e) {
        if (!e.target.closest('.modal-edit-container')) {
            editSuggestionsList.style.display = 'none';
        }
    });
}

// Renderiza a lista suspensa de busca focada no modal de edição
function renderizarSugestoesEdicao(usuarios) {
    editSuggestionsList.innerHTML = '';
    
    if (usuarios.length === 0) {
        editSuggestionsList.innerHTML = '<li class="no-suggestion">Nenhum usuário encontrado</li>';
        editSuggestionsList.style.display = 'block';
        return;
    }

    usuarios.forEach(usuario => {
        const jaSelecionado = criadoresSelecionados.some(u => u.id === usuario.id);
        if (jaSelecionado) return;

        const li = document.createElement('li');
        li.className = 'suggestion-item';
        li.innerHTML = `
            <div class="user-suggest-info">
                <strong>${usuario.nome}</strong>
                <span>(${usuario.email})</span>
            </div>
        `;

        li.addEventListener('click', () => {
            criadoresSelecionados.push(usuario);
            renderizarTagsCriadoresEdicao(); // Atualiza as tags visuais na edição
            editCreatorsInput.value = ''; 
            editSuggestionsList.innerHTML = '';
            editSuggestionsList.style.display = 'none';
        });

        editSuggestionsList.appendChild(li);
    });

    editSuggestionsList.style.display = 'block';
}

// Renderiza as tags visuais de criadores específicas do modal de edição
function renderizarTagsCriadoresEdicao() {
    const editSelectedContainer = document.getElementById('editSelectedCreatorsContainer');
    if (!editSelectedContainer) return;

    editSelectedContainer.innerHTML = '';

    criadoresSelecionados.forEach((usuario, index) => {
        const tag = document.createElement('div');
        tag.className = 'creator-tag';
        tag.innerHTML = `
            <span>${usuario.nome || usuario.name}</span>
            <button type="button" class="remove-tag-btn" data-index="${index}">&times;</button>
        `;

        tag.querySelector('.remove-tag-btn').addEventListener('click', function() {
            const idx = parseInt(this.getAttribute('data-index'));
            criadoresSelecionados.splice(idx, 1);
            renderizarTagsCriadoresEdicao();
        });

        editSelectedContainer.appendChild(tag);
    });
}

// 4. FUNÇÃO QUE MAPEIA, CARREGA E ABRE O MODAL DE EDIÇÃO
function abrirEdicaoProjeto(projeto) {
    editandoProjetoId = projeto.id_project;
    arquivosAcumulados = []; 
    arquivosRemovidosNoEdit = []; 
    
    const form = document.getElementById('formEditProject');
    if(!form) return;

    // Injeta os valores textuais permitidos
    form.querySelector('[name="editProjectName"]').value = projeto.name_project || '';
    form.querySelector('[name="editProjectDescription"]').value = projeto.description_project || '';
    
    // Injeta a categoria atual no select travado (apenas para visualização do que já foi salvo)
    if(form.querySelector('[name="category_project"]')) {
        form.querySelector('[name="category_project"]').value = projeto.category_project || 'Geral';
    }

    // Define a imagem salva no banco como preview inicial do modal
    const editSpanAddArchive = document.querySelector('.editSpanAddArchive');
    if (editSpanAddArchive) {
        editSpanAddArchive.innerHTML = `<img src="/uploads/${projeto.img_project || 'default.png'}" class="newAddImg">`;
    }

    // Carrega os colaboradores atuais mapeando para a visualização correta
    criadoresSelecionados = projeto.creators_lista ? [...projeto.creators_lista] : [];
    renderizarTagsCriadoresEdicao(); 

    // Processa os arquivos originais vindos da string do banco de dados
    if (projeto.archives_project) {
        arquivosOriginaisDoProjeto = projeto.archives_project.split(',').map(f => f.trim()).filter(Boolean);
    } else {
        arquivosOriginaisDoProjeto = [];
    }

    // Renderiza a lista mesclada (salvos + novos acumulados)
    renderizarListaArquivosEdicao();

    // Abre a janela modal de edição
    const modalEditar = document.getElementById('modalEditarProjeto');
    if (modalEditar) modalEditar.showModal();
}

// Renderizador focado estritamente no container de arquivos da Edição
function renderizarListaArquivosEdicao() {
    const fileListContainer = document.getElementById('editFileListContainer');
    if (!fileListContainer) return;

    fileListContainer.innerHTML = ''; 

    // Renderizar Arquivos Originais que ainda continuam ativos (não removidos)
    arquivosOriginaisDoProjeto.forEach(nomeArquivo => {
        if (arquivosRemovidosNoEdit.includes(nomeArquivo)) return;

        const extensao = nomeArquivo.split('.').pop().toLowerCase();
        let icone = 'fi-rr-document';
        if (extensao === 'pdf') icone = 'fi-rr-file-pdf';
        else if (['xls', 'xlsx', 'csv'].includes(extensao)) icone = 'fi-rr-file-excel';
        else if (['doc', 'docx'].includes(extensao)) icone = 'fi-rr-file-word';

        const fileItem = document.createElement('div');
        fileItem.classList.add('file-item');
        fileItem.style.borderLeft = "4px solid #f0ad4e"; 

        fileItem.innerHTML = `
            <div class="file-item-info">
                <i class="fi ${icone}"></i>
                <span>${nomeArquivo} <small style="color: #999;">(Salvo)</small></span>
            </div>
            <button type="button" class="remove-old-file-btn" data-name="${nomeArquivo}">
                <i class="fi fi-rr-trash"></i>
            </button>
        `;

        fileItem.querySelector('.remove-old-file-btn').addEventListener('click', function(e) {
            e.preventDefault();
            const name = this.getAttribute('data-name');
            arquivosRemovidosNoEdit.push(name);
            renderizarListaArquivosEdicao(); // Redesenha aplicando o filtro
        });

        fileListContainer.appendChild(fileItem);
    });

    // Renderizar novos arquivos acumulados na sessão atual de modificação
    arquivosAcumulados.forEach((arquivo, index) => {
        const extensao = arquivo.name.split('.').pop().toLowerCase();
        let icone = 'fi-rr-document';
        if (extensao === 'pdf') icone = 'fi-rr-file-pdf';
        else if (['xls', 'xlsx', 'csv'].includes(extensao)) icone = 'fi-rr-file-excel';
        else if (['doc', 'docx'].includes(extensao)) icone = 'fi-rr-file-word';

        const fileItem = document.createElement('div');
        fileItem.classList.add('file-item');
        fileItem.style.borderLeft = "4px solid #5cb85c"; 

        fileItem.innerHTML = `
            <div class="file-item-info">
                <i class="fi ${icone}"></i>
                <span>${arquivo.name} <small style="color: #5cb85c;">(Novo)</small></span>
            </div>
            <button type="button" class="remove-new-file-btn" data-index="${index}">
                <i class="fi fi-rr-trash"></i>
            </button>
        `;

        fileItem.querySelector('.remove-new-file-btn').addEventListener('click', function(e) {
            e.preventDefault();
            const idx = parseInt(this.getAttribute('data-index'));
            arquivosAcumulados.splice(idx, 1);
            renderizarListaArquivosEdicao();
        });

        fileListContainer.appendChild(fileItem);
    });
}

// 5. INTERCEPTADOR DO FORMULÁRIO DE EDIÇÃO (CORRIGE ERRO DE VALIDAÇÃO DE ARQUIVOS)
const formEditProject = document.getElementById('formEditProject');
if (formEditProject) {
    formEditProject.addEventListener('submit', function(e) {
        e.preventDefault();

        // VALIDAÇÃO CRÍTICA LOCAL: Calcula se sobrou algum arquivo antigo ou se há algum novo
        const arquivosRestantesDoBanco = arquivosOriginaisDoProjeto.filter(arq => !arquivosRemovidosNoEdit.includes(arq));
        if (arquivosRestantesDoBanco.length === 0 && arquivosAcumulados.length === 0) {
            alert('Por favor, o projeto não pode ficar sem nenhum arquivo anexado.');
            return;
        }

        const formData = new FormData(formEditProject);
        formData.append('id_project', editandoProjetoId);

        // Limpa o input do name nativo e injeta os objetos File do array acumulado
        formData.delete('newProjectArchives');
        arquivosAcumulados.forEach(arquivo => {
            formData.append('newProjectArchives', arquivo);
        });

        // Envia metadados de criadores e a lista de nomes deletados para o back-end tratar
        formData.append('creatorsIds', JSON.stringify(criadoresSelecionados.map(u => u.id)));
        formData.append('arquivosRemovidos', JSON.stringify(arquivosRemovidosNoEdit));

        fetch('/apis/projects/atualizar', {
            method: 'POST',
            body: formData,
            credentials: 'include'
        })
        .then(async response => {
            const data = await response.json();
            if (!response.ok) throw new Error(data.mensagem || 'Erro ao atualizar características do projeto.');
            return data;
        })
        .then(data => {
            alert('Projeto atualizado com sucesso e encaminhado para revisão!');
            window.location.reload();
        })
        .catch(error => {
            console.error('Falha no update:', error);
            alert(error.message);
        });
    });
}