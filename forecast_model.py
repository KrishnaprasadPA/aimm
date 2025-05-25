import os
import random
import numpy as np
import pandas as pd
import tensorflow as tf
from sklearn.metrics import r2_score
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Input
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping
from tensorflow.keras.initializers import GlorotUniform

# Enforce deterministic operations
os.environ["PYTHONHASHSEED"] = "42"
os.environ["TF_DETERMINISTIC_OPS"] = "1"
random.seed(42)
np.random.seed(42)
tf.random.set_seed(42)
tf.config.threading.set_intra_op_parallelism_threads(1)
tf.config.threading.set_inter_op_parallelism_threads(1)
tf.config.experimental.enable_op_determinism()


def get_parents(child_name, links):
    return [
        link["startFactor"]
        for link in links
        if link["endFactor"] == child_name and link["startFactor"] != child_name
    ]


def run_forecast(graph_data):
    target_name = graph_data["selectedTarget"]
    factors = graph_data["factors"]
    links = graph_data["links"]

    if target_name not in factors:
        raise ValueError("Target factor not found")

    years = list(range(1994, 2036))
    lag = 5

    # Target factor
    target_df = pd.DataFrame(factors[target_name]["data"]["time_series_data"]).set_index("year").reindex(years)
    target_df["value"] = target_df["value"].ffill().bfill()
    target_df["normalized_value"] = target_df["normalized_value"].ffill().bfill()

    train_target_df = target_df.loc[1994:2024]
    target_mean = train_target_df["value"].mean()
    target_std = train_target_df["value"].std()
    y_series = train_target_df["normalized_value"].tolist()

    parents = get_parents(target_name, links)
    parent_dfs = {}
    for pname in parents:
        df = pd.DataFrame(factors[pname]["data"]["time_series_data"]).set_index("year").reindex(years)
        df["normalized_value"] = df["normalized_value"].ffill().bfill()
        parent_dfs[pname] = df

    # Create training data from 1998–2024
    X_train, y_train = [], []
    for i in range(lag, years.index(2025)):
        row = y_series[i - lag:i]
        for pname in parents:
            row.extend([parent_dfs[pname].loc[years[i - l], "normalized_value"] for l in range(1, lag + 1)])
        X_train.append(row)
        y_train.append(y_series[i])

    X_train = np.array(X_train).reshape(-1, len(X_train[0]), 1)
    y_train = np.array(y_train)

    # LSTM model
    model = Sequential([
        Input(shape=(X_train.shape[1], 1)),
        LSTM(32, kernel_initializer=GlorotUniform(seed=42)),
        Dense(1, kernel_initializer=GlorotUniform(seed=42))
    ])
    model.compile(optimizer=Adam(0.01), loss="mse")
    model.fit(X_train, y_train, epochs=100, verbose=0, shuffle=False, batch_size=32,
              callbacks=[EarlyStopping(monitor="loss", patience=10, restore_best_weights=True)])

    # Predict 1998–2035
    pred_series = y_series[:lag]
    predictions = []

    for i in range(lag, len(years)):
        row = pred_series[-lag:]
        for pname in parents:
            row.extend([parent_dfs[pname].loc[years[i - l], "normalized_value"] for l in range(1, lag + 1)])
        X_input = np.array(row).reshape(1, len(row), 1)
        pred_norm = float(model.predict(X_input, verbose=0)[0][0])
        pred_series.append(pred_norm)

        pred_val = target_mean + pred_norm * target_std
        predictions.append({
            "year": years[i],
            "value": round(pred_val, 2),
            "normalized_value": round(pred_norm, 4)
        })

    # Insert original values for 1994–1997
    for i in range(lag):
        predictions.insert(i, {
            "year": years[i],
            "value": round(float(target_df.iloc[i]["value"]), 2),
            "normalized_value": round(float(target_df.iloc[i]["normalized_value"]), 4)
        })

    # Evaluate model quality only on 2025–2035
    try:
        actual_future = target_df.loc[2025:2035]["normalized_value"].tolist()
        predicted_future = [p["normalized_value"] for p in predictions if 2025 <= p["year"] <= 2035]
        if len(actual_future) == len(predicted_future):
            model_quality = round(float(r2_score(actual_future, predicted_future)), 4)
        else:
            model_quality = 0.0
    except Exception as e:
        print("R2 evaluation failed:", e)
        model_quality = 0.0

    return {
        "predicted_values": predictions,
        "model_quality": model_quality
    }
