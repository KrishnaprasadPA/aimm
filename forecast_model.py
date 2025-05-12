
import numpy as np
import pandas as pd
from sklearn.linear_model import Ridge
from sklearn.model_selection import cross_val_score
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping
from tensorflow.keras import Input


def get_parents(child_name, links):
    return [link["startFactor"] for link in links if link["endFactor"] == child_name and link["startFactor"] != child_name]

# def compute_consistency_score(factors, links):
#     scores = []

#     for child in factors:
#         parent_names = get_parents(child, links)
#         if not parent_names:
#             continue

#         df = pd.DataFrame(factors[child]["data"]["time_series_data"])
#         df = df.sort_values("year")[["year", "normalized_value"]].rename(columns={"normalized_value": "target"})

#         for pname in parent_names:
#             pdata = pd.DataFrame(factors[pname]["data"]["time_series_data"])
#             pdata = pdata.sort_values("year")[["year", "normalized_value"]].rename(columns={"normalized_value": f"{pname}_norm"})
#             df = df.merge(pdata, on="year", how="left")

#             for lag in range(1, 6):
#                 df[f"{pname}_lag_{lag}"] = df[f"{pname}_norm"].shift(lag)

#         df.dropna(inplace=True)
#         if df.shape[0] < 3:
#             continue

#         X = df[[col for col in df.columns if "lag" in col]]
#         y = df["target"]

#         try:
#             model = Ridge()
#             r2 = cross_val_score(model, X, y, cv=3, scoring="r2").mean()
#             scores.append(r2)

#             print(f"✅ R² for {child} predicted by {parent_names}: {r2:.4f} (rows: {df.shape[0]})")

#         except Exception as e:
#             print(f"❌ Error scoring {child}: {e}")
#             continue

#     combined = np.mean(scores)
#     return round(float(combined), 2) if scores else 0.0
def compute_consistency_score(factors, links):
    scores = []

    for child in factors:
        parent_names = get_parents(child, links)
        if not parent_names:
            continue

        df = pd.DataFrame(factors[child]["data"]["time_series_data"])
        df = df.sort_values("year")[["year", "normalized_value"]].rename(columns={"normalized_value": "target"})

        print(f"\n🔍 Debugging: Child = {child} with parents = {parent_names}")

        for pname in parent_names:
            pdata = pd.DataFrame(factors[pname]["data"]["time_series_data"])
            pdata = pdata.sort_values("year")[["year", "normalized_value"]].rename(columns={"normalized_value": f"{pname}_norm"})
            df = df.merge(pdata, on="year", how="left")

            for lag in range(1, 3):
                df[f"{pname}_lag_{lag}"] = df[f"{pname}_norm"].shift(lag)

            # 🔍 Debug: Show a preview of alignment
            print(f"\n📋 Alignment Preview for parent: {pname}")
            print(df[["year", "target", f"{pname}_norm", f"{pname}_lag_1", f"{pname}_lag_2"]].head(8))

            # 🔍 Optional: Plot target vs lag_1
            try:
                plt.figure(figsize=(6, 3))
                plt.plot(df["year"], df["target"], label=f"{child} (target)")
                plt.plot(df["year"], df[f"{pname}_lag_1"], label=f"{pname} lag 1")
                plt.title(f"{child} vs {pname} lag 1")
                plt.legend()
                plt.tight_layout()
                plt.show()
            except Exception as e:
                print(f"❌ Plotting error: {e}")

        df.dropna(inplace=True)
        if df.shape[0] < 5:
            print(f"⚠️ Skipping {child}: Not enough aligned data after lagging.")
            continue

        X = df[[col for col in df.columns if "lag" in col]]
        y = df["target"]

        print(f"\n📊 {child}: Using {df.shape[0]} samples with {X.shape[1]} features")

        # 🔍 Check feature matrix
        print("🧪 Sample features:")
        print(X.head(5))

        try:
            model = Ridge()
            r2 = cross_val_score(model, X, y, cv=5, scoring="r2").mean()
            scores.append(r2)
            print(f"✅ Combined R² for {child} by {parent_names}: {r2:.4f} (rows: {df.shape[0]})")
        except Exception as e:
            print(f"❌ Error scoring {child}: {e}")
            continue

    combined = np.mean(scores)
    return round(float(combined), 2) if scores else 0.0



def run_forecast(graph_data):
    target_name = graph_data["selectedTarget"]
    factors = graph_data["factors"]
    links = graph_data["links"]

    if target_name not in factors:
        raise ValueError("Target factor not found in graph")

    parents = get_parents(target_name, links)
    years = list(range(1993, 2036))

    # Prepare parent factor data
    factor_dfs = {}
    for fname in parents:
        fdf = pd.DataFrame(factors[fname]["data"]["time_series_data"])[["year", "normalized_value"]]
        fdf = fdf.set_index("year").reindex(years).fillna(method="ffill").fillna(method="bfill")
        factor_dfs[fname] = fdf

    # Prepare target data (use pre-standardized values)
    target_df = pd.DataFrame(factors[target_name]["data"]["time_series_data"])
    full_df = target_df.set_index("year").reindex(years)
    full_df["normalized"] = full_df["normalized_value"].fillna(method="ffill").fillna(method="bfill")
    full_df["value"] = full_df["value"].fillna(method="ffill").fillna(method="bfill")
    target_norm_series = full_df["normalized"].tolist()

    # Build training data using rolling window
    lag_window = 5
    rows = []
    for i in range(lag_window, years.index(2025)):  # Use data up to 2024
        input_row = target_norm_series[i - lag_window:i]

        for fname in parents:
            input_row.extend([factor_dfs[fname].iloc[i - l]["normalized_value"] for l in range(1, 6)])

        rows.append((input_row, target_norm_series[i]))

    X_train = np.array([r[0] for r in rows]).reshape(-1, len(rows[0][0]), 1)
    y_train = np.array([r[1] for r in rows])

    # Train LSTM model
    model = Sequential([
        Input(shape=(X_train.shape[1], 1)),
        LSTM(32),
        Dense(1)
    ])
    model.compile(optimizer=Adam(learning_rate=0.01), loss="mse")
    model.fit(X_train, y_train, epochs=100, verbose=0, callbacks=[
        EarlyStopping(monitor="loss", patience=10, restore_best_weights=True)
    ])

    # Predict recursively from 1998 to 2035
    predicted = []
    past_target = target_norm_series[:5]  # 1993–1997

    for i, year in enumerate(years[5:], start=5):
        input_row = past_target[-5:]

        for fname in parents:
            input_row.extend([factor_dfs[fname].iloc[i - l]["normalized_value"] for l in range(1, 6)])

        X_input = np.array(input_row).reshape(1, len(input_row), 1)
        pred_norm = model.predict(X_input, verbose=0)[0][0]
        past_target.append(pred_norm)

        # No inverse transform, just estimate value using historical mean/std
        pred_val = full_df["value"].mean() + pred_norm * full_df["value"].std()

        predicted.append({
            "year": year,
            "value": round(float(pred_val), 2),
            "normalized_value": round(float(pred_norm), 4)
        })

    # Add initial real values (1993–1997)
    for i in range(5):
        y = years[i]
        predicted.insert(i, {
            "year": y,
            "value": round(float(full_df.iloc[i]["value"]), 2),
            "normalized_value": round(float(target_norm_series[i]), 4)
        })

    consistency_score = compute_consistency_score(factors, links)

    return {
        "predicted_values": predicted,
        "model_quality": consistency_score
    }
