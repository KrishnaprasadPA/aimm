
import pandas as pd
import random
from pymongo import MongoClient

# MongoDB connection
client = MongoClient("mongodb://localhost:27017/")
db = client["aimm"]
factors_collection = db["factors"]

# Load Excel
file_path = "FinalDataset.xlsx"
sheet_name = "3.AccountforInflation"
df_raw = pd.read_excel(file_path, sheet_name=sheet_name, header=None)

# Expected headers
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

# Extract metadata
short_names = [str(x).strip() for x in df_raw.iloc[2, 1:]]
units = [str(x).strip() for x in df_raw.iloc[1, 1:]]
descriptions = [str(x).strip() for x in df_raw.iloc[3, 1:]]

# Drop metadata and reset DataFrame
df = df_raw.iloc[5:].reset_index(drop=True)
df.columns = expected_columns
df["Year"] = df["Year"].astype(int)

# Standardization helper
def standardize_data(series):
    return (series - series.mean()) / series.std()

# Color generator
def get_contrasting_color():
    while True:
        r, g, b = random.randint(0, 180), random.randint(0, 180), random.randint(0, 180)
        brightness = (r * 299 + g * 587 + b * 114) / 1000
        if brightness < 180:
            return f'#{r:02x}{g:02x}{b:02x}'

# Loop through each factor (excluding "Year")
for idx, col in enumerate(expected_columns[1:]):
    series = pd.to_numeric(df[col], errors="coerce")
    std_series = standardize_data(series)

    time_series_data = [
        {
            "year": int(df.iloc[i]["Year"]),
            "value": float(series.iloc[i]),
            "normalized_value": float(std_series.iloc[i])
        }
        for i in range(len(df))
    ]

    factor_document = {
        "name": short_names[idx] if idx < len(short_names) else col,  # <-- use short name for `name`
        "description": descriptions[idx] if idx < len(descriptions) else f"{col} : No description",
        "unit": units[idx].strip() if idx < len(units) else "",
        "time_series_data": time_series_data,
        "creator": "admin",
        "base": "new",
        "color": get_contrasting_color()
    }

    factors_collection.insert_one(factor_document)

print("✅ All factor documents inserted successfully.")



