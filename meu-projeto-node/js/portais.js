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
spanAddArchive.innerHTML = '<i></i>Escolha um Arquivo par fazer upload'

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
        spanAddArchive.innerHTML = '<i></i>Escolha um Arquivo par fazer upload'
    }

})
