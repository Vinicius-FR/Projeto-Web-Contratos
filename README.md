# Gerenciamento de Contratos

Este é um projeto simples para demonstração de um sistema de gerenciamento de contratos. Ele consiste em um backend em Python usando o framework Flask e um frontend em HTML, CSS e JavaScript.

O sistema permite cadastrar, buscar, editar e excluir contratos, fornecendo uma interface de usuário simples para interagir com os dados dos contratos.

## Requisitos

- Python 3.6 ou superior instalado
- Flask 2.0.1 ou superior instalado
- SQLite 3 ou outro banco de dados compatível

## Configuração do Ambiente

1. Clone este repositório para o seu ambiente local (ou baixe os arquivos manualmente em uma mesma pasta).

2. Verifique se há uma pasta "uploads" no local onde está os outros arquivos do projeto, nela que serão armazenados os PDFs, então é essencial que ela exista na raiz do projeto.

3. Execute o back-end do projeto (contracts_api.py) em algum compilador de Python (como no Visual Studio Code mesmo).

4. Com o back-end rodando na porta 5000 do seu localhost (http://localhost:5000), abra o front-end (index.html) com o navegador de sua preferência.

5. Pronto, o site já deve estar pronto para cadastros, buscas e edições, armazenando seus feitos mesmo que você desligue e ligue novamente o back-end ou caso feche o navegador, por conta do banco de dados.
