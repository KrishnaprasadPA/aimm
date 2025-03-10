from pymongo import MongoClient,errors
from bson.objectid import ObjectId

# Establish a connection to the MongoDB server
client = MongoClient("mongodb://localhost:27017/")  # replace with your MongoDB URI if different
db = client["aimm"]  # replace with your database name
collection = db["target"]

# Define the data to insert
data = [
    {
        "_id": ObjectId(),
        "name": "Pecan",
        "description": "Pecan crop production and related data",
        "time_series_data": [
            {"year": year, "value": value, "normalized_value": round(value / 100, 2)}
            for year, value in zip(range(2000, 2025), [
                10.5, 15.3, 20.1, 18.2, 21.6, 23.4, 24.7, 26.1, 28.5, 29.9,
                31.3, 33.5, 35.1, 37.0, 38.4, 39.6, 41.2, 43.8, 45.1, 46.7,
                47.9, 49.4, 51.2, 52.7, 53.8
            ])
        ]
    },
    {
        "_id": ObjectId(),
        "name": "Urban",
        "description": "Urban area expansion and impact data",
        "time_series_data": [
            {"year": year, "value": value, "normalized_value": round(value / 100, 2)}
            for year, value in zip(range(2000, 2025), [
                20.2, 21.5, 22.3, 23.0, 24.1, 25.4, 26.6, 27.9, 29.1, 30.4,
                31.7, 32.9, 34.2, 35.5, 36.8, 38.0, 39.3, 40.6, 41.9, 43.2,
                44.5, 45.8, 47.1, 48.4, 49.7
            ])
        ]
    },
    {
        "_id": ObjectId(),
        "name": "Cotton",
        "description": "Cotton crop production and related data",
        "time_series_data": [
            {"year": year, "value": value, "normalized_value": round(value / 100, 2)}
            for year, value in zip(range(2000, 2025), [
                12.0, 13.7, 14.5, 15.3, 16.1, 16.9, 17.8, 18.6, 19.5, 20.3,
                21.2, 22.0, 22.9, 23.8, 24.6, 25.5, 26.4, 27.2, 28.1, 29.0,
                30.5, 31.4, 32.2, 33.7, 34.5
            ])
        ]
    },
    {
        "_id": ObjectId(),
        "name": "Water Quality",
        "description": "Water quality metrics and trends",
        "time_series_data": [
            {"year": year, "value": value, "normalized_value": round(value / 100, 2)}
            for year, value in zip(range(2000, 2025), [
                12.0, 13.7, 14.5, 15.3, 16.1, 16.9, 17.8, 18.6, 19.5, 20.3,
                21.2, 22.0, 22.9, 23.8, 24.6, 25.5, 26.4, 27.2, 28.1, 29.0,
                30.5, 31.4, 32.2, 33.7, 34.5
            ])
        ]
    },
    {
        "_id": ObjectId(),
        "name": "Water Availability",
        "description": "Water availability for agricultural use",
        "time_series_data": [
            {"year": year, "value": value, "normalized_value": round(value / 100, 2)}
            for year, value in zip(range(2000, 2025), [
                12.0, 13.7, 14.5, 15.3, 16.1, 16.9, 17.8, 18.6, 19.5, 20.3,
                21.2, 22.0, 22.9, 23.8, 24.6, 25.5, 26.4, 27.2, 28.1, 29.0,
                30.5, 31.4, 32.2, 33.7, 34.5
            ])
        ]
    }
]

try:
    result = collection.insert_many(data)
    print("Data successfully inserted. Document IDs:", result.inserted_ids)
except errors.BulkWriteError as e:
    print("Error inserting documents:", e.details)
except errors.ConnectionFailure as e:
    print("Failed to connect to MongoDB:", e)
except Exception as e:
    print("An unexpected error occurred:", e)
