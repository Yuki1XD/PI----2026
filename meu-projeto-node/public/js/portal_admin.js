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

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('listProjectsTeacher')) {
        loadProjects()
    }
})

async function loadProjects() {
    const container = document.getElementById("listProjectsTeacher")

    const noResultsForSearch = document.querySelector('.noResultsForSearch');
    
    try {

        const response = await fetch('/apis/projects/pendentes')
        if (!response.ok) throw new Error("Erro ao buscar projetos no servidor")

        const projetos = await response.json()

        if (projetos.length === 0) {
            if (noResultsForSearch) noResultsForSearch.style.display = 'block'
            return
        }

        if (noResultsForSearch) noResultsForSearch.style.display = 'none'

        container.innerHTML = ''

        projetos.forEach(projeto => {

            const projetoCard = document.createElement('div')
            projetoCard.classList.add('alaizyProjects')

            const dataFormatada = projeto.date_project 
                ? new Date(projeto.date_project).toLocaleDateString('pt-BR') 
                : 'Sem data';

            projetoCard.innerHTML = `

                    <div class="textContentOfProject">

                        <div class="containerCard">

                            <button class="postagem-card" data-modal="modal-${projeto.id_project}">
                                <div class="postagem-topo">
                                    <img src="/uploads/${projeto.img_project}">
                                </div>
                                <div class="postagem-cont">
                                    <h3>${projeto.name_project}</h3>
                                    <p>${projeto.description_project}</p>
                                </div>
                                <div class="postagem-inf">
                                    <span>${projeto.creators_project}</span>
                                    <span>${projeto.date_project}</span>
                                </div>
                            </button>

                        </div>

                        <dialog id="modal-${projeto.id_project}" class="modalWindow">

                            <button data-modal="modal-${projeto.id_project}" class="closeModal">
                                <i class="fi-rr-x"></i>
                            </button>

                            <div class="imgProjectDetails">
                                <img src="/uploads/${projeto.img_project}" alt="">
                            </div>

                            <div class="modalDetails">
                                <h1>${projeto.name_project}</h1>

                                <div class="lineDetail">
                                    <i class="fi-rr-users"></i>
                                    <div>
                                        <p class="listOfContentTittle">Criadores</p>
                                        <p>${projeto.creators_project}</p>
                                    </div>
                                </div>

                                <div class="lineDetail">
                                    <i class="fi-rr-calendar"></i>
                                    <div>
                                        <p class="listOfContentTittle">Data de Postagem</p>
                                        <p>${projeto.date_project}</p>
                                    </div>
                                </div>

                                <div class="lineDetail">
                                    <i class="fi-rr-document"></i>
                                    <div>
                                        <p class="listOfContentTittle">Categoria</p>
                                        <p>${projeto.category_project}</p>
                                    </div>
                                </div>

                                <div class="lineDetail">
                                    <i class="fi-rr-users"></i>
                                    <div>
                                        <p class="listOfContentTittle">Turma</p>
                                        <p>${projeto.class_project}</p>
                                    </div>
                                </div>

                                <div class="lineDetail">
                                    <i class="fi-rr-users"></i>
                                    <div>
                                        <p class="listOfContentTittle">Professor Orientador</p>
                                        <p>${projeto.teacher_project}</p>
                                    </div>
                                </div>

                                <div class="lineDetail">
                                    <i class="fi-rr-label"></i>
                                    <div>
                                        <p class="listOfContentTittle">Tags</p>
                                        <p>Api</p>
                                    </div>
                                </div>

                                <div class="lineDetail">
                                    <i class="fi-rr-folder"></i>
                                    <div>
                                        <p class="listOfContentTittle">Arquivos do Projeto</p>
                                        <p>oiiiiiiiiiiiiiiiiiii</p>
                                    </div>
                                    
                                </div>

                                <div>
                                    <h11>Status</h11>
                                    <p class="ModalStatus">Em analise</p>
                                </div>
                                    
                                <div>
                                    <h11>Descrição</h11>
                                    <p class="modalDesc">${projeto.description_project}</p>
                                </div>

                                <div>
                                    <h11>Análise do Professor</h11>
                                    <p class="modalAnalizy">O andamento do projeto esta otimo, mas ainda precisa de ajustes em pequenos detalhes.</p>
                                </div>

                            </div>

                            <div class="buttonModal">
                                <button class="sendAnalizy" id="acceptProject">Aceitar Projeto</button>
                                <button class="sendAnalizy" id="rejectProject">Rejeitar Projeto</button>
                                <button class="sendAnalizy" id="visibilityProject"><i class="fi-rr-eye"></i>Visibilidade do Projeto</button>
                            </div>

                            


                        </dialog>


                    </div>   
            `
            container.appendChild(projetoCard)
        })

        rebinModalEvents()

    } catch (err) {
        console.error('Erro ao carregar projetos: ', err)
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
