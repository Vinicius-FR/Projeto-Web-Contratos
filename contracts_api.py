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

@app.route('/contracts', methods=['GET'])
def get_all_contracts():
    conn = create_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM contracts")
    contracts = cursor.fetchall()
    result = []
    for contract in contracts:
        contract_data = {}
        contract_data['id'] = contract[0]
        contract_data['client_name'] = contract[1]
        contract_data['contract_number'] = contract[2]
        contract_data['value'] = contract[3]
        contract_data['signature_date'] = contract[4]
        result.append(contract_data)
    conn.close()
    return jsonify(result)

@app.route('/contracts/<id>', methods=['GET'])
def get_contract(id):
    conn = create_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM contracts WHERE id=?", (id,))
    contract = cursor.fetchone()
    if not contract:
        return jsonify({'message': 'Contrato não encontrado'})
    contract_data = {}
    contract_data['id'] = contract[0]
    contract_data['client_name'] = contract[1]
    contract_data['contract_number'] = contract[2]
    contract_data['value'] = contract[3]
    contract_data['signature_date'] = contract[4]
    conn.close()
    return jsonify(contract_data)

@app.route('/contracts', methods=['PUT'])
def update_contract():
    data = request.get_json()
    conn = create_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE contracts SET client_name=?, contract_number=?, value=?, signature_date=? WHERE id=?",
                   (data['client_name'], data['contract_number'], data['value'], data['signature_date'], data['id']))
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
