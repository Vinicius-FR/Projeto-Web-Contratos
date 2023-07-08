// Função para buscar e exibir os contratos cadastrados
function fetchContracts() {
    fetch('http://localhost:5000/contracts')
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

    fetch('http://localhost:5000/contracts', {
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

// Event listener para o envio do formulário de cadastro de contrato
document.querySelector('#contract-form').addEventListener('submit', createContract);

// Buscar e exibir os contratos cadastrados ao carregar a página
fetchContracts();