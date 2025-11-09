from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from pymongo import MongoClient
from bson.objectid import ObjectId
import os

# 👇 Serve frontend (change folder name if needed)
app = Flask(__name__, static_folder="frontend", static_url_path="")
CORS(app)

# MongoDB setup
MONGODB_URI = os.environ.get('MONGODB_URI', 'mongodb://localhost:27017/')
client = MongoClient(MONGODB_URI)
db = client['gogig_db']
campaigns_col = db['campaigns']

# 👇 Serve frontend index.html
@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, 'index.html')

# === API ROUTES ===
@app.route('/api/health')
def health():
    return jsonify({'status': 'ok'})

@app.route('/api/campaigns', methods=['POST'])
def add_campaign():
    data = request.json
    required = ['campaign_name', 'client_name', 'start_date', 'status']
    if not all(k in data for k in required):
        return jsonify({'error': 'Missing fields'}), 400

    doc = {
        'campaign_name': data['campaign_name'],
        'client_name': data['client_name'],
        'start_date': data['start_date'],
        'status': data['status']
    }
    res = campaigns_col.insert_one(doc)
    doc['_id'] = str(res.inserted_id)
    return jsonify(doc), 201

@app.route('/api/campaigns', methods=['GET'])
def get_campaigns():
    q = request.args.get('q')
    status = request.args.get('status')
    filter_q = {}
    if status and status != 'All':
        filter_q['status'] = status
    if q:
        regex = {'$regex': q, '$options': 'i'}
        filter_q['$or'] = [{'campaign_name': regex}, {'client_name': regex}]
    docs = list(campaigns_col.find(filter_q))
    for d in docs:
        d['_id'] = str(d['_id'])
    return jsonify(docs)

@app.route('/api/campaigns/<id>', methods=['PUT'])
def update_campaign(id):
    data = request.json
    if 'status' not in data:
        return jsonify({'error': 'Missing status'}), 400
    res = campaigns_col.update_one({'_id': ObjectId(id)}, {'$set': {'status': data['status']}})
    if res.matched_count == 0:
        return jsonify({'error': 'Not found'}), 404
    doc = campaigns_col.find_one({'_id': ObjectId(id)})
    doc['_id'] = str(doc['_id'])
    return jsonify(doc)

@app.route('/api/campaigns/<id>', methods=['DELETE'])
def delete_campaign(id):
    res = campaigns_col.delete_one({'_id': ObjectId(id)})
    if res.deleted_count == 0:
        return jsonify({'error': 'Not found'}), 404
    return jsonify({'deleted': id})

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    if username == 'admin' and password == 'password123':
        return jsonify({'token': 'dummy-token', 'username': 'admin'})
    return jsonify({'error': 'Invalid credentials'}), 401

# 👇 Serve static files like JS/CSS
@app.route('/<path:path>')
def serve_static_files(path):
    return send_from_directory(app.static_folder, path)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, host='0.0.0.0', port=port)
