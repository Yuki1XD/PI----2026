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
            alert('Por favor, adicione ao menos um arquivo ao projeto.', 'erro');
            return; 
        }

        arquivosAcumulados.forEach(arquivo => {
            
            formData.append('newProjectArchives', arquivo);
        });

        fetch('/projects/cadastrar', {
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
            alert('Projeto publicado com sucesso!', 'sucesso');
            window.location.reload(); 
        })
        .catch(error => {
            console.error('Erro no envio:', error);
            alert(error.message, 'erro');
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    carregarDadosInicio();
});

async function carregarDadosInicio() {
    try {
        // Faz a requisição para a sua API que traz os dados consolidados do dashboard
        // Altere de: '/apis/admin/dashboard-inicio'
        // Para:
        const response = await fetch('/projects/dashboard-inicio');
        if (!response.ok) throw new Error("Erro ao carregar dados do início.");
        
        const dados = await response.json();

        // 1. ATUALIZAÇÃO DOS CARDS ESTATÍSTICOS
        // Seleciona todos os elementos <h3> dentro da seção de cards
        const cardsGrid = document.querySelector(".cards-grid");
        if (cardsGrid) {
            const h3Cards = cardsGrid.querySelectorAll(".card-details h3");
            
            // Mapeia os dados do back-end na ordem exata do seu HTML:
            // h3Cards[0] = Total de Alunos
            // h3Cards[1] = Professores
            // h3Cards[2] = Projetos Publicados
            // h3Cards[3] = Pendentes
            if (h3Cards.length >= 4) {
                h3Cards[0].innerText = dados.totalAlunos || "0";
                h3Cards[1].innerText = dados.totalProfessores || "0";
                h3Cards[2].innerText = dados.totalProjetos || "0";
                h3Cards[3].innerText = dados.totalPendentes || "0";
            }
        }

        // 2. ATUALIZAÇÃO DA ATIVIDADE RECENTE
        const containerAtividades = document.querySelector(".activity-list");
        if (containerAtividades && dados.atividades && dados.atividades.length > 0) {
            // Limpa os itens estáticos (mocks) que estão no HTML
            containerAtividades.innerHTML = ""; 

            // Renderiza as atividades reais vindas do banco de dados
            dados.atividades.forEach(atividade => {
                // Define a cor da bolinha com base no tipo de atividade
                let corBolinha = "dot-blue";
                if (atividade.status === "sucesso" || atividade.tipo === "professor") corBolinha = "dot-green";
                if (atividade.status === "alerta" || atividade.tipo === "projeto") corBolinha = "dot-orange";

                const item = document.createElement("div");
                item.className = "activity-item";
                item.innerHTML = `
                    <div class="activity-text">
                        <span class="dot ${corBolinha}"></span>
                        <p>${atividade.descricao}</p>
                    </div>
                    <span class="activity-time">${atividade.tempo_passado}</span>
                `;
                containerAtividades.appendChild(item);
            });
        }

    } catch (erro) {
        console.error("Não foi possível atualizar a aba de início:", erro);
    }
}

// FETCH API para listar e gerenciar projetos na aba do Administrador

// =========================================================================
// FETCH API - GERENCIAMENTO DE PROJETOS (PAINEL DO ADMINISTRADOR)
// =========================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Carrega a aba "Aprovar Projetos" (Apenas aguardando análise/analisados)
    if (document.getElementById('listProjectsTeacher')) {
        loadProjectsAdmin('/projects/analisados', 'listProjectsTeacher');
    }
    
    // Carrega a aba "Todos os Projetos" (A listagem geral do banco de dados)
    if (document.getElementById('listAllProjectsContainer')) {
        loadProjectsAdmin('/projects', 'listAllProjectsContainer');
    }
});

// Função genérica para buscar dados de uma API e mandar renderizar no container correto
async function loadProjectsAdmin(endpoint, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Busca o aviso de "sem resultados" de dentro do container específico
    const noResultsForSearch = container.querySelector('.noResultsForSearch');
    
    try {
        const response = await fetch(endpoint);
        if (!response.ok) throw new Error(`Erro ao buscar projetos do endpoint: ${endpoint}`);

        const projetos = await response.json();

        // Se o retorno estiver vazio
        if (!projetos || projetos.length === 0) {
            // Mantém apenas a div de sem resultados visível
            container.innerHTML = '';
            if (noResultsForSearch) {
                noResultsForSearch.style.display = 'block';
                container.appendChild(noResultsForSearch);
            }
            return;
        }

        // Limpa o container para renderização dos dados reais
        container.innerHTML = '';

        projetos.forEach(projeto => {
            const projetoCard = document.createElement('div');
            projetoCard.classList.add('containerCard'); 

            const dataFormatada = projeto.date_project 
                ? new Date(projeto.date_project).toLocaleDateString('pt-BR') 
                : 'Sem data';

            // Configuração visual do Badge de Status
            let statusClasse = '';
            let statusTexto = '';
            switch (projeto.status_project) {
                case 'enviado':
                    statusClasse = 'status-enviado';
                    statusTexto = 'Aguardando Análise';
                    break;
                case 'analisado':
                    statusClasse = 'status-analisado';
                    statusTexto = 'Análise Enviada';
                    break;
                case 'aceito':
                    statusClasse = 'status-aceito';
                    statusTexto = 'Projeto Aceito';
                    break;
                case 'rejeitado':
                    statusClasse = 'status-rejeitado';
                    statusTexto = 'Projeto Rejeitado';
                    break;
                default:
                    statusClasse = 'status-padrao';
                    statusTexto = projeto.status_project || 'Desconhecido';
            }

            // === PRÉ-SELEÇÃO DINÂMICA DA CATEGORIA ===
            const categorias = ["Geral", "Gastronomia", "Hardware", "Software", "Inteligencia Artificial"];
            const optionsCategoria = categorias.map(cat => {
                const isSelected = projeto.category_project === cat ? 'selected' : '';
                return `<option value="${cat}" ${isSelected}>${cat}</option>`;
            }).join('');

            // === PRÉ-SELEÇÃO DINÂMICA DA VISIBILIDADE ===
            const visibilidades = ["privado", "publico"];
            const optionsVisibilidade = visibilidades.map(vis => {
                const text = vis === 'publico' ? 'Público' : 'Privado';
                const isSelected = projeto.visibility_project === vis ? 'selected' : '';
                return `<option value="${vis}" ${isSelected}>${text}</option>`;
            }).join('');

            // Injecao do Card + Dialog (Modal) usando escopos de ID únicos combinados com o containerId
            projetoCard.innerHTML = `
                <button class="postagem-card" data-modal="modal-${containerId}-${projeto.id_project}">
                    <div class="postagem-topo">
                        <img src="/uploads/${projeto.img_project || 'default.jpg'}" alt="${projeto.name_project}">
                    </div>
                    <div class="postagem-cont">
                        <h3>${projeto.name_project}</h3>
                        <p>${projeto.description_project || 'Sem descrição.'}</p>
                    </div>
                    <div class="postagem-inf">
                        <span>${projeto.creators_project || 'Desconhecido'}</span>
                        <span>${dataFormatada}</span>
                    </div>
                </button>

                <dialog id="modal-${containerId}-${projeto.id_project}" class="modalWindow">
                    <button data-modal="modal-${containerId}-${projeto.id_project}" class="closeModal">
                        <i class="fi fi-rr-x"></i>
                    </button>

                    <div class="imgProjectDetails">
                        <img src="/uploads/${projeto.img_project || 'default.jpg'}" alt="${projeto.name_project}">
                    </div>

                    <div class="modalDetails">
                        <h1>${projeto.name_project}</h1>

                        <div class="lineDetail">
                            <i class="fi fi-rr-users"></i>
                            <div>
                                <p class="listOfContentTittle">Criadores</p>
                                <p>${projeto.creators_project || 'Não informado'}</p>
                            </div>
                        </div>

                        <div class="lineDetail">
                            <i class="fi fi-rr-calendar"></i>
                            <div>
                                <p class="listOfContentTittle">Data de Postagem</p>
                                <p>${projeto.date_project}</p>
                            </div>
                        </div>

                        <div class="lineDetail">
                            <i class="fi fi-rr-document"></i>
                            <div>
                                <p class="listOfContentTittle">Categoria</p>
                                <select class="select-categoria">
                                    ${optionsCategoria}
                                </select>
                            </div>
                        </div>

                        <div class="lineDetail">
                            <i class="fi fi-rr-users"></i>
                            <div>
                                <p class="listOfContentTittle">Turma</p>
                                <p>${projeto.class_project || 'Não informada'}</p>
                            </div>
                        </div>

                        <div class="lineDetail">
                            <i class="fi fi-rr-users"></i>
                            <div>
                                <p class="listOfContentTittle">Professor Orientador</p>
                                <p>${projeto.teacher_project || 'Não informado'}</p>
                            </div>
                        </div>

                        <div class="lineDetail">
                            <i class="fi fi-rr-folder"></i>
                            <div>
                                <p class="listOfContentTittle">Arquivos do Projeto</p>
                                <div class="modal-files-list" style="display: flex; flex-direction: column; gap: 5px;">
                                    ${projeto.archives_project 
                                        ? projeto.archives_project.split(',').map((arquivo, idx) => {
                                            const nomeLimpo = arquivo.trim();
                                            return `
                                                <a href="/uploads/${nomeLimpo}" download="${nomeLimpo}" class="download-file-link" target="_blank" style="color: #007bff; text-decoration: underline; font-weight: bold; display: inline-flex; align-items: center;">
                                                    <i class="fi fi-rr-download" style="margin-right: 5px;"></i> Baixar Arquivo ${idx + 1}
                                                </a>
                                            `;
                                        }).join('')
                                        : '<p>Nenhum arquivo anexado</p>'
                                    }
                                </div>
                            </div>
                        </div>

                        <div>
                            <h11>Status Atual</h11>
                            <p class="ModalStatus ${statusClasse}"><strong>${statusTexto}</strong></p>
                        </div>
                        
                        <div>
                            <h11>Descrição</h11>
                            <p class="modalDesc">${projeto.description_project || 'Sem descrição.'}</p>
                        </div>  

                        <div>
                            <h11>Análise do Professor</h11>
                            <p class="modalAnalizy">${projeto.analysis_project || 'O professor não analisou esse projeto.'}</p>
                        </div>
                    </div>

                    <div class="buttonModal">
                        <button class="sendAnalizy accept-btn" data-id="${projeto.id_project}" data-container="${containerId}">
                            <i class="fi fi-rr-check"></i> ${projeto.status_project === 'aceito' ? 'Salvar (Manter Aceito)' : 'Mudar para Aceito'}
                        </button>
                        <button class="sendAnalizy reject-btn" data-id="${projeto.id_project}" data-container="${containerId}">
                            <i class="fi fi-rr-cross-small"></i> ${projeto.status_project === 'rejeitado' ? 'Salvar (Manter Rejeitado)' : 'Mudar para Rejeitado'}
                        </button>
                        <select class="select-visibilidade">
                            ${optionsVisibilidade}
                        </select>
                    </div>
                </dialog>
            `;
            container.appendChild(projetoCard);
        });

        // Reaplica os eventos de cliques nos novos elementos inseridos
        rebindModalEvents(container);

    } catch (err) {
        console.error(`Erro ao carregar projetos do endpoint ${endpoint}:`, err);
    }
}

function rebindModalEvents(contextoContainer) {
    // Abrir Modal específico deste container
    contextoContainer.querySelectorAll('.postagem-card').forEach(button => {
        button.onclick = () => {
            const modalID = button.getAttribute('data-modal');
            const modal = document.getElementById(modalID);
            if (modal) modal.showModal();
        };
    });

    // Fechar Modal específico deste container
    contextoContainer.querySelectorAll('.closeModal').forEach(button => {
        button.onclick = (e) => {
            e.preventDefault();
            const modalID = button.getAttribute('data-modal');
            const modal = document.getElementById(modalID);
            if (modal) modal.close();
        };
    });

    // Botão de Aceitar / Salvar alterações como Aceito
    contextoContainer.querySelectorAll('.accept-btn').forEach(button => {
        button.onclick = async (e) => { // Certifique-se de que tem o 'async' aqui
            e.preventDefault();
            const id = button.getAttribute('data-id');
            const containerId = button.getAttribute('data-container');
            
            const modal = document.getElementById(`modal-${containerId}-${id}`);
            const categoria = modal.querySelector('.select-categoria').value;
            const visibilidade = modal.querySelector('.select-visibilidade').value;

            // Aguarda a resposta do seu painel customizado
            const confirmado = await mostrarConfirmacao('Confirmar salvamento do projeto com o status: ACEITO?');
            if (confirmado) {
                enviarAnaliseAdmin(id, 'aceito', categoria, visibilidade);
            }
        };      
    });

    // Botão de Rejeitar / Salvar alterações como Rejeitado
    contextoContainer.querySelectorAll('.reject-btn').forEach(button => {
        button.onclick = async (e) => {
            e.preventDefault();
            const id = button.getAttribute('data-id');
            const containerId = button.getAttribute('data-container');
            
            const modal = document.getElementById(`modal-${containerId}-${id}`);
            const categoria = modal.querySelector('.select-categoria').value;
            const visibilidade = modal.querySelector('.select-visibilidade').value;

            // Aguarda a resposta do seu painel customizado
            const confirmado = await mostrarConfirmacao('Confirmar salvamento do projeto com o status: REJEITADO?');
            if (confirmado) {
                enviarAnaliseAdmin(id, 'rejeitado', categoria, visibilidade);
            }
        };
    });
}

// Executa a atualização do status, categoria e visibilidade via PUT no Back-end
async function enviarAnaliseAdmin(id, statusEscolhido, categoriaEscolhida, visibilidadeEscolhida) {
    try {
        const response = await fetch(`/projects/aceitar_rejeitar/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                status_project: statusEscolhido,
                category_project: categoriaEscolhida,   
                visibility_project: visibilidadeEscolhida 
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.mensagem || 'Erro ao atualizar dados do projeto.');
        }

        alert(data.mensagem || 'Projeto atualizado com sucesso!', 'sucesso');
        setTimeout(() => { window.location.reload(); }, 1500); 

    } catch (error) {
        console.error('Erro na requisição PUT:', error);
        alert(error.message, 'erro');
    }
}

// =========================================================================
// FETCH API - GERENCIAMENTO DE USUÁRIOS (PAINEL DO ADMINISTRADOR)
// =========================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Carrega a listagem de usuários se o container existir na tela
    if (document.getElementById('listAllUsersContainer')) {
        loadUsersAdmin('/auth', 'listAllUsersContainer');
    }
});

async function loadUsersAdmin(endpoint, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Busca o aviso de "sem resultados" específico deste container
    const noResultsForSearch = container.querySelector('.noResultsForSearch');

    try {
        const response = await fetch(endpoint);
        if (!response.ok) throw new Error(`Erro ao buscar usuários do endpoint: ${endpoint}`);

        const usuarios = await response.json();

        // Se não houver usuários cadastrados
        if (!usuarios || usuarios.length === 0) {
            container.innerHTML = '';
            if (noResultsForSearch) {
                noResultsForSearch.style.display = 'table-row';
                container.appendChild(noResultsForSearch);
            }
            return;
        }

        // Limpa o container mantendo o "noResultsForSearch" estruturado se necessário
        container.innerHTML = '';

        usuarios.forEach(usuario => {
            // Cria a linha da tabela para cada usuário
            const userRow = document.createElement('tr');

            // Configuração visual do Badge de Status do Usuário
            let statusClasse = usuario.status_user === 'ativo' ? 'status-ativo' : 'status-inativo';
            let statusTexto = usuario.status_user === 'ativo' ? 'Ativo' : 'Inativo';

            // Configuração dinâmica dos selects internos do Modal
            const cargos = ["aluno", "professor", "admin"];
            const optionsCargo = cargos.map(role => {
                const isSelected = usuario.role_user === role ? 'selected' : '';
                const textoExibicao = role.charAt(0).toUpperCase() + role.slice(1);
                return `<option value="${role}" ${isSelected}>${textoExibicao}</option>`;
            }).join('');

            const statusLista = ["ativo", "inativo"];
            const optionsStatus = statusLista.map(st => {
                const isSelected = usuario.status_user === st ? 'selected' : '';
                const textoExibicao = st.charAt(0).toUpperCase() + st.slice(1);
                return `<option value="${st}" ${isSelected}>${textoExibicao}</option>`;
            }).join('');

            // Condicional para renderizar a imagem ou o ícone padrão "vazio"
            let avatarHTML = '';
            if (usuario.avatar_user) {
                avatarHTML = `<img class="preview-avatar" src="/uploads/${usuario.avatar_user}" alt="${usuario.name_user}" style="object-fit: cover; border-radius: 50%; width: 150px; height: 150px; display: block;">`;
            } else {
                avatarHTML = `
                    <div class="preview-avatar-placeholder" style="width: 150px; height: 150px; border-radius: 50%; background: #e0e0e0; display: flex; align-items: center; justify-content: center;">
                        <i class="fi fi-rr-user" style="font-size: 60px; color: #a0a0a0;"></i>
                    </div>
                `;
            }

            // Injeta as células correspondentes às colunas do seu HTML + a janela Modal integrada
            userRow.innerHTML = `
                <td>${usuario.name_user}</td>
                <td>${usuario.email_user}</td>
                <td>${usuario.role_user.charAt(0).toUpperCase() + usuario.role_user.slice(1)}</td>
                <td><span class="status-badge ${statusClasse}">${statusTexto}</span></td>
                <td>
                    <button class="btn-acao open-user-modal-btn" data-modal="modal-user-${usuario.id_user}">
                        <i class="fi fi-rr-edit"></i>
                    </button>
                    <button class="btn-acao delete-user-btn" data-id="${usuario.id_user}" data-name="${usuario.name_user}">
                        <i class="fi fi-rr-trash"></i>
                    </button>

                    <dialog id="modal-user-${usuario.id_user}" class="modalWindow" style="color: initial; text-align: left;">
                        <button data-modal="modal-user-${usuario.id_user}" class="closeModal">
                            <i class="fi fi-rr-x"></i>
                        </button>

                        <div class="imgProjectDetails" style="text-align: center; margin-bottom: 15px;">
                            <label for="input-avatar-${usuario.id_user}" style="cursor: pointer; display: inline-block; position: relative;" title="Clique para alterar a foto">
                                <div class="avatar-container-preview">
                                    ${avatarHTML}
                                </div>
                                <div style="position: absolute; bottom: 5px; right: 5px; background: #007bff; color: white; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">
                                    <i class="fi fi-rr-camera" style="font-size: 14px;"></i>
                                </div>
                            </label>
                            <input type="file" id="input-avatar-${usuario.id_user}" class="edit-user-avatar-input" accept="image/*" style="display: none;">
                        </div>

                        <div class="modalDetails">
                            <h1>Editar Informações do Usuário</h1>

                            <div class="lineDetail">
                                <i class="fi fi-rr-user"></i>
                                <div style="width: 100%;">
                                    <p class="listOfContentTittle">Nome Completo</p>
                                    <input type="text" class="edit-user-name" value="${usuario.name_user}" style="width: 100%; border: 1px solid #ccc; padding: 8px; border-radius: 4px; font-size: 14px;">
                                </div>
                            </div>

                            <div class="lineDetail">
                                <i class="fi fi-rr-envelope"></i>
                                <div style="width: 100%;">
                                    <p class="listOfContentTittle">E-mail Corporativo / Acadêmico</p>
                                    <input type="email" class="edit-user-email" value="${usuario.email_user}" style="width: 100%; border: 1px solid #ccc; padding: 8px; border-radius: 4px; font-size: 14px;">
                                </div>
                            </div>

                            <div class="lineDetail">
                                <i class="fi fi-rr-key"></i>
                                <div style="width: 100%;">
                                    <p class="listOfContentTittle">Tipo de Conta (Nível de Acesso)</p>
                                    <select class="select-user-role" style="width: 100%; border: 1px solid #ccc; padding: 8px; border-radius: 4px; font-size: 14px;">
                                        ${optionsCargo}
                                    </select>
                                </div>
                            </div>

                            <div class="lineDetail">
                                <i class="fi fi-rr-shield-check"></i>
                                <div style="width: 100%;">
                                    <p class="listOfContentTittle">Status de Autenticação</p>
                                    <select class="select-user-status" style="width: 100%; border: 1px solid #ccc; padding: 8px; border-radius: 4px; font-size: 14px;">
                                        ${optionsStatus}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div class="buttonModal" style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
                            <button class="sendAnalizy save-user-btn" data-id="${usuario.id_user}" style="background-color: #28a745; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer;">
                                <i class="fi fi-rr-disk"></i> Salvar Diretrizes
                            </button>
                        </div>
                    </dialog>
                </td>
            `;
            container.appendChild(userRow);
        });

        // Aplica os eventos nos elementos gerados
        rebindUserModalEvents(container);

    } catch (err) {
        console.error(`Erro ao carregar usuários do endpoint ${endpoint}:`, err);
    }
}

function rebindUserModalEvents(contextoContainer) {
    // [NOVO] Evento para escutar a mudança do input de arquivo e gerar o PREVIEW
    contextoContainer.querySelectorAll('.edit-user-avatar-input').forEach(input => {
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const containerPreview = input.closest('.imgProjectDetails').querySelector('.avatar-container-preview');
                const urlImagemTemporaria = URL.createObjectURL(file);
                
                // Substitui o conteúdo pelo elemento de imagem com o preview do novo arquivo
                containerPreview.innerHTML = `<img class="preview-avatar" src="${urlImagemTemporaria}" style="object-fit: cover; border-radius: 50%; width: 150px; height: 150px; display: block;">`;
            }
        };
    });

    // Abrir o Modal de Usuário ao clicar no botão Editar
    contextoContainer.querySelectorAll('.open-user-modal-btn').forEach(button => {
        button.onclick = (e) => {
            e.preventDefault();
            const modalID = button.getAttribute('data-modal');
            const modal = document.getElementById(modalID);
            if (modal) modal.showModal();
        };
    });

    // Fechar o Modal
    contextoContainer.querySelectorAll('.closeModal').forEach(button => {
        button.onclick = (e) => {
            e.preventDefault();
            const modalID = button.getAttribute('data-modal');
            const modal = document.getElementById(modalID);
            if (modal) modal.close();
        };
    });

    // Evento de envio do formulário interno do modal (Requisição PUT usando FormData)
    contextoContainer.querySelectorAll('.save-user-btn').forEach(button => {
        button.onclick = async (e) => {
            e.preventDefault();
            const id = button.getAttribute('data-id');
            
            const modal = document.getElementById(`modal-user-${id}`);
            const nomeAlterado = modal.querySelector('.edit-user-name').value;
            const emailAlterado = modal.querySelector('.edit-user-email').value;
            const cargoEscolhido = modal.querySelector('.select-user-role').value;
            const statusEscolhido = modal.querySelector('.select-user-status').value;
            
            // Captura o arquivo de imagem do input correspondente
            const arquivoInput = modal.querySelector('.edit-user-avatar-input');
            const fotoArquivo = arquivoInput.files[0]; 

            if (confirm(`Confirmar o salvamento das alterações do usuário: ${nomeAlterado}?`)) {
                // Instancia o FormData necessário para upload de arquivos
                const formData = new FormData();
                formData.append('name_user', nomeAlterado);
                formData.append('email_user', emailAlterado);
                formData.append('role_user', cargoEscolhido);
                formData.append('status_user', statusEscolhido);
                
                // Só adiciona a foto ao FormData se o administrador de fato selecionou uma nova imagem
                if (fotoArquivo) {
                    formData.append('avatar_user', fotoArquivo); // O nome 'avatar_user' deve bater com o seu multer/back-end
                }

                atualizarUsuarioAdmin(id, formData);
            }
        };
    });

    // Evento do botão Excluir
    contextoContainer.querySelectorAll('.delete-user-btn').forEach(button => {
        button.onclick = async (e) => {
            e.preventDefault();
            const id = button.getAttribute('data-id');
            const nome = button.getAttribute('data-name');

            if (confirm(`ATENÇÃO: Deseja realmente REMOVER o usuário ${nome} permanentemente do banco de dados?`)) {
                excluirUsuarioAdmin(id);
            }
        };
    });
}

// Executa a atualização via PUT no Back-end (Modificada para receber FormData)
async function atualizarUsuarioAdmin(id, formData) {
    try {
        const response = await fetch(`/auth/atualizar/${id}`, {
            method: 'PUT',
            // Importante: Ao enviar FormData, NÃO se define o 'Content-Type' manualmente nos headers.
            // O próprio navegador define o boundary correto automaticamente.
            body: formData 
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.mensagem || 'Erro ao atualizar dados do usuário.');
        }

        alert(data.mensagem || 'Usuário atualizado com sucesso!');
        window.location.reload(); 

    } catch (error) {
        console.error('Erro na requisição PUT de usuário:', error);
        alert(error.message);
    }
}

// Função para deletar usuário
async function excluirUsuarioAdmin(id) {
    try {
        const response = await fetch(`/auth/deletar/${id}`, {
            method: 'DELETE'
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.mensagem || 'Erro ao deletar usuário.');

        alert(data.mensagem || 'Usuário removido com sucesso!');
        window.location.reload();
    } catch (error) {
        console.error('Erro na requisição DELETE de usuário:', error);
        alert(error.message);
    }
}

// Função estatistica 
 se const express = require('express');
const router = express.Router();
const conexao = require('../database/conexao');

router.get("/api/projects/statistics", (req, res) => {
    
    // 1. Estatísticas de Usuários
    const queryUsuarios = `
        SELECT 
            COUNT(CASE WHEN tipo = 'aluno' AND status_user = 'ativo' THEN 1 END) AS ativos,
            COUNT(CASE WHEN status_user = 'inativo' THEN 1 END) AS desativados,
            COUNT(*) AS totalGeral
        FROM users
    `;
    
    // 2. Estatísticas de Projetos (Status e Totais)
    const queryProjetos = `
        SELECT 
            COUNT(*) AS total,
            COUNT(CASE WHEN status_project = 'aceito' THEN 1 END) AS aceitos,
            COUNT(CASE WHEN status_project = 'rejeitado' THEN 1 END) AS rejeitados
        FROM project
    `;
    
    // 3. Projetos agrupados por Categorias
    const queryCategorias = `
        SELECT IFNULL(category_project, 'Não informada') AS nome, COUNT(*) AS quantidade 
        FROM project 
        GROUP BY category_project
    `;

    // 4. Tags mais utilizadas (Exemplo considerando que você tenha um campo tags_project string separada por vírgula)
    // Se não tiver a coluna, a query retornará vazio sem quebrar o sistema.
    const queryTags = `
        SELECT tags_project FROM project WHERE tags_project IS NOT NULL AND tags_project != ''
    `;

    conexao.query(queryUsuarios, (err, resUsuarios) => {
        if (err) return res.status(500).json({ erro: "Erro ao buscar dados de usuários" });

        conexao.query(queryProjetos, (err, resProjetos) => {
            if (err) return res.status(500).json({ erro: "Erro ao buscar dados de projetos" });

            conexao.query(queryCategorias, (err, resCategorias) => {
                if (err) return res.status(500).json({ erro: "Erro ao buscar dados de categorias" });

                conexao.query(queryTags, (err, resTags) => {
                    // Se der erro nas tags (ex: coluna não existe), definimos um array vazio para não travar
                    let tagsIniciais = resTags || [];

                    const totalProjetos = resProjetos[0].total || 0;
                    const aceitos = resProjetos[0].aceitos || 0;
                    const rejeitados = resProjetos[0].rejeitados || 0;

                    // Cálculos de taxas percentuais
                    const taxaAprovacao = totalProjetos > 0 ? ((aceitos / totalProjetos) * 100).toFixed(1) + "%" : "0%";
                    const taxaRejeicao = totalProjetos > 0 ? ((rejeitados / totalProjetos) * 100).toFixed(1) + "%" : "0%";

                    // Processamento lógico de Tags (Separa strings por vírgula e conta a frequência)
                    let contagemTags = {};
                    tagsIniciais.forEach(row => {
                        // Verifica se o campo existe (pode se chamar tags_project ou similar)
                        const textoTags = row.tags_project || row.tags || "";
                        textoTags.split(',').forEach(tag => {
                            let t = tag.trim().toLowerCase();
                            if(t) contagemTags[t] = (contagemTags[t] || 0) + 1;
                        });
                    });

                    // Transforma o objeto de tags em um array ordenado das mais usadas
                    const listaTagsOrdenadas = Object.keys(contagemTags).map(tag => ({
                        nome: tag,
                        quantidade: contagemTags[tag]
                    })).sort((a, b) => b.quantidade - a.quantidade).slice(0, 5); // Pega as 5 principais

                    // Envia os dados completos unificados
                    return res.json({
                        // Aba Visão Geral / Usuários
                        novosUsuarios: resUsuarios[0].ativos, // Mantido a chave antiga para não quebrar o front básico
                        usuariosAtivos: resUsuarios[0].ativos,
                        usuariosDesativados: resUsuarios[0].desativados,
                        totalUsuarios: resUsuarios[0].totalGeral,
                        
                        // Aba Projetos
                        projetosPublicados: totalProjetos, 
                        projetosAceitos: aceitos,
                        projetosRejeitados: rejeitados,
                        taxaAprovacao: taxaAprovacao,       
                        taxaRejeicao: taxaRejeicao,

                        // Listas estruturadas
                        categorias: resCategorias,
                        tags: listaTagsOrdenadas
                    });
                });
            });
        });
    });
});

module.exports = router;

}

// === FUNÇÃO PARA SUBSTITUIR O 'ALERT' ===
// tipo pode ser: 'sucesso' ou 'erro'
function mostrarAviso(mensagem, tipo = 'sucesso') {
    const dialog = document.createElement('dialog');
    dialog.classList.add('custom-alert-dialog');
    
    const icone = tipo === 'sucesso' ? 'fi-rr-checkbox' : 'fi-rr-cross-circle';
    
    dialog.innerHTML = `
        <div class="custom-alert-content">
            <i class="fi ${icone}"></i>
            <p>${mensagem}</p>
            <button class="custom-alert-btn">OK</button>
        </div>
    `;
    
    document.body.appendChild(dialog);
    dialog.showModal();
    
    dialog.querySelector('.custom-alert-btn').addEventListener('click', () => {
        dialog.close();
        dialog.remove(); // Limpa do HTML
    });
}

// === FUNÇÃO PARA SUBSTITUIR O 'CONFIRM' ===
// Retorna true ou false de forma assíncrona
function mostrarConfirmacao(mensagem) {
    return new Promise((resolve) => {
        const dialog = document.createElement('dialog');
        dialog.classList.add('custom-confirm-dialog');
        
        dialog.innerHTML = `
            <div class="custom-confirm-content">
                <i class="fi fi-rr-interrogation"></i>
                <p>${mensagem}</p>
                <button class="custom-confirm-yes">Confirmar</button>
                <button class="custom-confirm-no">Cancelar</button>
            </div>
        `;
        
        document.body.appendChild(dialog);
        dialog.showModal();
        
        dialog.querySelector('.custom-confirm-yes').addEventListener('click', () => {
            dialog.close();
            dialog.remove();
            resolve(true);
        });
        
        dialog.querySelector('.custom-confirm-no').addEventListener('click', () => {
            dialog.close();
            dialog.remove();
            resolve(false);
        });
    });
}

// === CARREGAR DADOS DO USUÁRIO LOGADO AUTOMATICAMENTE ===
async function carregarPerfilMenuLateral() {
    const imgContainer = document.getElementById("userImgContainer");
    const nomePerfil = document.getElementById("userName");
    const cargoPerfil = document.getElementById("userRole");

    try {
        const response = await fetch('/auth/profile');
        if (!response.ok) throw new Error("Erro ao carregar perfil");

        const usuario = await response.json();

        // 1. Atualiza o nome e tipo textuais
        if (nomePerfil) nomePerfil.textContent = usuario.name_user;
        if (cargoPerfil) cargoPerfil.textContent = usuario.tipo.charAt(0).toUpperCase() + usuario.tipo.slice(1); // Ex: Aluno

        // 2. Regra de negócio para a foto de perfil
        if (imgContainer) {
            if (usuario.avatar_user) {
                // Se o usuário POSSUI foto salva no banco de dados
                imgContainer.innerHTML = `<img src="/uploads/${usuario.avatar_user}" class="imgPerfil" alt="Foto de perfil">`;
            } else {
                // Se o usuário NÃO possui foto (avatar_user é null ou vazio), renderiza o ícone de usuário padrão do Flaticon UIcons
                imgContainer.innerHTML = `
                    <i class="fi fi-rr-user" style="font-size: 32px; color: #ccc; background: #f0f0f0; padding: 12px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; width: 50px; height: 50px;"></i>
                `;
            }
        }
    } catch (err) {
        console.error("Erro ao renderizar dados do menu lateral:", err);
        if (imgContainer) {
            imgContainer.innerHTML = `<i class="fi fi-rr-user" style="font-size: 32px; color: #ccc;"></i>`;
        }
    }
}

// Garante a execução assim que a página carregar por completo
document.addEventListener("DOMContentLoaded", () => {
    carregarPerfilMenuLateral();
});
