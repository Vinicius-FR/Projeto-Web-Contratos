// Variável global para controlar se estamos editando um contrato existente
let editingContractId = null;

function formatarNumero(input) {
  // Remove caracteres não numéricos, exceto o ponto
  const valorSemPontos = input.value.replace(/[^\d,]/g, '');
  
  // Separa a parte inteira da parte decimal
  const [parteInteira, parteDecimal] = valorSemPontos.split('.');

  // Formata a parte inteira, adicionando o ponto de milhar a cada 3 dígitos
  const parteInteiraFormatada = parteInteira.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  // Concatena novamente a parte inteira e a parte decimal (se houver)
  let valorFormatado = parteInteiraFormatada;
  if (parteDecimal !== undefined) {
    valorFormatado += ',' + parteDecimal;
  }

  // Atualiza o valor no campo de entrada
  input.value = valorFormatado;
}

// Função para buscar e exibir os contratos cadastrados
function fetchContracts() {
  fetch('http://localhost:5000/contracts') // URL relativa para a rota /contracts
    .then(response => response.json())
    .then(data => {
      const tableBody = document.querySelector('#contract-table tbody');
      tableBody.innerHTML = '';

      data.forEach(contract => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${contract.id}</td>
          <td>${contract.client_name}</td>
          <td>${contract.contract_number}</td>
          <td>${contract.value}</td>
          <td>${contract.signature_date}</td>
          <td>${contract.pdf_file}</td>
          <td>
            <button onclick="loadContractData(${contract.id})">Editar</button>
            <button onclick="deleteContract(${contract.id})">Excluir</button>
            <button onclick="downloadPdf(${contract.id})">Download PDF</button>
          </td>
        `;
        tableBody.appendChild(row);
      });
    });
}

// Função para cadastrar um novo contrato
function createContract(event) {
  event.preventDefault();

  const clientName = document.querySelector('#client-name').value;
  const contractNumber = document.querySelector('#contract-number').value;
  const value = document.querySelector('#value').value;
  const signatureDate = document.querySelector('#signature-date').value;
  const pdfFile = document.querySelector('#pdf-file').files[0];

  const contractData = new FormData();
  contractData.append('client_name', clientName);
  contractData.append('contract_number', contractNumber);
  contractData.append('value', value);
  contractData.append('signature_date', signatureDate);
  contractData.append('pdf_file', pdfFile);

  if (!validateName(clientName)) {
    alert('O campo Nome deve ter no mínimo 3 caracteres.');
    return;
  }

  if (!validateContract(contractNumber)) {
    alert('O campo Contrato deve ter só números e 9 caracteres.');
    return;
  }

  if (!validateValue(value)) {
    alert('O campo Valor deve ter valores numéricos com duas casas decimais.');
    return;
  }

  if (!validateDate(signatureDate)) {
    alert('O campo Data deve receber uma data válida e não poderá ser uma data futura.');
    return;
  }

  fetch('http://localhost:5000/contracts', { // URL relativa para a rota /contracts
    method: 'POST',
    body: contractData
  })
    .then(response => response.json())
    .then(data => {
      alert(data.message);
      document.querySelector('#contract-form').reset();
      fetchContracts();
    });
}

// Função para buscar contratos por nome ou número do contrato
function searchContracts(event) {
  event.preventDefault();

  const searchTerm = document.querySelector('#search-term').value;
  const searchColumn = document.querySelector('#search-column').value;

  fetch(`http://localhost:5000/contracts?search=${searchTerm}&column=${searchColumn}`) // URL relativa para a rota /contracts com o parâmetro de busca
    .then(response => response.json())
    .then(data => {
      const tableBody = document.querySelector('#contract-table tbody');
      tableBody.innerHTML = '';

      data.forEach(contract => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${contract.id}</td>
          <td>${contract.client_name}</td>
          <td>${contract.contract_number}</td>
          <td>${contract.value}</td>
          <td>${contract.signature_date}</td>
          <td>${contract.pdf_file}</td>
          <td>
            <button onclick="loadContractData(${contract.id})">Editar</button>
            <button onclick="deleteContract(${contract.id})">Excluir</button>
            <button onclick="downloadPdf(${contract.id})">Download PDF</button>
          </td>
        `;
        tableBody.appendChild(row);
      });
    }); 
}

// Função para carregar os dados do contrato no formulário para edição
function loadContractData(contractId) {
  editingContractId = contractId;
  const formButtons = document.querySelector('#form-buttons');

  // Atualizar o texto do botão para "Salvar Edição"
  formButtons.innerHTML = `<input type="submit" value="Salvar Edição">`;

  fetch(`http://localhost:5000/contract/${contractId}`) // URL relativa para a rota /contracts/{id}
    .then(response => response.json())
    .then(data => {
      document.querySelector('#contract-id').value = data.id;
      document.querySelector('#client-name').value = data.client_name;
      document.querySelector('#contract-number').value = data.contract_number;
      document.querySelector('#value').value = data.value;
      document.querySelector('#signature-date').value = data.signature_date;
    });
}

// Função para atualizar um contrato existente
function editContract(event) {
  event.preventDefault();

  const contractId = document.querySelector('#contract-id').value;
  const clientName = document.querySelector('#client-name').value;
  const contractNumber = document.querySelector('#contract-number').value;
  const value = document.querySelector('#value').value;
  const signatureDate = document.querySelector('#signature-date').value;
  const pdfFile = document.querySelector('#pdf-file').files[0];

  if (!validateName(clientName)) {
    alert('O campo Nome deve ter no mínimo 3 caracteres.');
    return;
  }

  if (!validateContract(contractNumber)) {
    alert('O campo Contrato deve ter só números e 9 caracteres.');
    return;
  }

  if (!validateValue(value)) {
    alert('O campo Valor deve ter valores numéricos com duas casas decimais.');
    return;
  }

  if (!validateDate(signatureDate)) {
    alert('O campo Data deve receber uma data válida e não poderá ser uma data futura.');
    return;
  }

  const contractData = new FormData();
  contractData.append('client_name', clientName);
  contractData.append('contract_number', contractNumber);
  contractData.append('value', value);
  contractData.append('signature_date', signatureDate);
  contractData.append('pdf_file', pdfFile);

  fetch(`http://localhost:5000/contracts/${contractId}`, { // URL relativa para a rota /contracts/{id}
    method: 'PUT',
    body: contractData
  })
    .then(response => response.json())
    .then(data => {
      alert(data.message);
      document.querySelector('#contract-form').reset();
      fetchContracts();

      // Resetar o formulário e os botões para o estado de cadastro
      editingContractId = null;
      const formButtons = document.querySelector('#form-buttons');
      formButtons.innerHTML = `<input type="submit" value="Cadastrar">`;
    });
}

// Função para excluir um contrato existente
function deleteContract(contractId) {
  if (confirm('Deseja excluir este contrato?')) {
    fetch(`http://localhost:5000/contracts/${contractId}`, { // URL relativa para a rota /contracts/{id}
      method: 'DELETE'
    })
      .then(response => response.json())
      .then(data => {
        alert(data.message);
        fetchContracts();
      });
  }
}

// Função para fazer o download do arquivo PDF de um contrato
function downloadPdf(contractId) {
  window.open(`http://localhost:5000/contracts/pdf/${contractId}`);
}

// Função para validar o campo Nome
function validateName(name) {
    return name.length >= 3;
  }
  
  // Função para validar o campo Contrato
  function validateContract(contract) {
    const contractRegex = /^[0-9]{9}$/;
    return contractRegex.test(contract);
  }
  
  // Função para validar o campo Valor
  function validateValue(value) {
    const valueRegex = /^\d+(\.\d{2})?$/;
    return valueRegex.test(value);
  }
  
  // Função para validar o campo Data
  function validateDate(date) {
    const currentDate = new Date().toISOString().split('T')[0];
    return date <= currentDate;
  }
  

// Event listener para o envio do formulário de cadastro/edição de contrato
document.querySelector('#contract-form').addEventListener('submit', (event) => {
  if (editingContractId) {
    editContract(event);
  } else {
    createContract(event);
  }
});

// Event listener para o envio do formulário de busca de contratos
document.querySelector('#search-form').addEventListener('submit', searchContracts);

// Buscar e exibir os contratos cadastrados ao carregar a página
fetchContracts();