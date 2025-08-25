import json

from causal_estimation_module_with_confounders import run_analysis
from forecast_model import run_forecast
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
from bson import ObjectId
import secrets
from datetime import datetime, timedelta
from flask_mail import Mail, Message
from lstm import train_lstm_with_target
from dotenv import load_dotenv
import os


load_dotenv()


app = Flask(__name__)
CORS(app)

# Configure MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["aimm"]
users_collection = db["users"]
factors_collection = db["factors"]
models_collection = db["models"]
target_collection = db["target"]

# Configure Flask-Mail
app.config['MAIL_SERVER'] = 'mail.lunanode.net'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'admin@aimm.waterdmd.info'
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
mail = Mail(app)

#Configure API URI
apiUrl = os.getenv('REACT_APP_FRONTEND_URI')

@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return response

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    full_name = data.get('name')
    # user_id = data.get('user_id')
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
        "full_name": full_name,
        "email": email,
        "password": hashed_password,
        "level": level,
        "description": description,
        "admin": False
    })

    return jsonify({"message": "User registered successfully"}), 201

@app.route('/api/login', methods=['POST'])
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

@app.route('/api/forgot-password', methods=['POST'])
def forgot_password():
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
    reset_link = f"{apiUrl}/reset-password?token={token}"
    msg = Message("Password Reset Request",
                  sender="admin@aimm.waterdmd.info",
                  recipients=[email])
    msg.body = f"Click the link to reset your password: {reset_link}"
    mail.send(msg)

    return jsonify({"message": "If the email exists, a reset link has been sent."}), 200


@app.route('/api/reset-password', methods=['POST'])
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
        print("Not user")
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
    targets = list(target_collection.find({}))  # Fetch all documents

    for target in targets:
        target['_id'] = str(target['_id'])

    return jsonify(targets)

@app.route('/api/factors', methods=['GET'])
def get_factors():
    factors = list(factors_collection.find({}))

    for factor in factors:
        factor['_id'] = str(factor['_id'])
    return jsonify(factors)


@app.route('/api/factors', methods=['POST'])
def add_factors():
    data = request.get_json()
    factorname = data.get('name')
    description = data.get('description')
    color = data.get('color')
    time_series_data = data.get('time_series_data', [])

    if factors_collection.find_one({"name": factorname}):
        return jsonify({"message": "Factor name already exists"}), 400

    new_factor = {
        "name": factorname,
        "description": description,
        "time_series_data": time_series_data,
        "color": color,
        "creator": "user",
        "base": "new"
    }

    result = factors_collection.insert_one(new_factor)

    if result.inserted_id:
        print("Added successfully")
        return jsonify({"message": "Factor added successfully"}), 201
    else:
        return jsonify({"message": "Failed to add factor"}), 500



# @app.route('/api/models', methods=['GET'])
# def get_models():
#     models = list(models_collection.find({"deleted": False}))
#     users = list(users_collection.find({}, {"_id": 1, "level": 1}))
#     user_levels = {str(user['_id']): user['level'] for user in users}

#     grouped_models = {}
#     for model in models:
#         user_id = str(model.get('creator'))  # Assuming 'creator' is a user_id
#         user_level = user_levels.get(user_id, "Unknown")

#         if user_level not in grouped_models:
#             grouped_models[user_level] = []
#         grouped_models[user_level].append({
#             "name": model["name"],
#             "quality": model.get("quality", "Not trained"),
#             "links": model.get("links", []),
#             "target_factor": model.get("target_factor"),
#             "graph_data": model.get("graph_data", [])
#         })
#     print(jsonify(grouped_models))
#     return jsonify(grouped_models)

@app.route('/api/user_levels', methods=['GET'])
def get_user_levels():
    try:
        levels = users_collection.distinct("level")
        sorted_levels = sorted(levels)
        return jsonify(sorted_levels), 200
    except Exception as e:
        print(f"Error fetching user levels: {e}")
        return jsonify({"error": "An error occurred while fetching user levels."}), 500

@app.route('/api/models', methods=['GET'])
def get_models_summary():
    """
    Returns a summary of all models, excluding large graph_data.
    """
    models = list(models_collection.find({"deleted": False}, {"graph_data": 0})) # Exclude graph_data
    users = list(users_collection.find({}, {"_id": 1, "level": 1}))
    user_levels = {str(user['_id']): user['level'] for user in users}

    grouped_models = {}
    for model in models:
        user_id = str(model.get('creator')) # Assuming 'creator' is a user_id
        user_level = user_levels.get(user_id, "Unknown")

        if user_level not in grouped_models:
            grouped_models[user_level] = []

        # Prepare summary data for the list view
        model_summary = {
            "id": str(model["_id"]), # Crucial for fetching full details later
            "name": model["name"],
            "quality": model.get("quality", "Not trained"),
            # NO "graph_data" here
        }
        # print(jsonify(grouped_models))

        grouped_models[user_level].append(model_summary)

    # print(jsonify(grouped_models)) # Uncomment for debugging if needed
    return jsonify(grouped_models)

@app.route('/api/models/<model_id>', methods=['GET'])
def get_model_details(model_id):
    """
    Returns the full details of a single model, including graph_data.
    """
    try:
        # Convert model_id string to ObjectId for MongoDB query
        model = models_collection.find_one({"_id": ObjectId(model_id), "deleted": False})

        if model:
            # Convert ObjectId fields to string for JSON serialization
            model_data = {
                "id": str(model["_id"]),
                "name": model["name"],
                "quality": model.get("quality", "Not trained"),
                "links": model.get("links", []),
                "target_factor": model.get("target_factor"),
                "graph_data": model.get("graph_data", "{}") # Ensure it's always a string, default to empty JSON string
            }
            return jsonify(model_data)
        else:
            return jsonify({"error": "Model not found"}), 404
    except Exception as e:
        # Handle invalid ObjectId format or other database errors
        return jsonify({"error": str(e)}), 500

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
        data = request.get_json()
        required_fields = ["name", "description", "links", "target_factor", "creator", "adjacency_matrix"]
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400

        # The creator ID from the frontend is a string. Use it directly.
        creator_id_str = data["creator"]

        # Check for existing models with the same name and creator (as a string)
        existing_model = models_collection.find_one({
            "name": data["name"],
            "creator": creator_id_str
        })
        if existing_model:
            return jsonify({"error": "A model with this name already exists."}), 409

        model = {
            "name": data["name"],
            "description": data["description"],
            "links": data.get("links", []),
            "target_factor": data["target_factor"],
            "creator": creator_id_str, # Save the creator ID as a string
            "quality": data.get("quality", None),
            "graph_data": data.get("graphData"),
            "deleted": data.get("deleted", False),
            "adjacency_matrix": data.get("adjacency_matrix")
        }

        result = models_collection.insert_one(model)
        model_id = str(result.inserted_id)

        return jsonify({"message": "Model created successfully", "model_id": model_id}), 201

    except Exception as e:
        print("Error creating model:", e)
        return jsonify({"error": "An error occurred while creating the model."}), 500

@app.route('/api/models/update/<model_id>', methods=['PUT'])
def update_model(model_id):
    try:
        data = request.get_json()
        if not ObjectId.is_valid(model_id):
            return jsonify({"error": "Invalid model ID format"}), 400

        update_data = {
            "name": data["name"],
            "description": data["description"],
            "links": data.get("links", []),
            "target_factor": data["target_factor"],
            "quality": data.get("quality", None),
            "graph_data": data.get("graphData"),
            "deleted": data.get("deleted", False),
            "adjacency_matrix": data.get("adjacency_matrix")
        }

        result = models_collection.update_one(
            {"_id": ObjectId(model_id)},
            {"$set": update_data}
        )
        if result.matched_count == 0:
            return jsonify({"error": "Model not found"}), 404

        return jsonify({"message": "Model updated successfully"}), 200

    except Exception as e:
        print(f"Error updating model: {e}")
        return jsonify({"error": "An error occurred while updating the model."}), 500

@app.route('/api/models/delete/<model_id>', methods=['DELETE'])
def delete_model(model_id):
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

@app.route('/api/retrain', methods=['POST'])
def retrain_model():
    try:
        # Get the graph data from the request
        graph_data = request.get_json()

        updated_weights = run_analysis(graph_data)
        print("Updated weights are: ", updated_weights)

        # Return the updated weights to the frontend
        return jsonify(updated_weights), 200

    except Exception as e:
        print("Error ", e)
        return jsonify({"error": str(e)}), 500

@app.route('/api/predict', methods=['POST'])
def predict_future_values():
    try:
        graph_data = request.get_json()
        print(graph_data)
        result = run_forecast(graph_data)
        return jsonify(result), 200
    except Exception as e:
        print("Prediction error:", e)
        return jsonify({"error": str(e)}), 500

def generate_adjacency_matrix_from_links(links_list):
    try:
        all_factors = set()
        for link in links_list:
            all_factors.add(link["start_factor"])
            all_factors.add(link["end_factor"])
        
        factors_list = list(all_factors)
        adj_matrix = {from_f: {to_f: 0 for to_f in factors_list} for from_f in factors_list}

        for link in links_list:
            start_factor = link["start_factor"]
            end_factor = link["end_factor"]
            weight = link.get("weight", 1)
            
            if start_factor in adj_matrix and end_factor in adj_matrix[start_factor]:
                adj_matrix[start_factor][end_factor] = weight
        
        return adj_matrix
    except Exception as e:
        print(f"Error generating matrix from links data: {e}")
        return None
def get_user_ids_by_level(level):
    """
    Retrieves a list of MongoDB user IDs for a given user level,
    converted to string format.
    """
    print(f"DEBUG: Attempting to get user IDs for level: {level}")
    user_ids = []
    try:
        # Convert the incoming integer 'level' to a string to match the database's data type
        level_str = str(level)
        print(f"DEBUG: Querying for level as string: {level_str}")

        users_cursor = users_collection.find(
            {"level": level_str}, # <-- Corrected to use the string version
            {"_id": 1}
        )
        for user in users_cursor:
            user_ids.append(str(user["_id"]))
    except Exception as e:
        print(f"ERROR: Failed to fetch user IDs for level {level}: {e}")
        return []
    
    print(f"DEBUG: Found {len(user_ids)} users for level {level}. IDs: {user_ids}")
    return user_ids

@app.route('/api/models/aggregate/<int:user_level>', methods=['GET'])
def get_aggregated_matrix(user_level):
    try:
        print(f"DEBUG: Endpoint /api/models/aggregate/{user_level} called.")
        user_ids_in_level = get_user_ids_by_level(user_level)
        
        # Check if user IDs were found for the level
        if not user_ids_in_level:
            print(f"DEBUG: No users found for level {user_level}. Returning empty matrix.")
            return jsonify({
                "aggregated_matrix": {},
                "summary": {
                    "user_level": user_level,
                    "num_models": 0,
                    "num_factors": 0,
                    "num_links": 0
                }
            }), 200

        # Query the database for models
        print(f"DEBUG: Querying for models with creator IDs: {user_ids_in_level}")
        models_cursor = models_collection.find(
            {"creator": {"$in": user_ids_in_level}},
            {"adjacency_matrix": 1, "links": 1}
        )
        
        # Check how many models are found by the query
        models_list = list(models_cursor)
        print(f"DEBUG: Found {len(models_list)} models matching the query.")
        
        if len(models_list) == 0:
            return jsonify({
                "aggregated_matrix": {},
                "summary": {
                    "user_level": user_level,
                    "num_models": 0,
                    "num_factors": 0,
                    "num_links": 0
                }
            }), 200
        
        # Reset the cursor for the aggregation loop
        models_cursor = models_collection.find(
            {"creator": {"$in": user_ids_in_level}},
            {"adjacency_matrix": 1, "links": 1}
        )

        sum_matrix = {}
        count_matrix = {}
        all_factors = set()
        
        # Start the aggregation loop
        print("DEBUG: Starting aggregation loop.")
        for model in models_cursor:
            adj_matrix = None
            adj_matrix_str = model.get("adjacency_matrix")

            if adj_matrix_str:
                print(f"DEBUG: Found adjacency_matrix for model {model['_id']}. Parsing...")
                adj_matrix = json.loads(adj_matrix_str)
            elif model.get("links"):
                print(f"DEBUG: No adjacency_matrix. Generating from links for model {model['_id']}...")
                adj_matrix = generate_adjacency_matrix_from_links(model["links"])

            if not adj_matrix:
                print(f"WARNING: Could not find or generate matrix for model {model['_id']}. Skipping.")
                continue

            current_factors = list(adj_matrix.keys())
            all_factors.update(current_factors)
            
            # Print details about the current matrix being processed
            print(f"DEBUG: Processing matrix for model {model['_id']} with factors: {current_factors}")
            for from_factor, to_links in adj_matrix.items():
                for to_factor, weight in to_links.items():
                    if weight != 0:
                        # Print each non-zero weight being aggregated
                        print(f"DEBUG: Aggregating link from '{from_factor}' to '{to_factor}' with weight {weight}")
                        
                        if from_factor not in sum_matrix:
                            sum_matrix[from_factor] = {}
                            count_matrix[from_factor] = {}
                        if to_factor not in sum_matrix[from_factor]:
                            sum_matrix[from_factor][to_factor] = 0
                            count_matrix[from_factor][to_factor] = 0
                            
                        sum_matrix[from_factor][to_factor] += weight
                        count_matrix[from_factor][to_factor] += 1
        
        # Final aggregation logic
        print("DEBUG: Calculating final aggregated matrix...")
        aggregated_matrix = {factor: {f: 0 for f in all_factors} for factor in all_factors}
        
        for from_factor, to_links in sum_matrix.items():
            for to_factor, total_sum in to_links.items():
                if count_matrix.get(from_factor, {}).get(to_factor, 0) > 0:
                    average_weight = total_sum / count_matrix[from_factor][to_factor]
                    aggregated_matrix[from_factor][to_factor] = average_weight
        
        num_models = models_collection.count_documents({"creator": {"$in": user_ids_in_level}})
        num_links = sum(sum(1 for w in row.values() if w != 0) for row in aggregated_matrix.values())
        
        summary = {
            "user_level": user_level,
            "num_models": num_models,
            "num_factors": len(all_factors),
            "num_links": num_links
        }
        
        print(f"DEBUG: Final Aggregation Summary: {summary}")
        print(f"DEBUG: Final Aggregated Matrix: {aggregated_matrix}")
        
        return jsonify({
            "aggregated_matrix": aggregated_matrix,
            "summary": summary
        }), 200

    except Exception as e:
        print(f"ERROR: Unhandled exception during aggregation: {e}")
        return jsonify({"error": "An error occurred while aggregating models."}), 500

if __name__ == '__main__':
    if os.getenv('ENVIRONMENT')== 'LOCAL':
        app.run(debug=True, ssl_context=('localhost.pem', 'localhost-key.pem'), port=5001)
    else:
        app.run(debug=True, host='127.0.0.1', port=5001)

