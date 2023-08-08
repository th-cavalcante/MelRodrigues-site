
function enviar() {
    event.preventDefault();
// Chamando os inputs do formulário
const name = document.getElementById("name").value;
const date = document.getElementById("input-date").value;
const rg = document.getElementById("rg").value;
const rua = document.getElementById("rua").value;
const bairro = document.getElementById("bairro").value;
const cidade = document.getElementById("cidade").value;
const cep = document.getElementById("cep").value;


// Trazendo o formulário e a seção de respostas
const form = document.getElementById('anamnese');
const respostas = document.getElementById('respostas');

if (form) {
    // Nome, data de nascimento, RG
    const nomePrint = document.getElementById('name-print');
    const datePrint = document.getElementById('date-print');
    const rgPrint = document.getElementById('rg-print');
    // Rua, nº, bairro, cidade e cep
    const ruaPrint = document.getElementById('rua-print');
    const bairroPrint = document.getElementById('bairro-print');
    const cidadePrint = document.getElementById('cidade-print');
    const cepPrint = document.getElementById('cep-print');

    nomePrint.innerHTML = `${name}`;
    datePrint.innerHTML = `${date}`;
    rgPrint.innerHTML = `${rg}`;
    ruaPrint.innerHTML = `${rua}`;
    bairroPrint.innerHTML = `${bairro}`;
    cidadePrint.innerHTML = `${cidade}`;
    cepPrint.innerHTML = `${cep}`;

    // Sexo (checked- Radio)
    const generoPrint = document.getElementById('genero-print');
    const generoSelecionado = document.querySelector("input[name='genero']:checked").value;
    generoPrint.innerHTML = generoSelecionado;

    // Respostas (checked- Radio)
    const resposta1 = document.getElementById('resposta1');
    const resposta2 = document.getElementById('resposta2');
    const resposta3 = document.getElementById('resposta3');
    const resposta4 = document.getElementById('resposta4');
    const resposta5 = document.getElementById('resposta5');
    const resposta6 = document.getElementById('resposta6');
    const resposta7 = document.getElementById('resposta7');
    const resposta8 = document.getElementById('resposta8');
    const resposta9 = document.getElementById('resposta9');
    const resposta10 = document.getElementById('resposta10');
    //pergunta e resposta 1
    const respSelecionada1 = document.querySelector("input[name='pergunta1']:checked").value;
    resposta1.innerHTML = respSelecionada1
     //pergunta e resposta 2
    const respSelecionada2 = document.querySelector("input[name='pergunta2']:checked").value;
    resposta2.innerHTML = respSelecionada2
     //pergunta e resposta 3
    const respSelecionada3 = document.querySelector("input[name='pergunta3']:checked").value;
    resposta3.innerHTML = respSelecionada3
    //pergunta e resposta 4
    const respSelecionada4 = document.querySelector("input[name='pergunta4']:checked").value;
    resposta4.innerHTML = respSelecionada4
    //pergunta e resposta 5
    const respSelecionada5 = document.querySelector("input[name='pergunta5']:checked").value;
    resposta5.innerHTML = respSelecionada5
    //pergunta e resposta 6
    const respSelecionada6 = document.querySelector("input[name='pergunta6']:checked").value;
    resposta6.innerHTML = respSelecionada6
    //pergunta e resposta 7
    const respSelecionada7 = document.querySelector("input[name='pergunta7']:checked").value;
    resposta7.innerHTML = respSelecionada7
    //pergunta e resposta 8
    const respSelecionada8 = document.querySelector("input[name='pergunta8']:checked").value;
    resposta8.innerHTML = respSelecionada8
    //pergunta e resposta 9
    const respSelecionada9 = document.querySelector("input[name='pergunta9']:checked").value;
    resposta9.innerHTML = respSelecionada9
    //pergunta e resposta 10
    const respSelecionada10 = document.querySelector("input[name='pergunta10']:checked").value;
    resposta10.innerHTML = respSelecionada10

    //observacoes
    const respObservation = document.getElementById('campo-observation').value;
    const txtObservation = document.getElementById('resposta-obs')
    if(respObservation){
        txtObservation.innerHTML = respObservation;
    }else{
        txtObservation.innerHTML = 'Nada a dizer...'
    }
    



    // Ao clicar em enviar, o formulário fecha e abre a div de respostas
    form.style.display = 'none';
    respostas.style.display = 'block';
}
}

function checkedImg(imgElement) {
    const allImages = document.getElementsByClassName('img-cor-pele');
    for(const img of allImages){
        if(img === imgElement){
            img.style.border ='2px solid blue';
        }else{
            img.style.border =  '';
        }
    }
  
}







function GerarPdf() {
    // Verifica se todos os campos obrigatórios foram preenchidos
    const name = document.getElementById("name").value;
    const date = document.getElementById("input-date").value;
    const rg = document.getElementById("rg").value;
    const rua = document.getElementById("rua").value;
    const bairro = document.getElementById("bairro").value;
    const cidade = document.getElementById("cidade").value;
    const cep = document.getElementById("cep").value;

    if (!name || !date || !rg || !rua || !bairro || !cidade || !cep) {
        alert('Por favor, preencha todos os campos obrigatórios antes de gerar o PDF.');
        return;
    }

    // Verifica se todas as perguntas foram respondidas
    const perguntasRespondidas = document.querySelectorAll('input[name^="pergunta"]:checked');
    if (perguntasRespondidas.length < 10) {
        alert('Por favor, responda todas as perguntas antes de gerar o PDF.');
        return;
    }

    // Se todos os campos obrigatórios e perguntas foram preenchidos, continua com a geração do PDF
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text(10, 20, 'Ficha Anamnese preenchida');

    const perguntasRespostas = document.querySelectorAll('.respostas');
    let yPosition = 40; // Define a posição vertical inicial

    perguntasRespostas.forEach((item) => {
        const pergunta = item.querySelector('.pergunta').textContent;
        const resposta = item.querySelector('.resposta').textContent;

        doc.setFontSize(12);
        doc.text(20, yPosition, pergunta);
        doc.text(80, yPosition, resposta);
        yPosition += 15; // Incrementa a posição vertical para a próxima pergunta e resposta
    });

    doc.save('ficha_anamnese.pdf');
}




