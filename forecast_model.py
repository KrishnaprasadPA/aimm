# # # forecast_model.py
# # import numpy as np
# # import pandas as pd
# # from sklearn.linear_model import LinearRegression

# # def run_forecast(graph_data):
# #     print(graph_data)
# #     target_name = graph_data.get("selectedTarget")
# #     factors = graph_data.get("factors")
# #     links = graph_data.get("links")

# #     if target_name not in factors:
# #         raise ValueError("Target factor not found in graph")

# #     # Extract target series
# #     target_series = factors[target_name]["data"]["time_series_data"]
# #     df = pd.DataFrame(target_series)
# #     df = df[df["year"] <= 2035]

# #     # Feature construction using 5-year lag
# #     df["y"] = df["value"]
# #     for lag in range(1, 6):
# #         df[f"lag_{lag}"] = df["y"].shift(lag)

# #     df.dropna(inplace=True)
# #     train_df = df[df["year"] <= 2017]
# #     test_df = df[(df["year"] > 2017) & (df["year"] <= 2024)]
# #     future_df = pd.DataFrame({"year": list(range(2025, 2036))})

# #     # Train
# #     model = LinearRegression()
# #     X_train = train_df[[f"lag_{i}" for i in range(1, 6)]]
# #     y_train = train_df["y"]
# #     model.fit(X_train, y_train)

# #     # Test accuracy (quality)
# #     X_test = test_df[[f"lag_{i}" for i in range(1, 6)]]
# #     y_test = test_df["y"]
# #     y_pred_test = model.predict(X_test)
# #     mse = np.mean((y_test - y_pred_test) ** 2)
# #     quality = max(0, 100 - mse)

# #     # Predict future
# #     # predictions = []
# #     # last_known = df.iloc[-5:]["y"].tolist()
# #     # for year in range(2025, 2036):
# #     #     X_input = np.array(last_known[-5:]).reshape(1, -1)
# #     #     y_pred = model.predict(X_input)[0]
# #     #     predictions.append({"year": year, "value": y_pred, "normalized_value": y_pred})  # Normalize if needed
# #     #     last_known.append(y_pred)

# #     # 1. Predict future values and collect raw outputs
# #     raw_preds = []
# #     last_known = df.iloc[-5:]["y"].tolist()

# #     for year in range(2025, 2036):
# #         X_input = np.array(last_known[-5:]).reshape(1, -1)
# #         y_pred = model.predict(X_input)[0]
# #         raw_preds.append((year, y_pred))
# #         last_known.append(y_pred)

# #     # 2. Extract only predicted values
# #     pred_values = np.array([val for (_, val) in raw_preds])

# #     # 3. Normalize predicted values to [0, 1]
# #     min_val = np.min(pred_values)
# #     max_val = np.max(pred_values)
# #     normalized = (pred_values) / (max_val+ 1e-8)

# #     # 4. Combine into predictions list
# #     predictions = []
# #     for (year, raw_val), norm_val in zip(raw_preds, normalized):
# #         predictions.append({
# #             "year": year,
# #             "value": round(raw_val, 2),
# #             "normalized_value": round(norm_val, 4)
# #         })


# #     predicted_values = {p["year"]: p for p in predictions}
    

# #     print (predicted_values)
# #     print(quality)

# #     return {
# #         "predicted_values": predicted_values,
# #         "model_quality": quality
# #     }

# import numpy as np
# import pandas as pd
# from sklearn.preprocessing import MinMaxScaler
# from sklearn.metrics import mean_squared_error
# from tensorflow.keras.models import Sequential
# from tensorflow.keras.layers import LSTM, Dense
# from tensorflow.keras.optimizers import Adam
# from tensorflow.keras.callbacks import EarlyStopping

# def run_forecast(graph_data):
#     target_name = graph_data.get("selectedTarget")
#     factors = graph_data.get("factors")
#     links = graph_data.get("links")

#     if target_name not in factors:
#         raise ValueError("Target factor not found in graph")

#     # Step 1: Extract and clean target series
#     target_series = factors[target_name]["data"]["time_series_data"]
#     df = pd.DataFrame(target_series)
#     df = df[df["year"] <= 2035]
#     df["y"] = df["value"]

#     # Step 2: Normalize
#     scaler = MinMaxScaler()
#     df["normalized"] = scaler.fit_transform(df[["y"]])

#     # Step 3: Create lag features
#     window_size = 5
#     for lag in range(1, window_size + 1):
#         df[f"lag_{lag}"] = df["normalized"].shift(lag)

#     df.dropna(inplace=True)

#     # Step 4: Split
#     train_df = df[df["year"] <= 2017]
#     test_df = df[(df["year"] > 2017) & (df["year"] <= 2024)]
#     future_years = list(range(2025, 2036))

#     X_train = train_df[[f"lag_{i}" for i in range(1, 6)]].values.reshape(-1, window_size, 1)
#     y_train = train_df["normalized"].values

#     X_test = test_df[[f"lag_{i}" for i in range(1, 6)]].values.reshape(-1, window_size, 1)
#     y_test = test_df["normalized"].values

#     # Step 5: LSTM model
#     model = Sequential([
#         LSTM(32, input_shape=(window_size, 1)),
#         Dense(1)
#     ])
#     model.compile(optimizer=Adam(learning_rate=0.01), loss="mse")
#     model.fit(X_train, y_train, epochs=100, verbose=0, callbacks=[
#         EarlyStopping(monitor="loss", patience=10, restore_best_weights=True)
#     ])

#     # Step 6: Evaluate on test set
#     y_pred_test = model.predict(X_test).flatten()
#     mse = mean_squared_error(y_test, y_pred_test)
#     quality = max(0, 100 * (1 - mse))  # Better bounded quality score

#     # Step 7: Predict future years
#     predictions = []
#     last_known = df.iloc[-5:]["normalized"].tolist()

#     for year in future_years:
#         input_seq = np.array(last_known[-5:]).reshape(1, 5, 1)
#         pred = model.predict(input_seq)[0][0]
#         predictions.append({
#             "year": year,
#             "value": float(scaler.inverse_transform([[pred]])[0][0]),
#             "normalized_value": float(pred)
#         })
#         last_known.append(pred)

#     predicted_values = {p["year"]: p for p in predictions}

#     return {
#         "predicted_values": predicted_values,
#         "model_quality": round(quality, 2)
#     }

import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_squared_error
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping
from tensorflow.keras import Input

def get_connected_factors(target, links):
    adjacency = {}
    for link in links:
        src = link["startFactor"]
        dst = link["endFactor"]
        adjacency.setdefault(src, []).append(dst)
        adjacency.setdefault(dst, []).append(src)  # treat as undirected for reachability

    visited = set()
    queue = [target]

    while queue:
        node = queue.pop(0)
        if node not in visited:
            visited.add(node)
            queue.extend(adjacency.get(node, []))

    return visited

def run_forecast(graph_data):
    target_name = graph_data.get("selectedTarget")
    factors = graph_data.get("factors")
    links = graph_data.get("links")

    if target_name not in factors:
        raise ValueError("Target factor not found in graph")

    # Step 1: Get all connected factors
    connected_factors = get_connected_factors(target_name, links)
    connected_factors.discard(target_name)

    # Step 2: Extract target series
    target_series = factors[target_name]["data"]["time_series_data"]
    df = pd.DataFrame(target_series)
    df = df[df["year"] <= 2035]
    df["y"] = df["value"]

    # Step 3: Normalize target and create lag features
    scaler = MinMaxScaler()
    df["normalized"] = scaler.fit_transform(df[["y"]])
    for lag in range(1, 6):
        df[f"lag_{lag}"] = df["normalized"].shift(lag)

    # Step 4: Merge connected factors and create lag features
    for fname in connected_factors:
        series = pd.DataFrame(factors[fname]["data"]["time_series_data"])
        series = series[["year", "value"]].rename(columns={"value": f"{fname}_val"})
        norm_col = f"{fname}_norm"
        series[norm_col] = MinMaxScaler().fit_transform(series[[f"{fname}_val"]])
        df = df.merge(series[["year", norm_col]], on="year", how="left")
        for lag in range(1, 6):
            df[f"{fname}_lag_{lag}"] = df[norm_col].shift(lag)

    df.dropna(inplace=True)

    # Step 5: Split
    train_df = df[df["year"] <= 2017]
    test_df = df[(df["year"] > 2017) & (df["year"] <= 2024)]
    future_years = list(range(2025, 2036))

    input_cols = [f"lag_{i}" for i in range(1, 6)]
    for fname in connected_factors:
        input_cols.extend([f"{fname}_lag_{i}" for i in range(1, 6)])

    X_train = train_df[input_cols].values.reshape(-1, len(input_cols), 1)
    y_train = train_df["normalized"].values
    X_test = test_df[input_cols].values.reshape(-1, len(input_cols), 1)
    y_test = test_df["normalized"].values

    # Step 6: Train LSTM
    model = Sequential([
        Input(shape=(len(input_cols), 1)),
        LSTM(32),
        Dense(1)
    ])
    model.compile(optimizer=Adam(learning_rate=0.01), loss="mse")
    model.fit(X_train, y_train, epochs=100, verbose=0, callbacks=[
        EarlyStopping(monitor="loss", patience=10, restore_best_weights=True)
    ])

    # Step 7: Evaluate
    y_pred_test = model.predict(X_test).flatten()
    mse = mean_squared_error(y_test, y_pred_test)
    quality = max(0, 100 * (1 - mse))

    # Step 8: Predict future values
    predictions = []
    X_last = df.iloc[-1:][input_cols].values.reshape(1, len(input_cols), 1)

    for year in future_years:
        pred = model.predict(X_last)[0][0]
        value = float(scaler.inverse_transform([[pred]])[0][0])
        predictions.append({
            "year": year,
            "value": round(value, 2),
            "normalized_value": round(float(pred), 4)
        })

        # Roll window: drop 1 and append pred
        last_input = X_last.flatten().tolist()[5:] + [pred]
        if len(last_input) < len(input_cols):
            last_input += [0] * (len(input_cols) - len(last_input))

        X_last = np.array(last_input).reshape(1, len(input_cols), 1)

    predicted_values = {p["year"]: p for p in predictions}
    print ("quality is: ", quality)

    return {
        "predicted_values": predicted_values,
        "model_quality": round(quality, 2)
    }
