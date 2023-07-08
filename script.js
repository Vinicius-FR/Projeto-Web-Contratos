// Variável global para controlar se estamos editando um contrato existente
let editingContractId = null;

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
                    <td>
                        <button onclick="loadContractData(${contract.id})">Editar</button>
                        <button onclick="deleteContract(${contract.id})">Excluir</button>
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

    const contractData = {
        client_name: clientName,
        contract_number: contractNumber,
        value: parseFloat(value),
        signature_date: signatureDate
    };

    fetch('http://localhost:5000/contracts', { // URL relativa para a rota /contracts
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(contractData)
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
                    <td>
                        <button onclick="loadContractData(${contract.id})">Editar</button>
                        <button onclick="deleteContract(${contract.id})">Excluir</button>
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

    fetch(`http://localhost:5000/contracts/${contractId}`) // URL relativa para a rota /contracts/{id}
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

    const contractData = {
        client_name: clientName,
        contract_number: contractNumber,
        value: parseFloat(value),
        signature_date: signatureDate
    };

    fetch(`http://localhost:5000/contracts/${contractId}`, { // URL relativa para a rota /contracts/{id}
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(contractData)
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