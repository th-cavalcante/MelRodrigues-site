const btn = document.querySelector('#hamburguer');
btn.addEventListener('click', ()=>{
    showMenu()
})

function showMenu(){
    let menu = document.querySelector('#nav-list')
    if(menu.classList.contains('open')){
        menu.classList.remove('open')
        btn.innerHTML = `menu`
    }else{
        menu.classList.add('open')
        btn.innerHTML = `close`
    }
}

function closeOnClickMenu(){
    if(showMenu()){
        menu.remove()
    } 
}

//----------Script area cliente //////




///Script Select Area Cliente
// Verificar se o localStorage contém um valor para a opção selecionada
const selectedOption = localStorage.getItem('selectedOption');

function redirecionarPagina() {
    const selectElement = document.getElementById('area-cliente');
    const selectedOptionValue = selectElement.value;

    if (selectedOptionValue) {
        window.location.href = selectedOptionValue + '.html'; // Value do option + html (ficha.html e cuide-se.html)
    }
}

// Limpar o valor selecionado do select ao sair da página
window.addEventListener('beforeunload', () => {
    const selectElement = document.getElementById('area-cliente');
    selectElement.value = '';
    localStorage.removeItem('selectedOption');
});



// Animação da de algumas seções //

window.sr = ScrollReveal({reset: true });

sr.reveal('#title-principal', {
    rotate: { x: 0, y: 80, z: 0},
    duration: 2000,
})

sr.reveal('.card-benefit', {
    rotate: { x: 0, y: 80, z: 0},
    duration: 2000,
})

sr.reveal('#container-carrossel', {
    rotate: { x: 80, y: 0, z: 0},
    duration: 2000,
})

sr.reveal('#container-questions', {
    rotate: { x: 80, y: 0, z: 0},
    duration: 2000,
})

sr.reveal('#card-text-about-me', {
    rotate: { x: 80, y: 0, z: 0},
    duration: 2000,
})
















  