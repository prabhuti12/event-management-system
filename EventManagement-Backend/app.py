
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import psycopg2
import os
from werkzeug.utils import secure_filename
from queries import *

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:3000", "https://alleventsmanagement.netlify.app"]}})

# Configuration for file uploads
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Ensure the upload folder exists
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

db_params = {
    'dbname': os.getenv('DB_NAME', 'alleventsdb'),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD', 'Prabhuti@296801'),
    'host': os.getenv('DB_HOST', '127.0.0.1'),
    'port': os.getenv('DB_PORT', '5432')
}

def get_db_connection():
    return psycopg2.connect(**db_params)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        return jsonify({'file_path': f'/uploads/{filename}'}), 200
    return jsonify({'error': 'Invalid file type'}), 400

@app.route('/api/data', methods=['GET'])
def get_data():
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(FETCH_EVENT_DETAILS)
        rows = cur.fetchall()
        cur.close()
        return jsonify([rows])
    except Exception as e:
        print("Error:", e)
        return jsonify({'error': str(e)}), 500
    finally:
        if conn:
            conn.close()

@app.route('/api/create/event', methods=['POST'])
def create_event():
    conn = None
    try:
        data = request.form
        required_fields = ['event_name', 'start_time', 'end_time', 'location', 'description', 'category']
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400

        # Validate field lengths
        if len(data['event_name']) > 100:
            return jsonify({'error': 'Event name exceeds 100 characters'}), 400
        if len(data['location']) > 255:
            return jsonify({'error': 'Location exceeds 255 characters'}), 400
        if len(data['category']) > 50:
            return jsonify({'error': 'Category exceeds 50 characters'}), 400

        banner_image_url = data.get('banner_image_url', '')
        if 'file' in request.files:
            file = request.files['file']
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                file.save(file_path)
                banner_image_url = f'/uploads/{filename}'
        # elif banner_image_url and len(banner_image_url) > 255:
        #     return jsonify({'error': 'Banner image URL exceeds 255 characters'}), 400
        elif not banner_image_url:
            return jsonify({ 'file is required'}), 400

        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(CREATE_NEW_EVENT, (
            data['event_name'],
            data['start_time'],
            data['end_time'],
            data['location'],
            data['description'],
            data['category'],
            banner_image_url
        ))
        conn.commit()
        cur.close()
        return jsonify({'message': 'Event created successfully'}), 201
    except psycopg2.Error as e:
        if conn:
            conn.rollback()
        return jsonify({'error': str(e)}), 500
    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        if conn:
            conn.close()

@app.route('/api/events/update/<event_id>', methods=['PUT'])
def update_event(event_id):
    conn = None
    try:
        data = request.form
        required_fields = ['event_name', 'start_time', 'end_time', 'location', 'description', 'category']
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400

        banner_image_url = data.get('banner_image_url', '')
        if 'file' in request.files:
            file = request.files['file']
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                file.save(file_path)
                banner_image_url = f'/uploads/{filename}'
        elif not banner_image_url:
            return jsonify({'error': 'file is required'}), 400

        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(UPDATE_EVENT, (
            data['event_name'],
            data['start_time'],
            data['end_time'],
            data['location'],
            data['description'],
            data['category'],
            banner_image_url,
            event_id
        ))
        if cur.rowcount == 0:
            return jsonify({'error': 'Event not found'}), 404
        conn.commit()
        cur.close()
        return jsonify({'message': 'Event updated successfully'}), 200
    except psycopg2.Error as e:
        if conn:
            conn.rollback()
        return jsonify({'error': str(e)}), 500
    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        if conn:
            conn.close()

@app.route('/api/events/delete/<event_id>', methods=['DELETE'])
def delete_event(event_id):
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(DELETE_EVENT_BY_ID, (event_id,))
        if cur.rowcount == 0:
            return jsonify({'error': 'Event not found'}), 404
        conn.commit()
        cur.close()
        return jsonify({'message': 'Event deleted successfully'}), 200
    except psycopg2.Error as e:
        if conn:
            conn.rollback()
        return jsonify({'error': str(e)}), 500
    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        if conn:
            conn.close()

if __name__ == '__main__':
    app.run(debug=True)

