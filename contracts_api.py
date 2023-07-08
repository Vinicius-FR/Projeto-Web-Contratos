import sqlite3
from flask import Flask, jsonify, request

app = Flask(__name__)

# Configuração para permitir solicitações de origem cruzada (CORS)
@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'  # Ou você pode especificar um domínio específico em vez de '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE'
    return response

def create_connection():
    conn = sqlite3.connect('contracts.db')
    return conn

def create_table(conn):
    query = '''
    CREATE TABLE IF NOT EXISTS contracts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_name TEXT NOT NULL,
        contract_number TEXT NOT NULL,
        value REAL NOT NULL,
        signature_date TEXT NOT NULL
    );
    '''
    conn.execute(query)

@app.route('/contracts', methods=['POST'])
def create_contract():
    data = request.get_json()
    conn = create_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO contracts (client_name, contract_number, value, signature_date) VALUES (?, ?, ?, ?)",
                   (data['client_name'], data['contract_number'], data['value'], data['signature_date']))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Contrato cadastrado com sucesso'})

# @app.route('/contracts/<id>', methods=['GET'])
# def get_contract(id):
#     conn = create_connection()
#     cursor = conn.cursor()
#     cursor.execute("SELECT * FROM contracts WHERE id=?", (id,))
#     contract = cursor.fetchone()
#     if not contract:
#         return jsonify({'message': 'Contrato não encontrado'})
#     contract_data = {}
#     contract_data['id'] = contract[0]
#     contract_data['client_name'] = contract[1]
#     contract_data['contract_number'] = contract[2]
#     contract_data['value'] = contract[3]
#     contract_data['signature_date'] = contract[4]
#     conn.close()
#     return jsonify(contract_data)

# Rota para buscar contratos
@app.route('/contracts', methods=['GET'])
def search_contracts():
    search_term = request.args.get('search', '')
    search_column = request.args.get('column', '')

    if search_term and search_column:
        # Conectar-se ao banco de dados SQLite
        conn = sqlite3.connect('contracts.db')
        cursor = conn.cursor()

        # Executar consulta SQL para buscar contratos
        cursor.execute(
            f"SELECT * FROM contracts WHERE {search_column} LIKE ?",
            (f"%{search_term}%",)
        )

        # Extrair os resultados da consulta
        results = cursor.fetchall()

        # Montar a lista de contratos como dicionários
        contracts = []
        for row in results:
            contract = {
                'id': row[0],
                'client_name': row[1],
                'contract_number': row[2],
                'value': row[3],
                'signature_date': row[4]
            }
            contracts.append(contract)

        # Fechar a conexão com o banco de dados
        conn.close()

        return jsonify(contracts)
    else:
        # Retorna todos os contratos se nenhum termo de busca for fornecido
        # Conectar-se ao banco de dados SQLite
        conn = sqlite3.connect('contracts.db')
        cursor = conn.cursor()

        # Executar consulta SQL para buscar todos os contratos
        cursor.execute("SELECT * FROM contracts")

        # Extrair os resultados da consulta
        results = cursor.fetchall()

        # Montar a lista de contratos como dicionários
        contracts = []
        for row in results:
            contract = {
                'id': row[0],
                'client_name': row[1],
                'contract_number': row[2],
                'value': row[3],
                'signature_date': row[4]
            }
            contracts.append(contract)

        # Fechar a conexão com o banco de dados
        conn.close()

        return jsonify(contracts)

@app.route('/contracts/<id>', methods=['PUT'])
def update_contract(id):
    data = request.get_json()
    conn = create_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE contracts SET client_name=?, contract_number=?, value=?, signature_date=? WHERE id=?",
                   (data['client_name'], data['contract_number'], data['value'], data['signature_date'], id))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Contrato atualizado com sucesso'})

@app.route('/contracts/<id>', methods=['DELETE'])
def delete_contract(id):
    conn = create_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM contracts WHERE id=?", (id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Contrato deletado com sucesso'})

if __name__ == '__main__':
    conn = create_connection()
    create_table(conn)
    conn.close()
    app.run(debug=True)
