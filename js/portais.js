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