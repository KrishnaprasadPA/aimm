import json

from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
from bson import ObjectId
import secrets
from datetime import datetime, timedelta
from flask_mail import Mail, Message



app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:4200"}})

# Configure MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["aimm"]
users_collection = db["users"]
factors_collection = db["factors"]
models_collection = db["models"]
target_collection = db["target"]

# Configure Flask-Mail
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'aimm.waterdmd@gmail.com'
app.config['MAIL_PASSWORD'] = ''
mail = Mail(app)

@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return response

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('name')
    email = data.get('email')
    password = data.get('password')
    level = data.get('level')
    description = data.get('level_description')

    if users_collection.find_one({"username": username}):
        return jsonify({"message": "User already exists"}), 400

    if users_collection.find_one({"email": email}):
        return jsonify({"message": "Email already exists"}), 400

    hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
    users_collection.insert_one({
        "username": username,
        "email": email,
        "password": hashed_password,
        "level": level,
        "description": description,
        "admin": False
    })

    return jsonify({"message": "User registered successfully"}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    user = users_collection.find_one({"email": email})

    if user and check_password_hash(user["password"], password):
        return jsonify({
            "message": "Login successful",
            "id": str(user["_id"]),
            "username": user["username"],
            "level": user["level"]
        }), 200

    return jsonify({"message": "Invalid credentials"}), 401

@app.route('/forgot-password', methods=['POST'])
def forgot_password():
    print("Reached forgot-password")
    data = request.get_json()
    email = data.get('email')

    # Check if user exists
    user = users_collection.find_one({"email": email})
    if not user:
        return jsonify({"message": "If the email exists, a reset link has been sent."}), 200

    # Generate secure token
    token = secrets.token_urlsafe(32)
    expiry_time = datetime.utcnow() + timedelta(hours=1)

    # Update user record with reset token and expiry
    users_collection.update_one(
        {"_id": user["_id"]},
        {"$set": {"reset_token": token, "reset_token_expiry": expiry_time}}
    )

    # Send reset link via email
    reset_link = f"http://localhost:3000/reset-password?token={token}"
    msg = Message("Password Reset Request",
                  sender="your_email@gmail.com",
                  recipients=[email])
    msg.body = f"Click the link to reset your password: {reset_link}"
    mail.send(msg)

    return jsonify({"message": "If the email exists, a reset link has been sent."}), 200


@app.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()
    token = data.get('token')
    new_password = data.get('password')

    # Find user by token and check expiry
    user = users_collection.find_one({
        "reset_token": token,
        "reset_token_expiry": {"$gt": datetime.utcnow()}
    })

    if not user:
        return jsonify({"message": "Invalid or expired token."}), 400

    # Hash new password and update user record
    hashed_password = generate_password_hash(new_password, method='pbkdf2:sha256')
    users_collection.update_one(
        {"_id": user["_id"]},
        {"$set": {
            "password": hashed_password,
            "reset_token": None,
            "reset_token_expiry": None
        }}
    )

    return jsonify({"message": "Password reset successfully."}), 200


@app.route('/api/target', methods=['GET'])
def get_targets():
    targets = list(target_collection.find({}, {"_id": 0}))
    return jsonify(targets)

@app.route('/api/factors', methods=['GET'])
def get_factors():
    factors = list(factors_collection.find({}, {"_id": 0}))
    return jsonify(factors)


@app.route('/api/factors', methods=['POST'])
def add_factors():
    data = request.get_json()
    factorname = data.get('name')
    description = data.get('description')
    time_series = [float(x) for x in data.get('timeSeries', [])]  # Assuming timeSeries is an array of 25 values

    if factors_collection.find_one({"name": factorname}):
        return jsonify({"message": "Factor name already exists"}), 400

    # Prepare time series data
    time_series_data = []
    years = range(2000, 2025)  # 25 years from 2000 to 2024

    if len(time_series) == 25:
        # Calculate normalized values
        min_value = min(time_series)
        max_value = max(time_series)
        normalized_values = [(x - min_value) / (max_value - min_value) if max_value != min_value else 0 for x in time_series]

        for year, value, normalized_value in zip(years, time_series, normalized_values):
            time_series_data.append({
                "year": year,
                "value": value,
                "normalized_value": normalized_value
            })

    new_factor = {
        "name": factorname,
        "description": description,
        "time_series_data": time_series_data,
        "creator": "user",
        "base": "new"
    }

    result = factors_collection.insert_one(new_factor)

    if result.inserted_id:
        print("Added successfully")
        return jsonify({"message": "Factor added successfully", "id": str(result.inserted_id)}), 201
    else:
        return jsonify({"message": "Failed to add factor"}), 500

    # return jsonify({"message": "Factor added successfully"}), 201


@app.route('/api/models', methods=['GET'])
def get_models():
    models = list(models_collection.find({"deleted": False}))
    users = list(users_collection.find({}, {"_id": 1, "level": 1}))
    user_levels = {str(user['_id']): user['level'] for user in users}

    grouped_models = {}
    for model in models:
        user_id = str(model.get('creator'))  # Assuming 'creator' is a user_id
        user_level = user_levels.get(user_id, "Unknown")

        if user_level not in grouped_models:
            grouped_models[user_level] = []
        grouped_models[user_level].append({
            "name": model["name"],
            "quality": model.get("quality", "Not trained"),
            "links": model.get("links", []),
            "target_factor": model.get("target_factor"),
            "graph_data": model.get("graph_data", [])
        })
    print(jsonify(grouped_models))
    return jsonify(grouped_models)

@app.route('/api/models/user', methods=['GET'])
def get_user_models():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400

    # Find models created by the specified user
    models = list(models_collection.find({"creator": user_id, "deleted": False}))

    # Prepare models data
    user_models = [{
        "id": str(model["_id"]),
        "name": model["name"],
        "quality": model.get("quality", "Not trained"),
        "links": model.get("links", []),
        "target_factor": model.get("target_factor"),
        "graph_data": model.get("graph_data", [])
    } for model in models]

    return jsonify(user_models)

@app.route('/api/models', methods=['POST'])
def save_model():
    try:
        # Parse the JSON request data
        data = request.get_json()
        print("Data inside save models is : ",data)

        # Validate required fields
        required_fields = ["name", "description", "links", "target_factor", "creator"]
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Missing required fields"}), 400

        # Construct the model document
        model = {
            "name": data["name"],
            "description": data["description"],
            "links": data.get("links", []),  # Default to an empty list if not provided
            "target_factor": data["target_factor"],
            "creator": data["creator"],  # Convert creator ID to ObjectId if provided as a string
            "quality": data.get("quality", None),  # Optional field, default is None
            "graph_data": data.get("graphData"),
            "deleted": data.get("deleted", False)  # Optional, defaults to False
        }
        print(model)

        # Insert the model into the database
        result = models_collection.insert_one(model)
        model_id = str(result.inserted_id)

        return jsonify({"message": "Model created successfully", "model_id": model_id}), 201

    except Exception as e:
        print("Error creating model:", e)
        return jsonify({"error": "An error occurred while creating the model."}), 500

@app.route('/api/models/delete/<model_id>', methods=['DELETE'])
def delete_model(model_id):
    print(model_id)
    try:
        # Update the `deleted` field of the specified model to True
        result = models_collection.update_one(
            {"_id": ObjectId(model_id)},  # Match the model by its ObjectId
            {"$set": {"deleted": True}}  # Set the `deleted` field to True
        )

        if result.matched_count == 0:
            return jsonify({"error": "Model not found"}), 404

        return jsonify({"message": "Model deleted successfully"}), 200
    except Exception as e:
        print(f"Error deleting model: {e}")
        return jsonify({"error": "An error occurred"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001)
