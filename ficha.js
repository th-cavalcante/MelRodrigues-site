
function enviar() {
    event.preventDefault();
// Chamando os inputs do formulário
const name = document.getElementById("name").value;
const date = document.getElementById("date").value;
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
    //pergunta e resposta 11
    const respSelecionada1 = document.querySelector("input[name='pergunta1']:checked").value;
    resposta1.innerHTML = respSelecionada1
     //pergunta e resposta 11
    const respSelecionada2 = document.querySelector("input[name='pergunta2']:checked").value;
    resposta2.innerHTML = respSelecionada2
     //pergunta e resposta 11
    const respSelecionada3 = document.querySelector("input[name='pergunta3']:checked").value;
    resposta3.innerHTML = respSelecionada3

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



function GerarPdf() {
    // Cria um novo objeto da biblioteca jspdf
    const doc = new jsPDF();

    // Define o título para o PDF
    doc.setFontSize(20);
    doc.text(10, 20, 'Ficha Anamnese preenchida');

    // Dados pessoais
    doc.setFontSize(14);
    doc.text(10, 40, 'Dados pessoais:');
    doc.setFontSize(12);
    doc.text(20, 50, 'Nome Completo:');
    doc.text(80, 50, document.getElementById('name-print').textContent);
    doc.text(20, 60, 'Data de Nascimento:');
    doc.text(80, 60, document.getElementById('date-print').textContent);
    doc.text(20, 70, 'RG:');
    doc.text(80, 70, document.getElementById('rg-print').textContent);

    // Sexo
    doc.text(20, 80, 'Sexo:');
    doc.text(80, 80, document.getElementById('genero-print').textContent);

    // Endereço
    doc.setFontSize(14);
    doc.text(10, 100, 'Endereço:');
    doc.setFontSize(12);
    doc.text(20, 110, 'Rua e nº:');
    doc.text(80, 110, document.getElementById('rua-print').textContent);
    doc.text(20, 120, 'Bairro:');
    doc.text(80, 120, document.getElementById('bairro-print').textContent);
    doc.text(20, 130, 'Cidade:');
    doc.text(80, 130, document.getElementById('cidade-print').textContent);
    doc.text(20, 140, 'CEP:');
    doc.text(80, 140, document.getElementById('cep-print').textContent);

    // Questionário clínico
    doc.setFontSize(14);
    doc.text(10, 160, 'Questionário clínico:');
    doc.setFontSize(12);
    doc.text(20, 170, 'Realizou alguma cirurgia?');
    doc.text(80, 170, document.getElementById('resposta1').textContent);
    doc.text(20, 180, 'Costuma fazer Depilação?');
    doc.text(80, 180, document.getElementById('resposta2').textContent);
    doc.text(20, 190, 'Está fazendo algum tratamento dermatológico?');
    doc.text(120, 190, document.getElementById('resposta3').textContent);

    // Observações
    doc.setFontSize(14);
    doc.text(10, 210, 'Observações:');
    doc.setFontSize(12);
    doc.text(20, 220, document.getElementById('resposta-obs').textContent);

    // Assinatura
    doc.text(10, 240, 'Assinatura:');
    doc.text(80, 240, '____________________________________________');

    // Salva o PDF com o nome "ficha_anamnese.pdf"
    doc.save('ficha_anamnese.pdf');
}

