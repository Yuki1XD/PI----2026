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

    items.forEach(item =>{
        if (FormaString(item.textContent).indexOf(value) !== -1) {
            item.style.display = 'flex'

            let hasResults = true
        }
        else {
            item.style.display = 'none'
        }
    })

    if (hasResults) {
        noResultsForSearch.style.display = 'none'
    }
    else {
        noResultsForSearch.style.display = 'block'
    }

})

function FormaString(value) {
    return value.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

// JS para o Modal

const openModal = document.querySelectorAll('.openModal')

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
