# # forecast_model.py
# import numpy as np
# import pandas as pd
# from sklearn.linear_model import LinearRegression

# def run_forecast(graph_data):
#     print(graph_data)
#     target_name = graph_data.get("selectedTarget")
#     factors = graph_data.get("factors")
#     links = graph_data.get("links")

#     if target_name not in factors:
#         raise ValueError("Target factor not found in graph")

#     # Extract target series
#     target_series = factors[target_name]["data"]["time_series_data"]
#     df = pd.DataFrame(target_series)
#     df = df[df["year"] <= 2035]

#     # Feature construction using 5-year lag
#     df["y"] = df["value"]
#     for lag in range(1, 6):
#         df[f"lag_{lag}"] = df["y"].shift(lag)

#     df.dropna(inplace=True)
#     train_df = df[df["year"] <= 2017]
#     test_df = df[(df["year"] > 2017) & (df["year"] <= 2024)]
#     future_df = pd.DataFrame({"year": list(range(2025, 2036))})

#     # Train
#     model = LinearRegression()
#     X_train = train_df[[f"lag_{i}" for i in range(1, 6)]]
#     y_train = train_df["y"]
#     model.fit(X_train, y_train)

#     # Test accuracy (quality)
#     X_test = test_df[[f"lag_{i}" for i in range(1, 6)]]
#     y_test = test_df["y"]
#     y_pred_test = model.predict(X_test)
#     mse = np.mean((y_test - y_pred_test) ** 2)
#     quality = max(0, 100 - mse)

#     # Predict future
#     # predictions = []
#     # last_known = df.iloc[-5:]["y"].tolist()
#     # for year in range(2025, 2036):
#     #     X_input = np.array(last_known[-5:]).reshape(1, -1)
#     #     y_pred = model.predict(X_input)[0]
#     #     predictions.append({"year": year, "value": y_pred, "normalized_value": y_pred})  # Normalize if needed
#     #     last_known.append(y_pred)

#     # 1. Predict future values and collect raw outputs
#     raw_preds = []
#     last_known = df.iloc[-5:]["y"].tolist()

#     for year in range(2025, 2036):
#         X_input = np.array(last_known[-5:]).reshape(1, -1)
#         y_pred = model.predict(X_input)[0]
#         raw_preds.append((year, y_pred))
#         last_known.append(y_pred)

#     # 2. Extract only predicted values
#     pred_values = np.array([val for (_, val) in raw_preds])

#     # 3. Normalize predicted values to [0, 1]
#     min_val = np.min(pred_values)
#     max_val = np.max(pred_values)
#     normalized = (pred_values) / (max_val+ 1e-8)

#     # 4. Combine into predictions list
#     predictions = []
#     for (year, raw_val), norm_val in zip(raw_preds, normalized):
#         predictions.append({
#             "year": year,
#             "value": round(raw_val, 2),
#             "normalized_value": round(norm_val, 4)
#         })


#     predicted_values = {p["year"]: p for p in predictions}
    

#     print (predicted_values)
#     print(quality)

#     return {
#         "predicted_values": predicted_values,
#         "model_quality": quality
#     }

import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_squared_error
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping

def run_forecast(graph_data):
    target_name = graph_data.get("selectedTarget")
    factors = graph_data.get("factors")
    links = graph_data.get("links")

    if target_name not in factors:
        raise ValueError("Target factor not found in graph")

    # Step 1: Extract and clean target series
    target_series = factors[target_name]["data"]["time_series_data"]
    df = pd.DataFrame(target_series)
    df = df[df["year"] <= 2035]
    df["y"] = df["value"]

    # Step 2: Normalize
    scaler = MinMaxScaler()
    df["normalized"] = scaler.fit_transform(df[["y"]])

    # Step 3: Create lag features
    window_size = 5
    for lag in range(1, window_size + 1):
        df[f"lag_{lag}"] = df["normalized"].shift(lag)

    df.dropna(inplace=True)

    # Step 4: Split
    train_df = df[df["year"] <= 2017]
    test_df = df[(df["year"] > 2017) & (df["year"] <= 2024)]
    future_years = list(range(2025, 2036))

    X_train = train_df[[f"lag_{i}" for i in range(1, 6)]].values.reshape(-1, window_size, 1)
    y_train = train_df["normalized"].values

    X_test = test_df[[f"lag_{i}" for i in range(1, 6)]].values.reshape(-1, window_size, 1)
    y_test = test_df["normalized"].values

    # Step 5: LSTM model
    model = Sequential([
        LSTM(32, input_shape=(window_size, 1)),
        Dense(1)
    ])
    model.compile(optimizer=Adam(learning_rate=0.01), loss="mse")
    model.fit(X_train, y_train, epochs=100, verbose=0, callbacks=[
        EarlyStopping(monitor="loss", patience=10, restore_best_weights=True)
    ])

    # Step 6: Evaluate on test set
    y_pred_test = model.predict(X_test).flatten()
    mse = mean_squared_error(y_test, y_pred_test)
    quality = max(0, 100 * (1 - mse))  # Better bounded quality score

    # Step 7: Predict future years
    predictions = []
    last_known = df.iloc[-5:]["normalized"].tolist()

    for year in future_years:
        input_seq = np.array(last_known[-5:]).reshape(1, 5, 1)
        pred = model.predict(input_seq)[0][0]
        predictions.append({
            "year": year,
            "value": float(scaler.inverse_transform([[pred]])[0][0]),
            "normalized_value": float(pred)
        })
        last_known.append(pred)

    predicted_values = {p["year"]: p for p in predictions}

    return {
        "predicted_values": predicted_values,
        "model_quality": round(quality, 2)
    }
