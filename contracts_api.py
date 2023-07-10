import os
import sqlite3
from flask import Flask, jsonify, request, send_from_directory
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['ALLOWED_EXTENSIONS'] = {'pdf'}

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
        signature_date TEXT NOT NULL,
        pdf_file TEXT
    );
    '''
    conn.execute(query)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

@app.route('/contracts', methods=['POST'])
def create_contract():
    client_name = request.form['client_name']
    contract_number = request.form['contract_number']
    value = request.form['value']
    signature_date = request.form['signature_date']
    pdf_file = request.files['pdf_file']

    if pdf_file and allowed_file(pdf_file.filename):
        filename = secure_filename(pdf_file.filename)
        pdf_file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))

        conn = create_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO contracts (client_name, contract_number, value, signature_date, pdf_file) "
            "VALUES (?, ?, ?, ?, ?)",
            (client_name, contract_number, value, signature_date, filename)
        )
        conn.commit()
        conn.close()

        return jsonify({'message': 'Contrato cadastrado com sucesso'})
    else:
        return jsonify({'message': 'Erro ao cadastrar contrato. Arquivo PDF não fornecido ou formato inválido.'})


@app.route('/contract/<id>', methods=['GET'])
def get_contract(id):
    conn = create_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM contracts WHERE id=?", (id,))
    contract = cursor.fetchone()

    if contract:
        contract_data = {
            'id': contract[0],
            'client_name': contract[1],
            'contract_number': contract[2],
            'value': contract[3],
            'signature_date': contract[4],
            'pdf_file': contract[5]
        }
        conn.close()
        return jsonify(contract_data)
    else:
        conn.close()
        return jsonify({'message': 'Contrato não encontrado'}), 404


@app.route('/contracts', methods=['GET'])
def search_contracts():
    search_term = request.args.get('search', '')
    search_column = request.args.get('column', '')

    if search_term and search_column:
        conn = create_connection()
        cursor = conn.cursor()
        cursor.execute(
            f"SELECT * FROM contracts WHERE {search_column} LIKE ?",
            (f"%{search_term}%",)
        )
        results = cursor.fetchall()
        contracts = []
        for row in results:
            contract = {
                'id': row[0],
                'client_name': row[1],
                'contract_number': row[2],
                'value': row[3],
                'signature_date': row[4],
                'pdf_file': row[5]
            }
            contracts.append(contract)
        conn.close()
        return jsonify(contracts)
    else:
        conn = create_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM contracts")
        results = cursor.fetchall()
        contracts = []
        for row in results:
            contract = {
                'id': row[0],
                'client_name': row[1],
                'contract_number': row[2],
                'value': row[3],
                'signature_date': row[4],
                'pdf_file': row[5]
            }
            contracts.append(contract)
        conn.close()
        return jsonify(contracts)

@app.route('/contracts/<id>', methods=['PUT'])
def update_contract(id):
    client_name = request.form['client_name']
    contract_number = request.form['contract_number']
    value = request.form['value']
    signature_date = request.form['signature_date']

    conn = create_connection()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE contracts SET client_name=?, contract_number=?, value=?, signature_date=? WHERE id=?",
        (client_name, contract_number, value, signature_date, id)
    )
    conn.commit()
    conn.close()

    return jsonify({'message': 'Contrato atualizado com sucesso'})

@app.route('/contracts/<id>', methods=['DELETE'])
def delete_contract(id):
    conn = create_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT pdf_file FROM contracts WHERE id=?", (id,))
    result = cursor.fetchone()
    if result:
        pdf_file = result[0]
        if pdf_file:
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], pdf_file)
            if os.path.isfile(file_path):
                os.remove(file_path)

    cursor.execute("DELETE FROM contracts WHERE id=?", (id,))
    conn.commit()
    conn.close()

    return jsonify({'message': 'Contrato deletado com sucesso'})

@app.route('/contracts/pdf/<id>', methods=['GET'])
def download_pdf(id):
    conn = create_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT pdf_file FROM contracts WHERE id=?", (id,))
    pdf_file = cursor.fetchone()

    if pdf_file:
        filename = pdf_file[0]
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename, as_attachment=True)
    else:
        return jsonify({'message': 'Arquivo PDF não encontrado.'}), 404

if __name__ == '__main__':
    conn = create_connection()
    create_table(conn)
    conn.close()
    app.run(debug=True)
