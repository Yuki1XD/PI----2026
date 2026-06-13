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


const formAddProject = document.getElementById('formAddProject');
    if (formAddProject) {
        formAddProject.addEventListener('submit', async (e) => {
            e.preventDefault();

            const dados = {
                titulo: document.getElementById('newProjectTittle').value,
                descricao: document.getElementById('newProjectApresentation').value,
                usuario_id: 1 // Temporário: ajuste conforme seu sistema de login
            };

            try {
                const response = await fetch('/api/projetos/criar', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dados)
                });

                const resultado = await response.json();

                if (response.ok) {
                    alert('🚀 Projeto publicado com sucesso!');
                    window.location.reload(); // Recarrega para limpar e atualizar
                } else {
                    alert('Erro ao publicar: ' + (resultado.erro || 'Erro desconhecido'));
                }
            } catch (error) {
                console.error('Erro na requisição:', error);
                alert('Erro ao conectar com o servidor. O node index.js está rodando?');
            }
        });
    };