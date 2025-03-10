# # # # import numpy as np
# # # # import pandas as pd
# # # # from econml.dml import LinearDML
# # # # from sklearn.ensemble import RandomForestRegressor
# # # # from sklearn.linear_model import Lasso
# # # # from sklearn.metrics import r2_score
# # # # import xgboost as xgb

# # # # def estimate_causal_effects_and_predict(graph_data):
# # # #     try:
# # # #         factors = graph_data.get("factors", {})
# # # #         links = graph_data.get("links", [])
# # # #         target_variable = graph_data.get("selectedTarget")

# # # #         if not factors or not links or not target_variable:
# # # #             raise ValueError("Graph data must contain 'factors', 'links', and 'selectedTarget'.")

# # # #         updated_links = []
# # # #         factor_effects = {}  # Store estimated + user-defined weights

# # # #         # **Step 1: Estimate Causal Weights Using EconML**
# # # #         for link in links:
# # # #             start_factor = link["startFactor"]
# # # #             end_factor = link["endFactor"]
# # # #             trainable = link.get("trainable", False)
# # # #             weight = link.get("weight", None)  # User-defined weight

# # # #             if start_factor not in factors or end_factor not in factors:
# # # #                 raise ValueError(f"Factors {start_factor} or {end_factor} not found.")

# # # #             start_series = factors[start_factor]["data"].get("time_series_data", [])
# # # #             end_series = factors[end_factor]["data"].get("time_series_data", [])

# # # #             if not start_series or not end_series:
# # # #                 raise ValueError(f"Missing time-series data for {start_factor} or {end_factor}.")

# # # #             T_data = np.array([entry["normalized_value"] for entry in start_series]).reshape(-1, 1)
# # # #             Y_data = np.array([entry["normalized_value"] for entry in end_series]).reshape(-1, 1)

# # # #             if trainable:
# # # #                 dml = LinearDML(
# # # #                     model_y=RandomForestRegressor(n_estimators=100),
# # # #                     model_t=Lasso(alpha=0.1),
# # # #                     random_state=42
# # # #                 )
# # # #                 dml.fit(Y_data, T_data, X=None)
# # # #                 causal_effect = float(np.mean(dml.effect(None)))  # Average causal effect
# # # #             else:
# # # #                 causal_effect = weight  # Use user-defined weight

# # # #             factor_effects[start_factor] = causal_effect
# # # #             updated_links.append({
# # # #                 "startFactor": start_factor,
# # # #                 "endFactor": end_factor,
# # # #                 "estimated_weight": causal_effect,
# # # #                 "trainable": trainable
# # # #             })

# # # #         # **Step 2: Normalize Trainable Weights**
# # # #         trainable_weights = [link["estimated_weight"] for link in updated_links if link["trainable"]]
# # # #         max_weight = max(abs(w) for w in trainable_weights) if trainable_weights else 1

# # # #         for link in updated_links:
# # # #             if link["trainable"]:
# # # #                 link["normalized_weight"] = link["estimated_weight"] / max_weight
# # # #             else:
# # # #                 link["normalized_weight"] = link["estimated_weight"]  # Keep user-defined weights unchanged

# # # #         # **Step 3: Compute Influence Scores for All Factors**
# # # #         influence_scores = {factor: 0 for factor in factors}

# # # #         for link in updated_links:
# # # #             influence_scores[link["endFactor"]] += abs(link["normalized_weight"])  # Accumulate influence

# # # #         # **Step 4: Prepare Data for Machine Learning**
# # # #         target_series = factors[target_variable]["data"].get("time_series_data", [])
# # # #         years = [entry["year"] for entry in target_series]
# # # #         actual_values = [entry["normalized_value"] for entry in target_series]

# # # #         feature_data = []
# # # #         for year in years:
# # # #             feature_row = {"Year": year}
# # # #             for factor, details in factors.items():
# # # #                 series = details["data"].get("time_series_data", [])
# # # #                 value = next((entry["normalized_value"] for entry in series if entry["year"] == year), 0)
# # # #                 feature_row[factor] = value * influence_scores[factor]  # Weighted factor contribution
# # # #             feature_data.append(feature_row)

# # # #         df = pd.DataFrame(feature_data)
# # # #         df.set_index("Year", inplace=True)
# # # #         df["Actual"] = actual_values

# # # #         # **Step 5: Train-Test Split**
# # # #         train_df = df[df.index <= 2014]  # Train on 1993–2014
# # # #         test_df = df[(df.index >= 2015) & (df.index <= 2024)]  # Test on 2015–2024

# # # #         X_train, y_train = train_df.drop(columns=["Actual"]).values, train_df["Actual"].values
# # # #         X_test, y_test = test_df.drop(columns=["Actual"]).values, test_df["Actual"].values

# # # #         # **Step 6: Train an ML Model (XGBoost)**
# # # #         model = xgb.XGBRegressor(objective="reg:squarederror", n_estimators=100)
# # # #         model.fit(X_train, y_train)

# # # #         # **Step 7: Evaluate Model Quality (R² Score)**
# # # #         y_pred = model.predict(X_test)
# # # #         r2 = r2_score(y_test, y_pred) if len(y_test) > 1 else None  # Evaluate quality
# # # #         print("r2 score is: ", r2)


# # # #         # **Step 8: Predict Future Values (2025–2035)**
# # # #         future_years = np.arange(2025, 2036)
# # # #         future_features = []

# # # #         for year in future_years:
# # # #             feature_row = {"Year": year}
# # # #             for factor in factors.keys():
# # # #                 past_series = factors[factor]["data"].get("time_series_data", [])
# # # #                 last_value = past_series[-1]["normalized_value"] if past_series else 0
# # # #                 feature_row[factor] = last_value * influence_scores[factor]
# # # #             future_features.append(feature_row)

# # # #         future_df = pd.DataFrame(future_features)
# # # #         future_df.set_index("Year", inplace=True)
# # # #         future_preds = model.predict(future_df.values)

# # # #         return {
# # # #             "updated_links": updated_links,
# # # #             # "model_quality": r2,  # R² score based on 2015–2024 test data
# # # #             # "predicted_target_values": future_preds.tolist()
# # # #         }

# # # #     except Exception as e:
# # # #         print(f"Error: {e}")
# # # #         return {
# # # #             "updated_links": [],
# # # #             "model_quality": None,
# # # #             "predicted_target_values": []
# # # #         }

# # # import numpy as np
# # # import pandas as pd
# # # from econml.dml import LinearDML, NonParamDML
# # # from sklearn.ensemble import RandomForestRegressor
# # # from sklearn.linear_model import Lasso
# # # from sklearn.metrics import r2_score
# # # import xgboost as xgb

# # # def estimate_causal_effects_and_predict(graph_data):
# # #     try:
# # #         factors = graph_data.get("factors", {})
# # #         links = graph_data.get("links", [])
# # #         target_variable = graph_data.get("selectedTarget")

# # #         if not factors or not links or not target_variable:
# # #             raise ValueError("Graph data must contain 'factors', 'links', and 'selectedTarget'.")

# # #         updated_links = []
# # #         factor_effects = {}  # Store estimated + user-defined weights

# # #         # **Step 1: Estimate Causal Weights Using EconML**
# # #         for link in links:
# # #             start_factor = link["startFactor"]
# # #             end_factor = link["endFactor"]
# # #             trainable = link.get("trainable", False)
# # #             weight = link.get("weight", None)  # User-defined weight

# # #             if start_factor not in factors or end_factor not in factors:
# # #                 raise ValueError(f"Factors {start_factor} or {end_factor} not found.")

# # #             start_series = factors[start_factor]["data"].get("time_series_data", [])
# # #             end_series = factors[end_factor]["data"].get("time_series_data", [])

# # #             if not start_series or not end_series:
# # #                 raise ValueError(f"Missing time-series data for {start_factor} or {end_factor}.")

# # #             T_data = np.array([entry["normalized_value"] for entry in start_series]).reshape(-1, 1)
# # #             Y_data = np.array([entry["normalized_value"] for entry in end_series]).reshape(-1, 1)

# # #             # if trainable:
# # #             #     dml = LinearDML(
# # #             #         model_y=RandomForestRegressor(n_estimators=100),
# # #             #         model_t=Lasso(alpha=0.1),
# # #             #         random_state=42
# # #             #     )
# # #             #     dml.fit(Y_data, T_data, X=None)
# # #             #     causal_effect = float(np.mean(dml.effect(None)))  # Average causal effect
# # #             # else:
# # #             #     causal_effect = weight  # Use user-defined weight
# # #             if trainable:
# # #                 # Use NonParamDML instead of LinearDML
# # #                 dml = NonParamDML(
# # #                     model_y=RandomForestRegressor(n_estimators=100),  # Model for outcome
# # #                     model_t=RandomForestRegressor(n_estimators=100),  # Model for treatment
# # #                     model_final=Lasso(alpha=0.1),  # Final model for treatment effect
# # #                     random_state=42
# # #                 )
# # #                 dml.fit(Y_data, T_data, X=None)  # Fit the model
# # #                 causal_effect = float(np.mean(dml.effect(None)))  # Average causal effect
# # #             else:
# # #                 causal_effect = weight

# # #             factor_effects[start_factor] = causal_effect
# # #             updated_links.append({
# # #                 "startFactor": start_factor,
# # #                 "endFactor": end_factor,
# # #                 "estimated_weight": causal_effect,
# # #                 "trainable": trainable
# # #             })

# # #         # **Step 2: Normalize Trainable Weights**
# # #         trainable_weights = [link["estimated_weight"] for link in updated_links if link["trainable"]]
# # #         max_weight = max(abs(w) for w in trainable_weights) if trainable_weights else 1

# # #         for link in updated_links:
# # #             if link["trainable"]:
# # #                 link["normalized_weight"] = link["estimated_weight"] / max_weight
# # #             else:
# # #                 link["normalized_weight"] = link["estimated_weight"]  # Keep user-defined weights unchanged

# # #         # **Step 3: Compute Influence Scores for All Factors**
# # #         influence_scores = {factor: 0 for factor in factors}

# # #         for link in updated_links:
# # #             influence_scores[link["endFactor"]] += abs(link["normalized_weight"])  # Accumulate influence

# # #         # **Step 4: Prepare Data for Machine Learning**
# # #         target_series = factors[target_variable]["data"].get("time_series_data", [])
# # #         years = [entry["year"] for entry in target_series]
# # #         actual_values = [entry["normalized_value"] for entry in target_series]

# # #         feature_data = []
# # #         for year in years:
# # #             feature_row = {"Year": year}
# # #             for factor, details in factors.items():
# # #                 series = details["data"].get("time_series_data", [])
# # #                 value = next((entry["normalized_value"] for entry in series if entry["year"] == year), 0)
# # #                 feature_row[factor] = value * influence_scores[factor]  # Weighted factor contribution
# # #             feature_data.append(feature_row)

# # #         df = pd.DataFrame(feature_data)
# # #         df.set_index("Year", inplace=True)
# # #         df["Actual"] = actual_values

# # #         # **Step 5: Train-Test Split**
# # #         train_df = df[df.index <= 2014]  # Train on 1993–2014
# # #         test_df = df[(df.index >= 2015) & (df.index <= 2024)]  # Test on 2015–2024

# # #         X_train, y_train = train_df.drop(columns=["Actual"]).values, train_df["Actual"].values
# # #         X_test, y_test = test_df.drop(columns=["Actual"]).values, test_df["Actual"].values

# # #         # **Step 6: Train an ML Model (XGBoost)**
# # #         model = xgb.XGBRegressor(objective="reg:squarederror", n_estimators=100)
# # #         model.fit(X_train, y_train)

# # #         # **Step 7: Evaluate Model Quality (R² Score)**
# # #         y_pred = model.predict(X_test)
# # #         r2 = r2_score(y_test, y_pred) if len(y_test) > 1 else None  # Evaluate quality
# # #         print("r2 score is: ", r2)

# # #         # **Step 8: Return Updated Links and Model Quality**
# # #         return {
# # #             "updated_links": updated_links,
# # #             "model_quality": r2
# # #         }

# # #     except Exception as e:
# # #         print(f"Error: {e}")
# # #         return {
# # #             "updated_links": [],
# # #             "model_quality": None
# # #         }

# # import numpy as np
# # import pandas as pd
# # from econml.dml import NonParamDML
# # from sklearn.ensemble import RandomForestRegressor
# # from sklearn.linear_model import Lasso
# # from sklearn.metrics import r2_score, mean_squared_error
# # import xgboost as xgb

# # def estimate_causal_effects_and_predict(graph_data):
# #     try:
# #         factors = graph_data.get("factors", {})
# #         links = graph_data.get("links", [])
# #         target_variable = graph_data.get("selectedTarget")

# #         if not factors or not links or not target_variable:
# #             raise ValueError("Graph data must contain 'factors', 'links', and 'selectedTarget'.")

# #         updated_links = []
# #         factor_effects = {}  # Store estimated + user-defined weights

# #         # **Step 1: Estimate Causal Weights Using NonParamDML**
# #         for link in links:
# #             start_factor = link["startFactor"]
# #             end_factor = link["endFactor"]
# #             trainable = link.get("trainable", False)
# #             weight = link.get("weight", None)  # User-defined weight

# #             if start_factor not in factors or end_factor not in factors:
# #                 raise ValueError(f"Factors {start_factor} or {end_factor} not found.")

# #             start_series = factors[start_factor]["data"].get("time_series_data", [])
# #             end_series = factors[end_factor]["data"].get("time_series_data", [])

# #             if not start_series or not end_series:
# #                 raise ValueError(f"Missing time-series data for {start_factor} or {end_factor}.")

# #             T_data = np.array([entry["normalized_value"] for entry in start_series]).reshape(-1, 1)
# #             Y_data = np.array([entry["normalized_value"] for entry in end_series]).reshape(-1, 1)

# #             if trainable:
# #                 # Use NonParamDML for non-linear causal effect estimation
# #                 dml = NonParamDML(
# #                     model_y=RandomForestRegressor(n_estimators=100, random_state=42),  # Model for outcome
# #                     model_t=RandomForestRegressor(n_estimators=100, random_state=42),  # Model for treatment
# #                     model_final=Lasso(alpha=0.1),  # Final model for treatment effect
# #                     random_state=42
# #                 )
# #                 # Use dummy covariates (all zeros) if no covariates are available
# #                 X_dummy = np.zeros((Y_data.shape[0], 1))  # Shape (n_samples, 1)
# #                 dml.fit(Y_data, T_data, X=X_dummy)  # Fit the model
# #                 causal_effect = float(np.mean(dml.const_marginal_effect(X=X_dummy)))  # Average causal effect
# #             else:
# #                 causal_effect = weight  # Use user-defined weight

# #             factor_effects[start_factor] = causal_effect
# #             updated_links.append({
# #                 "startFactor": start_factor,
# #                 "endFactor": end_factor,
# #                 "estimated_weight": causal_effect,
# #                 "trainable": trainable
# #             })

# #         # **Step 2: Normalize Trainable Weights**
# #         trainable_weights = [link["estimated_weight"] for link in updated_links if link["trainable"]]
# #         max_weight = max(abs(w) for w in trainable_weights) if trainable_weights else 1

# #         for link in updated_links:
# #             if link["trainable"]:
# #                 link["normalized_weight"] = link["estimated_weight"] / max_weight
# #             else:
# #                 link["normalized_weight"] = link["estimated_weight"]  # Keep user-defined weights unchanged

# #         # **Step 3: Compute Influence Scores for All Factors**
# #         influence_scores = {factor: 0 for factor in factors}

# #         for link in updated_links:
# #             influence_scores[link["endFactor"]] += abs(link["normalized_weight"])  # Accumulate influence

# #         # **Step 4: Prepare Data for Machine Learning**
# #         target_series = factors[target_variable]["data"].get("time_series_data", [])
# #         years = [entry["year"] for entry in target_series]
# #         actual_values = [entry["normalized_value"] for entry in target_series]

# #         feature_data = []
# #         for year in years:
# #             feature_row = {"Year": year}
# #             for factor, details in factors.items():
# #                 series = details["data"].get("time_series_data", [])
# #                 value = next((entry["normalized_value"] for entry in series if entry["year"] == year), 0)
# #                 feature_row[factor] = value * influence_scores[factor]  # Weighted factor contribution
# #             feature_data.append(feature_row)

# #         df = pd.DataFrame(feature_data)
# #         df.set_index("Year", inplace=True)
# #         df["Actual"] = actual_values

# #         # **Step 5: Train-Test Split**
# #         train_df = df[df.index <= 2014]  # Train on 1993–2014
# #         test_df = df[(df.index >= 2015) & (df.index <= 2024)]  # Test on 2015–2024

# #         X_train, y_train = train_df.drop(columns=["Actual"]).values, train_df["Actual"].values
# #         X_test, y_test = test_df.drop(columns=["Actual"]).values, test_df["Actual"].values

# #         # **Step 6: Train an ML Model (XGBoost)**
# #         model = xgb.XGBRegressor(objective="reg:squarederror", n_estimators=100, random_state=42)
# #         model.fit(X_train, y_train)

# #         # **Step 7: Evaluate Model Quality (R² Score)**
# #         y_pred = model.predict(X_test)
# #         print("Actual Y is: ", y_test)
# #         print("Predicted Y is: ", y_pred)

# #         r2 = r2_score(y_test, y_pred) if len(y_test) > 1 else None  # Evaluate quality
# #         print("R² score is: ", r2)

# #         # **Step 8: Return Updated Links and Model Quality**
# #         return {
# #             "updated_links": updated_links,
# #             "model_quality": r2
# #         }

# #     except Exception as e:
# #         print(f"Error: {e}")
# #         return {
# #             "updated_links": [],
# #             "model_quality": None
# #         }

# import numpy as np
# import pandas as pd
# from econml.dml import NonParamDML
# from sklearn.ensemble import RandomForestRegressor
# from sklearn.linear_model import Lasso
# from sklearn.metrics import r2_score, mean_squared_error
# import xgboost as xgb

# def estimate_causal_effects_and_predict(graph_data):
#     try:
#         factors = graph_data.get("factors", {})
#         links = graph_data.get("links", [])
#         target_variable = graph_data.get("selectedTarget")

#         if not factors or not links or not target_variable:
#             raise ValueError("Graph data must contain 'factors', 'links', and 'selectedTarget'.")

#         updated_links = []
#         factor_effects = {}  # Store estimated + user-defined weights

#         # **Step 1: Estimate Causal Weights Using NonParamDML**
#         for link in links:
#             start_factor = link["startFactor"]
#             end_factor = link["endFactor"]
#             trainable = link.get("trainable", False)
#             weight = link.get("weight", None)  # User-defined weight

#             if start_factor not in factors or end_factor not in factors:
#                 raise ValueError(f"Factors {start_factor} or {end_factor} not found.")

#             start_series = factors[start_factor]["data"].get("time_series_data", [])
#             end_series = factors[end_factor]["data"].get("time_series_data", [])

#             if not start_series or not end_series:
#                 raise ValueError(f"Missing time-series data for {start_factor} or {end_factor}.")

#             T_data = np.array([entry["normalized_value"] for entry in start_series]).reshape(-1, 1)
#             Y_data = np.array([entry["normalized_value"] for entry in end_series]).reshape(-1, 1)

#             if trainable:
#                 # Use NonParamDML for non-linear causal effect estimation
#                 dml = NonParamDML(
#                     model_y=RandomForestRegressor(n_estimators=100, random_state=42),  # Model for outcome
#                     model_t=RandomForestRegressor(n_estimators=100, random_state=42),  # Model for treatment
#                     model_final=Lasso(alpha=0.1),  # Final model for treatment effect
#                     random_state=42
#                 )
#                 # Use dummy covariates (all zeros) if no covariates are available
#                 X_dummy = np.zeros((Y_data.shape[0], 1))  # Shape (n_samples, 1)
#                 dml.fit(Y_data, T_data, X=X_dummy)  # Fit the model
#                 causal_effect = float(np.mean(dml.const_marginal_effect(X=X_dummy)))  # Average causal effect
#             else:
#                 causal_effect = weight  # Use user-defined weight

#             factor_effects[(start_factor, end_factor)] = causal_effect
#             updated_links.append({
#                 "startFactor": start_factor,
#                 "endFactor": end_factor,
#                 "normalized_weight": causal_effect,
#                 "trainable": trainable
#             })

#         # **Step 2: Compounding Causal Effects**
#         # Create a dictionary to store predicted factor values
#         predicted_factors = {factor: [] for factor in factors}

#         # Initialize root factors (factors with no parents)
#         root_factors = [factor for factor in factors if not any(link["endFactor"] == factor for link in links)]

#         # Iterate over years to predict factor values
#         years = sorted(set(entry["year"] for factor_data in factors.values() for entry in factor_data["data"].get("time_series_data", [])))
#         for year in years:
#             for factor in root_factors:
#                 # Use actual values for root factors
#                 series = factors[factor]["data"].get("time_series_data", [])
#                 value = next((entry["normalized_value"] for entry in series if entry["year"] == year), 0)
#                 predicted_factors[factor].append(value)

#             # Predict downstream factors iteratively
#             for link in updated_links:
#                 start_factor = link["startFactor"]
#                 end_factor = link["endFactor"]
#                 if end_factor not in root_factors:
#                     # Compute the value of the end factor as a weighted sum of its parents
#                     parent_value = predicted_factors[start_factor][-1]  # Latest value of the parent factor
#                     causal_effect = factor_effects[(start_factor, end_factor)]
#                     predicted_value = parent_value * causal_effect
#                     predicted_factors[end_factor].append(predicted_value)

#         # **Step 3: Predict Target Variable**
#         # Use the predicted values of the target variable's parents to compute Y
#         target_parents = [link["startFactor"] for link in links if link["endFactor"] == target_variable]
#         predicted_Y = []
#         for year in years:
#             y_value = 0
#             for parent in target_parents:
#                 y_value += predicted_factors[parent][years.index(year)]
#             predicted_Y.append(y_value)

#         # **Step 4: Evaluate Model Quality**
#         # Get actual values of the target variable
#         target_series = factors[target_variable]["data"].get("time_series_data", [])
#         actual_Y = [entry["normalized_value"] for entry in target_series if entry["year"] in years]

#         print("Actual Y is: ", actual_Y)
#         print("Predicted Y is: ", predicted_Y)

#         # Compute R² score and MSE
#         r2 = r2_score(actual_Y, predicted_Y)
#         mse = mean_squared_error(actual_Y, predicted_Y)
#         print(f"R² score: {r2}, MSE: {mse}")

#         # **Step 5: Return Updated Links and Model Quality**
#         return {
#             "updated_links": updated_links,
#             "model_quality": mse
#         }

#     except Exception as e:
#         print(f"Error: {e}")
#         return {
#             "updated_links": [],
#             "model_quality": None
#         }

import numpy as np
from econml.dml import CausalForestDML
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import r2_score, mean_squared_error

def estimate_causal_effects(factors, links):
    """
    Estimate causal effects using CausalForestDML for trainable links.
    For non-trainable links, use user-defined weights.
    """
    factor_effects = {}
    updated_links = []

    for link in links:
        start_factor = link["startFactor"]
        end_factor = link["endFactor"]
        trainable = link.get("trainable", False)
        weight = link.get("weight", None)

        if start_factor not in factors or end_factor not in factors:
            raise ValueError(f"Factors {start_factor} or {end_factor} not found.")

        start_series = factors[start_factor]["data"].get("time_series_data", [])
        end_series = factors[end_factor]["data"].get("time_series_data", [])

        if not start_series or not end_series:
            raise ValueError(f"Missing time-series data for {start_factor} or {end_factor}.")

        T_data = np.array([entry["normalized_value"] for entry in start_series]).reshape(-1, 1)
        Y_data = np.array([entry["normalized_value"] for entry in end_series]).reshape(-1, 1)

        if trainable:
            # Use CausalForestDML for trainable links
            est = CausalForestDML(
                model_y=RandomForestRegressor(),
                model_t=RandomForestRegressor(),
                criterion='mse',
                n_estimators=1000,
                min_impurity_decrease=0.001,
                random_state=123
            )
            X_dummy = np.zeros((len(Y_data), 1))  # Dummy covariates
            est.fit(Y_data, T_data, X=X_dummy)
            causal_effect = float(np.mean(est.effect(X_dummy)))  # Average treatment effect
        else:
            # Use user-defined weight for non-trainable links
            causal_effect = weight

        factor_effects[(start_factor, end_factor)] = causal_effect
        updated_links.append({
            "startFactor": start_factor,
            "endFactor": end_factor,
            "normalized_weight": causal_effect,
            "trainable": trainable
        })

    return factor_effects, updated_links

def predict_factors(factors, links, factor_effects, years):
    """
    Predict factor values based on causal effects and time series data.
    """
    predicted_factors = {factor: [] for factor in factors}
    root_factors = [factor for factor in factors if not any(link["endFactor"] == factor for link in links)]

    for year in years:
        # Initialize root factors with actual values
        for factor in root_factors:
            series = factors[factor]["data"].get("time_series_data", [])
            value = next((entry["normalized_value"] for entry in series if entry["year"] == year), 0)
            predicted_factors[factor].append(value)

        # Predict downstream factors iteratively
        for link in links:
            start_factor = link["startFactor"]
            end_factor = link["endFactor"]
            if end_factor not in root_factors:
                parent_value = predicted_factors[start_factor][-1]  # Latest value of the parent factor
                causal_effect = factor_effects[(start_factor, end_factor)]
                predicted_value = parent_value * causal_effect
                predicted_factors[end_factor].append(predicted_value)

    return predicted_factors

def evaluate_model(actual_Y, predicted_Y):
    """
    Evaluate the model using R² score and MSE.
    """
    r2 = r2_score(actual_Y, predicted_Y)
    mse = mean_squared_error(actual_Y, predicted_Y)
    return r2, mse

def estimate_causal_effects_and_predict(graph_data):
    """
    Main function to estimate causal effects, predict target variable, and evaluate model quality.
    """
    try:
        factors = graph_data.get("factors", {})
        links = graph_data.get("links", [])
        target_variable = graph_data.get("selectedTarget")

        if not factors or not links or not target_variable:
            raise ValueError("Graph data must contain 'factors', 'links', and 'selectedTarget'.")

        # Step 1: Estimate causal effects
        factor_effects, updated_links = estimate_causal_effects(factors, links)

        # Step 2: Predict factor values
        years = sorted(set(entry["year"] for factor_data in factors.values() for entry in factor_data["data"].get("time_series_data", [])))
        predicted_factors = predict_factors(factors, links, factor_effects, years)

        # Step 3: Predict target variable
        target_parents = [link["startFactor"] for link in links if link["endFactor"] == target_variable]
        predicted_Y = [sum(predicted_factors[parent][years.index(year)] for parent in target_parents) for year in years]

        # Step 4: Evaluate model quality
        target_series = factors[target_variable]["data"].get("time_series_data", [])
        actual_Y = [entry["normalized_value"] for entry in target_series if entry["year"] in years]

        r2, mse = evaluate_model(actual_Y, predicted_Y)
        print(f"R² score: {r2}, MSE: {mse}")

        # Step 5: Return updated links and model quality
        return {
            "updated_links": updated_links,
            "model_quality": mse
        }

    except Exception as e:
        print(f"Error: {e}")
        return {
            "updated_links": [],
            "model_quality": None
        }

