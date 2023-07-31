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

function redirecionarPagina() {
    const selectElement = document.getElementById('area-cliente');
    const selectedOptionValue = selectElement.value;

    if (selectedOptionValue) {
        // Redirecionar para a página selecionada
        window.location.href = selectedOptionValue + '.html';
    }
}

  