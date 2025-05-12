
# # # import numpy as np
# # # import pandas as pd
# # # from sklearn.linear_model import Ridge
# # # from sklearn.model_selection import cross_val_score
# # # from tensorflow.keras.models import Sequential
# # # from tensorflow.keras.layers import LSTM, Dense
# # # from tensorflow.keras.optimizers import Adam
# # # from tensorflow.keras.callbacks import EarlyStopping
# # # from tensorflow.keras import Input


# # # def get_parents(child_name, links):
# # #     return [link["startFactor"] for link in links if link["endFactor"] == child_name and link["startFactor"] != child_name]

# # # def compute_consistency_score(factors, links):
# # #     scores = []

# # #     for child in factors:
# # #         parent_names = get_parents(child, links)
# # #         if not parent_names:
# # #             continue

# # #         df = pd.DataFrame(factors[child]["data"]["time_series_data"])
# # #         df = df.sort_values("year")[["year", "normalized_value"]].rename(columns={"normalized_value": "target"})

# # #         print(f"\n🔍 Debugging: Child = {child} with parents = {parent_names}")

# # #         for pname in parent_names:
# # #             pdata = pd.DataFrame(factors[pname]["data"]["time_series_data"])
# # #             pdata = pdata.sort_values("year")[["year", "normalized_value"]].rename(columns={"normalized_value": f"{pname}_norm"})
# # #             df = df.merge(pdata, on="year", how="left")

# # #             for lag in range(1, 3):
# # #                 df[f"{pname}_lag_{lag}"] = df[f"{pname}_norm"].shift(lag)

# # #             # 🔍 Debug: Show a preview of alignment
# # #             print(f"\n📋 Alignment Preview for parent: {pname}")
# # #             print(df[["year", "target", f"{pname}_norm", f"{pname}_lag_1", f"{pname}_lag_2"]].head(8))

# # #             # 🔍 Optional: Plot target vs lag_1
# # #             try:
# # #                 plt.figure(figsize=(6, 3))
# # #                 plt.plot(df["year"], df["target"], label=f"{child} (target)")
# # #                 plt.plot(df["year"], df[f"{pname}_lag_1"], label=f"{pname} lag 1")
# # #                 plt.title(f"{child} vs {pname} lag 1")
# # #                 plt.legend()
# # #                 plt.tight_layout()
# # #                 plt.show()
# # #             except Exception as e:
# # #                 print(f"❌ Plotting error: {e}")

# # #         df.dropna(inplace=True)
# # #         if df.shape[0] < 5:
# # #             print(f"⚠️ Skipping {child}: Not enough aligned data after lagging.")
# # #             continue

# # #         X = df[[col for col in df.columns if "lag" in col]]
# # #         y = df["target"]

# # #         print(f"\n📊 {child}: Using {df.shape[0]} samples with {X.shape[1]} features")

# # #         # 🔍 Check feature matrix
# # #         print("🧪 Sample features:")
# # #         print(X.head(5))

# # #         try:
# # #             model = Ridge()
# # #             r2 = cross_val_score(model, X, y, cv=5, scoring="r2").mean()
# # #             scores.append(r2)
# # #             print(f"✅ Combined R² for {child} by {parent_names}: {r2:.4f} (rows: {df.shape[0]})")
# # #         except Exception as e:
# # #             print(f"❌ Error scoring {child}: {e}")
# # #             continue

# # #     combined = np.mean(scores)
# # #     return round(float(combined), 2) if scores else 0.0



# # # def run_forecast(graph_data):
# # #     target_name = graph_data["selectedTarget"]
# # #     factors = graph_data["factors"]
# # #     links = graph_data["links"]

# # #     if target_name not in factors:
# # #         raise ValueError("Target factor not found in graph")

# # #     parents = get_parents(target_name, links)
# # #     years = list(range(1993, 2036))

# # #     # Prepare parent factor data
# # #     factor_dfs = {}
# # #     for fname in parents:
# # #         fdf = pd.DataFrame(factors[fname]["data"]["time_series_data"])[["year", "normalized_value"]]
# # #         fdf = fdf.set_index("year").reindex(years).fillna(method="ffill").fillna(method="bfill")
# # #         factor_dfs[fname] = fdf

# # #     # Prepare target data (use pre-standardized values)
# # #     target_df = pd.DataFrame(factors[target_name]["data"]["time_series_data"])
# # #     full_df = target_df.set_index("year").reindex(years)
# # #     full_df["normalized"] = full_df["normalized_value"].fillna(method="ffill").fillna(method="bfill")
# # #     full_df["value"] = full_df["value"].fillna(method="ffill").fillna(method="bfill")
# # #     target_norm_series = full_df["normalized"].tolist()

# # #     # Build training data using rolling window
# # #     lag_window = 5
# # #     rows = []
# # #     for i in range(lag_window, years.index(2025)):  # Use data up to 2024
# # #         input_row = target_norm_series[i - lag_window:i]

# # #         for fname in parents:
# # #             input_row.extend([factor_dfs[fname].iloc[i - l]["normalized_value"] for l in range(1, 6)])

# # #         rows.append((input_row, target_norm_series[i]))

# # #     X_train = np.array([r[0] for r in rows]).reshape(-1, len(rows[0][0]), 1)
# # #     y_train = np.array([r[1] for r in rows])

# # #     # Train LSTM model
# # #     model = Sequential([
# # #         Input(shape=(X_train.shape[1], 1)),
# # #         LSTM(32),
# # #         Dense(1)
# # #     ])
# # #     model.compile(optimizer=Adam(learning_rate=0.01), loss="mse")
# # #     model.fit(X_train, y_train, epochs=100, verbose=0, callbacks=[
# # #         EarlyStopping(monitor="loss", patience=10, restore_best_weights=True)
# # #     ])

# # #     # Predict recursively from 1998 to 2035
# # #     predicted = []
# # #     past_target = target_norm_series[:5]  # 1993–1997

# # #     for i, year in enumerate(years[5:], start=5):
# # #         input_row = past_target[-5:]

# # #         for fname in parents:
# # #             input_row.extend([factor_dfs[fname].iloc[i - l]["normalized_value"] for l in range(1, 6)])

# # #         X_input = np.array(input_row).reshape(1, len(input_row), 1)
# # #         pred_norm = model.predict(X_input, verbose=0)[0][0]
# # #         past_target.append(pred_norm)

# # #         # No inverse transform, just estimate value using historical mean/std
# # #         pred_val = full_df["value"].mean() + pred_norm * full_df["value"].std()

# # #         predicted.append({
# # #             "year": year,
# # #             "value": round(float(pred_val), 2),
# # #             "normalized_value": round(float(pred_norm), 4)
# # #         })

# # #     # Add initial real values (1993–1997)
# # #     for i in range(5):
# # #         y = years[i]
# # #         predicted.insert(i, {
# # #             "year": y,
# # #             "value": round(float(full_df.iloc[i]["value"]), 2),
# # #             "normalized_value": round(float(target_norm_series[i]), 4)
# # #         })

# # #     consistency_score = compute_consistency_score(factors, links)

# # #     return {
# # #         "predicted_values": predicted,
# # #         "model_quality": consistency_score
# # #     }

# # import numpy as np
# # import pandas as pd
# # from sklearn.metrics import r2_score, mean_squared_error
# # from tensorflow.keras.models import Sequential
# # from tensorflow.keras.layers import LSTM, Dense
# # from tensorflow.keras.optimizers import Adam
# # from tensorflow.keras.callbacks import EarlyStopping
# # from tensorflow.keras import Input

# # def get_parents(child_name, links):
# #     return [link["startFactor"] for link in links if link["endFactor"] == child_name and link["startFactor"] != child_name]

# # def run_forecast(graph_data):
# #     target_name = graph_data["selectedTarget"]
# #     factors = graph_data["factors"]
# #     links = graph_data["links"]

# #     if target_name not in factors:
# #         raise ValueError("Target factor not found in graph")

# #     parents = get_parents(target_name, links)
# #     years = list(range(1993, 2036))

# #     # Prepare parent factor data
# #     factor_dfs = {}
# #     for fname in parents:
# #         fdf = pd.DataFrame(factors[fname]["data"]["time_series_data"])[["year", "normalized_value"]]
# #         fdf = fdf.set_index("year").reindex(years).fillna(method="ffill").fillna(method="bfill")
# #         factor_dfs[fname] = fdf

# #     # Prepare target data
# #     target_df = pd.DataFrame(factors[target_name]["data"]["time_series_data"])
# #     full_df = target_df.set_index("year").reindex(years)
# #     full_df["normalized"] = full_df["normalized_value"].fillna(method="ffill").fillna(method="bfill")
# #     full_df["value"] = full_df["value"].fillna(method="ffill").fillna(method="bfill")
# #     target_norm_series = full_df["normalized"].tolist()

# #     # Build training data using 5-year lag for both target and parents
# #     lag_window = 5
# #     rows = []
# #     for i in range(lag_window, years.index(2025)):
# #         input_row = target_norm_series[i - lag_window:i]
# #         for fname in parents:
# #             input_row.extend([factor_dfs[fname].iloc[i - l]["normalized_value"] for l in range(1, 6)])
# #         rows.append((input_row, target_norm_series[i]))

# #     X_train = np.array([r[0] for r in rows]).reshape(-1, len(rows[0][0]), 1)
# #     y_train = np.array([r[1] for r in rows])

# #     # Train LSTM
# #     model = Sequential([
# #         Input(shape=(X_train.shape[1], 1)),
# #         LSTM(32),
# #         Dense(1)
# #     ])
# #     model.compile(optimizer=Adam(learning_rate=0.01), loss="mse")
# #     model.fit(X_train, y_train, epochs=100, verbose=0,
# #               callbacks=[EarlyStopping(monitor="loss", patience=10, restore_best_weights=True)])

# #     # Recursive prediction from 1998 to 2035
# #     predicted = []
# #     past_target = target_norm_series[:5]

# #     for i, year in enumerate(years[5:], start=5):
# #         input_row = past_target[-5:]
# #         for fname in parents:
# #             input_row.extend([factor_dfs[fname].iloc[i - l]["normalized_value"] for l in range(1, 6)])
# #         X_input = np.array(input_row).reshape(1, len(input_row), 1)
# #         pred_norm = model.predict(X_input, verbose=0)[0][0]
# #         past_target.append(pred_norm)

# #         pred_val = full_df["value"].mean() + pred_norm * full_df["value"].std()

# #         predicted.append({
# #             "year": year,
# #             "value": round(float(pred_val), 2),
# #             "normalized_value": round(float(pred_norm), 4)
# #         })

# #     # Insert real values from 1993–1997
# #     for i in range(5):
# #         y = years[i]
# #         predicted.insert(i, {
# #             "year": y,
# #             "value": round(float(full_df.iloc[i]["value"]), 2),
# #             "normalized_value": round(float(target_norm_series[i]), 4)
# #         })

# #     # ✅ Evaluation using real ground truth
# #     eval_years = list(range(1998, 2025))
# #     true_norm = [full_df.loc[y, "normalized"] for y in eval_years]
# #     pred_norm = [p["normalized_value"] for p in predicted if p["year"] in eval_years]

# #     r2 = r2_score(true_norm, pred_norm)
# #     mse = mean_squared_error(true_norm, pred_norm)

# #     return {
# #         "predicted_values": predicted,
# #         "model_quality": round(r2, 3),
# #         "mse": round(mse, 4)
# #     }

# from sklearn.metrics import r2_score, mean_squared_error
# import numpy as np
# import pandas as pd
# from tensorflow.keras.models import Sequential
# from tensorflow.keras.layers import LSTM, Dense
# from tensorflow.keras.optimizers import Adam
# from tensorflow.keras.callbacks import EarlyStopping
# from tensorflow.keras import Input

# def get_parents(child_name, links):
#     return [link["startFactor"] for link in links if link["endFactor"] == child_name and link["startFactor"] != child_name]

# def run_forecast(graph_data):
#     target_name = graph_data["selectedTarget"]
#     factors = graph_data["factors"]
#     links = graph_data["links"]

#     if target_name not in factors:
#         raise ValueError("Target factor not found in graph")

#     parents = get_parents(target_name, links)
#     years = list(range(1993, 2036))

#     # Prepare parent factor data
#     factor_dfs = {}
#     for fname in parents:
#         fdf = pd.DataFrame(factors[fname]["data"]["time_series_data"])[["year", "normalized_value"]]
#         fdf = fdf.set_index("year").reindex(years).fillna(method="ffill").fillna(method="bfill")
#         factor_dfs[fname] = fdf

#     # Prepare target data
#     target_df = pd.DataFrame(factors[target_name]["data"]["time_series_data"])
#     full_df = target_df.set_index("year").reindex(years)
#     full_df["normalized"] = full_df["normalized_value"].fillna(method="ffill").fillna(method="bfill")
#     full_df["value"] = full_df["value"].fillna(method="ffill").fillna(method="bfill")
#     target_norm_series = full_df["normalized"].tolist()

#     # Build training data using rolling window
#     lag_window = 5
#     train_until = years.index(2025)  # train only on data up to 2017
#     rows = []
#     for i in range(lag_window, train_until):
#         input_row = target_norm_series[i - lag_window:i]
#         for fname in parents:
#             input_row.extend([factor_dfs[fname].iloc[i - l]["normalized_value"] for l in range(1, 6)])
#         rows.append((input_row, target_norm_series[i]))

#     X_train = np.array([r[0] for r in rows]).reshape(-1, len(rows[0][0]), 1)
#     y_train = np.array([r[1] for r in rows])

#     # Train LSTM model
#     model = Sequential([
#         Input(shape=(X_train.shape[1], 1)),
#         LSTM(32),
#         Dense(1)
#     ])
#     model.compile(optimizer=Adam(learning_rate=0.01), loss="mse")
#     model.fit(X_train, y_train, epochs=100, verbose=0,
#               callbacks=[EarlyStopping(monitor="loss", patience=10, restore_best_weights=True)])

#     # Predict recursively from 1998–2035
#     predicted = []
#     past_target = target_norm_series[:5]

#     for i, year in enumerate(years[5:], start=5):
#         input_row = past_target[-5:]
#         for fname in parents:
#             input_row.extend([factor_dfs[fname].iloc[i - l]["normalized_value"] for l in range(1, 6)])

#         X_input = np.array(input_row).reshape(1, len(input_row), 1)
#         pred_norm = model.predict(X_input, verbose=0)[0][0]
#         past_target.append(pred_norm)

#         pred_val = full_df["value"].mean() + pred_norm * full_df["value"].std()

#         predicted.append({
#             "year": year,
#             "value": round(float(pred_val), 2),
#             "normalized_value": round(float(pred_norm), 4)
#         })

#     # Add actual data for 1993–1997
#     for i in range(5):
#         predicted.insert(i, {
#             "year": years[i],
#             "value": round(float(full_df.iloc[i]["value"]), 2),
#             "normalized_value": round(float(target_norm_series[i]), 4)
#         })

#     # 🎯 Evaluate on test range: 2018–2024
#     eval_years = list(range(2025, 2036))
#     true_norm = [full_df.loc[y, "normalized"] for y in eval_years]
#     pred_norm = [p["normalized_value"] for p in predicted if p["year"] in eval_years]

#     r2 = r2_score(true_norm, pred_norm)
#     mse = mean_squared_error(true_norm, pred_norm)

#     return {
#         "predicted_values": predicted,
#         "model_quality": round(r2, 3),
#         "mse": round(mse, 4)
#     }

# def run_forecast(graph_data):
#     import numpy as np
#     import pandas as pd
#     from sklearn.metrics import r2_score
#     from tensorflow.keras.models import Sequential
#     from tensorflow.keras.layers import LSTM, Dense
#     from tensorflow.keras.optimizers import Adam
#     from tensorflow.keras.callbacks import EarlyStopping
#     from tensorflow.keras import Input

#     target_name = graph_data["selectedTarget"]
#     factors = graph_data["factors"]
#     links = graph_data["links"]

#     def get_parents(child, links):
#         return [l["startFactor"] for l in links if l["endFactor"] == child and l["startFactor"] != child]

#     years = list(range(1993, 2036))
#     lag = 5
#     parents = get_parents(target_name, links)

#     # Prepare parent data
#     parent_dfs = {}
#     for p in parents:
#         s = pd.DataFrame(factors[p]["data"]["time_series_data"])[["year", "normalized_value"]]
#         s = s.set_index("year").reindex(years).interpolate(method="linear").fillna(method="bfill")
#         parent_dfs[p] = s

#     # Prepare target data
#     target_df = pd.DataFrame(factors[target_name]["data"]["time_series_data"])[["year", "value", "normalized_value"]]
#     target_df = target_df.set_index("year").reindex(years).interpolate(method="linear").fillna(method="bfill")
#     y_series = target_df["normalized_value"].tolist()

#     # Training on 1998–2024 (5 years lag)
#     X_train, y_train = [], []
#     for i in range(lag, years.index(2025)):
#         row = y_series[i - lag:i]  # past 5 target
#         for p in parents:
#             row += [parent_dfs[p].iloc[i - l]["normalized_value"] for l in range(1, lag + 1)]
#         X_train.append(row)
#         y_train.append(y_series[i])

#     X_train = np.array(X_train).reshape(-1, len(X_train[0]), 1)
#     y_train = np.array(y_train)

#     model = Sequential([
#         Input(shape=(X_train.shape[1], 1)),
#         LSTM(32),
#         Dense(1)
#     ])
#     model.compile(optimizer=Adam(0.01), loss="mse")
#     model.fit(X_train, y_train, epochs=100, verbose=0, callbacks=[
#         EarlyStopping(monitor="loss", patience=10, restore_best_weights=True)

#     ])

#     # Predict from 1998–2035 recursively using real parent values and predicted target values
#     pred_series = y_series[:lag]  # seed
#     predictions = []
#     for i in range(lag, len(years)):
#         row = pred_series[-lag:]
#         for p in parents:
#             row += [parent_dfs[p].iloc[i - l]["normalized_value"] for l in range(1, lag + 1)]
#         x_input = np.array(row).reshape(1, len(row), 1)
#         pred = model.predict(x_input, verbose=0)[0][0]
#         pred_series.append(pred)
#         pred_val = target_df["value"].mean() + pred * target_df["value"].std()
#         predictions.append({
#             "year": years[i],
#             "value": float(round(pred_val, 2)),
#             "normalized_value": float(round(pred, 4))
#         })

#     # Insert initial real values for 1993–1997
#     for i in range(0, lag):
#         predictions.insert(i, {
#             "year": years[i],
#             "value": float(round(float(target_df.iloc[i]["value"]), 2)),
#             "normalized_value": float(round(float(y_series[i]), 4))
#         })

#     # Add R² evaluation on 2025–2035 only
#     y_true_future = y_series[years.index(2025):]
#     y_pred_future = [p["normalized_value"] for p in predictions[years.index(2025):]]

#     if len(y_true_future) == len(y_pred_future) and len(y_true_future) >= 2:
#         quality = round(float(r2_score(y_true_future, y_pred_future)), 4)
#     else:
#         quality = 0.0

#     # Compute model quality from all child nodes (not just target)
#     def get_children(factors, links):
#         children = set()
#         for l in links:
#             if l["startFactor"] != l["endFactor"]:
#                 children.add(l["endFactor"])
#         return list(children)

#     all_r2s = []
#     for child in get_children(factors, links):
#         parent_list = get_parents(child, links)
#         if not parent_list:
#             continue
#         df = pd.DataFrame(factors[child]["data"]["time_series_data"])
#         df = df[["year", "normalized_value"]].rename(columns={"normalized_value": "target"}).copy()
#         for p in parent_list:
#             pdata = pd.DataFrame(factors[p]["data"]["time_series_data"])
#             pdata = pdata[["year", "normalized_value"]].rename(columns={"normalized_value": f"{p}_norm"})
#             df = df.merge(pdata, on="year", how="left")
#             for lag_n in range(1, 3):
#                 df[f"{p}_lag_{lag_n}"] = df[f"{p}_norm"].shift(lag_n)
#         df.dropna(inplace=True)
#         if len(df) < 10:
#             continue
#         X = df[[col for col in df.columns if "lag" in col]]
#         y = df["target"]
#         try:
#             model_simple = Ridge()
#             r2 = cross_val_score(model_simple, X, y, cv=5, scoring="r2").mean()
#             all_r2s.append(r2)
#         except:
#             continue

#     avg_quality = round(float(np.mean(all_r2s)), 4) if all_r2s else quality

#     return {
#         "predicted_values": predictions,
#         "model_quality": avg_quality
#     }

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

    years = list(range(1993, 2036))
    lag = 5

    # Target factor
    target_df = pd.DataFrame(factors[target_name]["data"]["time_series_data"]).set_index("year").reindex(years)
    target_df["value"] = target_df["value"].ffill().bfill()
    target_df["normalized_value"] = target_df["normalized_value"].ffill().bfill()

    train_target_df = target_df.loc[1993:2024]
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

    # Insert original values for 1993–1997
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
