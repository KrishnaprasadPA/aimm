# import pandas as pd
# from pymongo import MongoClient
# from docx import Document

# # Load the FactorDescription.docx file
# doc = Document("FactorDescription.docx")

# # Extract the factor descriptions and create a mapping from original name to short name and description
# factor_mapping = {}
# for row in doc.tables[0].rows[1:]:  # Skip the header row
#     original_name = row.cells[0].text.strip()
#     short_name = row.cells[1].text.strip()
#     description = row.cells[2].text.strip()
#     factor_mapping[original_name] = {
#         "short_name": short_name,
#         "description": f"{original_name} : {description}"
#     }

# # Connect to MongoDB
# client = MongoClient("mongodb://localhost:27017/")
# db = client["aimm"]
# factors_collection = db["factor_imported"]

# # Load the Excel file
# file_path = "FinalDataset.xlsx"
# sheet_name = "3.AccountforInflation"  # The third sheet
# df = pd.read_excel(file_path, sheet_name=sheet_name)

# # Drop the first two rows (metadata and units)
# df = df.drop([0, 1]).reset_index(drop=True)

# # Rename columns to match the MongoDB schema
# df.columns = [
#     "Year", "Pecan price US", "Pecan price MX", "Cotton price US", "Cotton price MX", "Precipitation sum", "Temperature",
#     "Amendment Pecan Gypsum US", "Amendment Pecan Gypsum MX", "Amendment Pecan Urea (index dec 1979=100)",
#     "Labor US", "Labor MX", "Pecan area", "Cotton area", "Urban", "Alfalfa",
#     "GW availability, well #4904480", "GW availability, well #4913301", "GW quality, TDS, well #4914417",
#     "SW availability, El Paso", "SW availability, Elephant Butte", "SW availability, Juarez",
#     "SW quality, TDS, site IBWC 13272", "SW quality, TDS, site IBWC 14465"
# ]

# # Convert Year to integer
# df["Year"] = df["Year"].astype(int)

# # Function to normalize data
# def normalize_data(series):
#     max_value = series.max()
#     return series / max_value

# # Iterate over each column (except Year) and create a factor document
# for column in df.columns[1:]:  # Skip the Year column
#     original_name = column  # The column name is the original name
#     factor_info = factor_mapping.get(original_name, {
#         "short_name": original_name,  # Fallback to original name if not found
#         "description": f"{original_name} : No description available"
#     })
#     short_name = factor_info["short_name"]
#     description = factor_info["description"]

#     time_series_data = []

#     # Extract year, value, and normalized value
#     for index, row in df.iterrows():
#         year = row["Year"]
#         value = row[column]
#         normalized_value = normalize_data(df[column])[index]  # Normalize the value
#         time_series_data.append({
#             "year": year,
#             "value": value,
#             "normalized_value": normalized_value
#         })

#     # Create the factor document
#     factor_document = {
#         "name": short_name,  # Use the short name as the factor name
#         "description": description,  # Use the description from the factor_mapping dictionary
#         "time_series_data": time_series_data,
#         "creator": "admin",  # Set creator as admin
#         "base": "new"  # Set base as new
#     }

#     # Insert the document into the factors collection
#     factors_collection.insert_one(factor_document)

# print("Data insertion completed.")

import pandas as pd
import random
from pymongo import MongoClient
from docx import Document

# Load the FactorDescription.docx file
doc = Document("FactorDescription.docx")

# Extract the factor descriptions and create a mapping from original name to short name and description
factor_mapping = {}
for row in doc.tables[0].rows[1:]:  # Skip the header row
    original_name = row.cells[0].text.strip()
    short_name = row.cells[1].text.strip()
    description = row.cells[2].text.strip()
    factor_mapping[original_name] = {
        "short_name": short_name,
        "description": description
    }

# Connect to MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["aimm"]
factors_collection = db["factors"]

# Load the Excel file
file_path = "FinalDataset.xlsx"
sheet_name = "3.AccountforInflation"  # The third sheet
df = pd.read_excel(file_path, sheet_name=sheet_name)

# Drop the first two rows (metadata and units)
df = df.drop([0, 1]).reset_index(drop=True)

# Rename columns to match the MongoDB schema
expected_columns = [
    "Year",
    "Pecan price US", "Pecan price MX", "Cotton price US", "Cotton price MX",
    "Precipitation sum", "Temperature",
    "Amendment Pecan Gypsum US", "Amendment Pecan Gypsum MX", "Amendment Pecan Urea (index dec 1979=100)",
    "Labor US", "Labor MX",
    "Pecan area", "Cotton area", "Urban area", "Alfalfa area",
    "Pecan area MX", "Cotton area MX", "Urban area MX", "Alfalfa area MX",
    "Pecan area US", "Cotton area US", "Urban area US", "Alfalfa area US",
    "GW availability, well #4904480", "GW availability, well #4913301", "GW quality, TDS, well #4914417",
    "SW availability, El Paso", "SW availability, Elephant Butte", "SW availability, Juarez",
    "SW quality, TDS, site IBWC 13272", "SW quality, TDS, site IBWC 14465"
]


# Convert Year to integer
df["Year"] = df["Year"].astype(int)

# Function to standardize data
def standardize_data(series):
    return (series - series.mean()) / series.std()

# Function to generate suitable hex colors (avoid very light colors)
def get_contrasting_color():
    while True:
        r = random.randint(0, 180)
        g = random.randint(0, 180)
        b = random.randint(0, 180)
        brightness = (r*299 + g*587 + b*114) / 1000
        if brightness < 180:
            return '#{:02x}{:02x}{:02x}'.format(r, g, b)

# Iterate over each column (except Year) and create a factor document
for column in df.columns[1:]:  # Skip the Year column
    original_name = column
    factor_info = factor_mapping.get(original_name, {
        "short_name": original_name,
        "description": "No description available"
    })
    short_name = factor_info["short_name"]
    description = factor_info["description"]

    standardized_series = standardize_data(df[column])
    time_series_data = []

    for index, row in df.iterrows():
        year = row["Year"]
        value = row[column]
        standardized_value = standardized_series.iloc[index]
        time_series_data.append({
            "year": year,
            "value": value,
            "normalized_value": standardized_value
        })

    factor_document = {
        "name": short_name,
        "description": description,
        "time_series_data": time_series_data,
        "creator": "admin",
        "base": "new",
        "color": get_contrasting_color()
    }

    # Insert the document
    factors_collection.insert_one(factor_document)

print("Standardized data insertion with color completed.")
