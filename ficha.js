
function enviar(callback) {
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

    

    const resposta2 = document.getElementById('resposta2');
    const resposta3 = document.getElementById('resposta3');
    const resposta4 = document.getElementById('resposta4');
    const resposta5 = document.getElementById('resposta5');
    const resposta6 = document.getElementById('resposta6');
    const resposta7 = document.getElementById('resposta7');
    const resposta8 = document.getElementById('resposta8');
    const resposta9 = document.getElementById('resposta9');
    const resposta10 = document.getElementById('resposta10');
    const resposta11 = document.getElementById('resposta11');
    const resposta12 = document.getElementById('resposta12');
    const resposta13 = document.getElementById('resposta13');
  
 


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
    //pergunta e resposta 11
    const respSelecionada11 = document.querySelector("input[name='pergunta11']:checked").value;
    resposta11.innerHTML = respSelecionada11
    //pergunta e resposta 12
    const respSelecionada12 = document.querySelector("input[name='pergunta12']:checked").value;
    resposta12.innerHTML = respSelecionada12
    //pergunta e resposta 13
    const respSelecionada13 = document.querySelector("input[name='pergunta13']:checked").value;
    resposta13.innerHTML = respSelecionada13

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

    const enviado = true; // Defina o valor de acordo com a sua lógica

    if (enviado) {
        callback(true); // Chama o callback com valor true
    } else {
        callback(false); // Chama o callback com valor false
    }


   
}
}




function confirmarRespostas() {
    enviar(function(envioBemSucedido) {
        if (envioBemSucedido) {
            const doc = new jsPDF();

            // Captura o HTML do elemento "respostas"
            const elementoRespostas = document.getElementById('respostas');
            const html = elementoRespostas.innerHTML;

            // Adiciona o HTML ao PDF usando um callback
            doc.fromHTML(html, 15, 15, {
                width: 170
            }, function () {
                // Ação a ser executada após a renderização bem-sucedida do HTML
                // Salva o PDF (download automático)
                doc.save('formulario.pdf');
            });
        }
    });
}



let selectedImage = null;

function checkedImg(imgElement) {
    const resposta1 = document.getElementById('box-img-resposta1');

    if (selectedImage) {
        selectedImage.classList.remove('selected');
    }

    if (selectedImage === imgElement) {
        selectedImage = null;
        resposta1.innerHTML = '';
    } else {
        imgElement.classList.add('selected');
        selectedImage = imgElement;

        const cloneImg = imgElement.cloneNode(true);
        cloneImg.removeAttribute('onclick');
        cloneImg.style.border = '';
        cloneImg.style.cursor = 'default';
        cloneImg.removeAttribute('class');

        // Defina o tamanho desejado da imagem no PDF (por exemplo, 200px de largura)
        cloneImg.style.width = '60px';
        cloneImg.style.height = '100px'; // Mantém a proporção original

        resposta1.innerHTML = '';
        resposta1.appendChild(cloneImg);
    }
};
