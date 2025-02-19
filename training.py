# import numpy as np
# from econml.dml import LinearDML
# from sklearn.linear_model import LassoCV, MultiTaskLassoCV
# from sklearn.ensemble import RandomForestRegressor

# def estimate_local_causal_effect_jointly(graph_data, lookback_period=10):
#     """
#     Estimates local causal effects for each edge in a directed graph,
#     considering all influencing factors jointly.

#     Parameters:
#     - graph_data (dict): Contains factors, links, and time-series data.
#     - lookback_period (int): Number of past time steps to consider.

#     Returns:
#     - list: Updated list of links with new estimated weights.
#     """
#     try:
#         # Extract factors and links
#         links = graph_data.get('links', [])
#         factors = graph_data.get('factors', {})
#         if not links or not factors:
#             raise ValueError("Graph data must include 'links' and 'factors'.")

#         # Group edges by end factor to estimate jointly
#         end_factor_groups = {}
#         for link in links:
#             end_factor = link['endFactor']
#             if end_factor not in end_factor_groups:
#                 end_factor_groups[end_factor] = []
#             end_factor_groups[end_factor].append(link)

#         updated_links = []

#         for end_factor, incoming_links in end_factor_groups.items():
#             trainable_links = [link for link in incoming_links if link.get('trainable', False)]
#             if not trainable_links:
#                 updated_links.extend(incoming_links)
#                 continue

#             # Get time series for the outcome (end factor)
#             end_series = factors[end_factor]['data'].get('time_series_data')
#             if not end_series:
#                 raise ValueError(f"Missing time series data for {end_factor}")

#             Y_data = np.array([float(entry['normalized_value']) for entry in end_series[-lookback_period:]])


#             # Get time series for all start factors affecting this end factor
#             T_data = []
#             trainable_start_factors = []
#             for link in trainable_links:
#                 start_factor = link['startFactor']
#                 start_series = factors[start_factor]['data'].get('time_series_data')
#                 if not start_series:
#                     raise ValueError(f"Missing time series data for {start_factor}")
                
#                 T_data.append([entry['normalized_value'] for entry in start_series[-lookback_period:]])
#                 trainable_start_factors.append(start_factor)

#             T_data = np.array(T_data).T  # Transpose to align samples

#             # Use other available factors as control variables (X)
#             print("Line 69")
#             # X_data = []
#             # for other_factor in factors:
#             #     if other_factor not in trainable_start_factors + [end_factor]:
#             #         other_series = factors[other_factor]['data'].get('time_series_data')
#             #         if other_series:
#             #             X_data.append([entry['normalized_value'] for entry in other_series[-lookback_period:]])

#             # X_data = np.array(X_data).T if X_data else None

#             # print("Shape of T_data:", T_data.shape)
#             # print("Shape of X_data:", X_data.shape)


#             # # Fit EconML model
#             model_t = MultiTaskLassoCV()  # Treatment model
#             model_y = RandomForestRegressor(n_estimators=100, random_state=42)  # Outcome model
#             dml = LinearDML(model_y=model_y, model_t=model_t, discrete_treatment=False)

#             dml.fit(Y_data, T_data, X=X_data)

#             # # Compute causal effects for each trainable start factor
#             # causal_effects = np.mean(dml.effect(X_data), axis=0)  # Average effect per treatment factor

#             # # Store results
#             # for i, link in enumerate(trainable_links):
#             #     print("Shape is: ", causal_effects.shape)
#             #     new_weight = float(causal_effects[i])
#             #     updated_links.append({
#             #         "startFactor": link['startFactor'],
#             #         "endFactor": link['endFactor'],
#             #         "new_weight": new_weight
#             #     })
#             # Check if there are control variables (X_data)
#             X_data = []

#             # Add control variables: factors that are neither the treatment nor the outcome
#             for other_factor in factors:
#                 if other_factor not in trainable_start_factors + [end_factor]:
#                     other_series = factors[other_factor]['data'].get('time_series_data')
#                     if other_series:
#                         X_data.append([float(entry['normalized_value']) for entry in other_series[-lookback_period:]])

#             # If no control variables are provided, make sure X_data is None
#             X_data = np.array(X_data).T if X_data else None

#             # Check if X_data is None, and proceed accordingly
#             if X_data is None:
#                 print("No control variables (X_data) provided. Proceeding without controls.")
#             else:
#                 print("Control variables (X_data) found:", X_data.shape)

#             # Fit the model
#             dml.fit(Y_data, T_data, X=X_data)

#             # Compute causal effects
#             causal_effects = np.mean(dml.effect(X_data), axis=0)  # Average effect across all samples

#             # Ensure that causal_effects is a 1D array
#             causal_effects = np.ravel(causal_effects)  # Flatten if necessary
#             print("Shape of causal_effects:", causal_effects.shape)

#             # Update links with new weights
#             for i, link in enumerate(trainable_links):
#                 new_weight = float(causal_effects[i])
#                 updated_links.append({
#                     "startFactor": link['startFactor'],
#                     "endFactor": link['endFactor'],
#                     "new_weight": new_weight
#                 })


#         return updated_links

#     except Exception as e:
#         print(f"Error in estimate_local_causal_effect_jointly: {e}")
#         raise

import numpy as np
from econml.dml import LinearDML
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import Lasso

def estimate_local_causal_effect_jointly(graph_data, target_factor_name, lookback_period=10):
    """
    Estimate local causal effects using EconML for a directed graph with time-series data.
    
    Parameters:
    - graph_data (dict): Contains 'factors', 'links', and time-series data.
    - target_factor_name (str): The target factor for causal estimation.
    - lookback_period (int): Number of years to consider for time-series analysis.
    
    Returns:
    - list: Updated links with estimated causal weights.
    """
    try:
        factors = graph_data.get('factors', {})
        links = graph_data.get('links', [])

        if not factors or not links:
            raise ValueError("Graph data must contain 'factors' and 'links'.")

        # Identify trainable links
        trainable_links = [link for link in links if link.get('trainable', False)]
        if not trainable_links:
            raise ValueError("No trainable links found in the graph.")

        updated_links = []

        for link in trainable_links:
            start_factor = link['startFactor']
            end_factor = link['endFactor']

            # Ensure start and end factors exist in the dataset
            if start_factor not in factors or end_factor not in factors:
                raise ValueError(f"Factors {start_factor} or {end_factor} not found.")

            # Extract time-series data for treatment (start_factor) and outcome (end_factor)
            start_series = factors[start_factor]['data'].get('time_series_data', [])
            end_series = factors[end_factor]['data'].get('time_series_data', [])

            if not start_series or not end_series:
                raise ValueError(f"Missing time-series data for {start_factor} or {end_factor}.")

            # Convert time-series data to numpy arrays
            T_data = np.array([float(entry['normalized_value']) for entry in start_series[-lookback_period:]])
            Y_data = np.array([float(entry['normalized_value']) for entry in end_series[-lookback_period:]])

            # Ensure T_data and Y_data have the correct shape
            T_data = T_data.reshape(-1, 1)
            Y_data = Y_data.reshape(-1, 1)

            # Prepare control variables (X_data) - Factors that are neither the treatment nor the outcome
            X_data_list = []
            for other_factor in factors:
                if other_factor not in [start_factor, end_factor]:
                    other_series = factors[other_factor]['data'].get('time_series_data', [])
                    if other_series:
                        X_data_list.append([float(entry['normalized_value']) for entry in other_series[-lookback_period:]])

            # Convert X_data to numpy array or None if empty
            X_data = np.array(X_data_list).T if X_data_list else None

            # Print diagnostic messages
            print(f"\nProcessing link: {start_factor} → {end_factor}")
            print(f"Shape of T_data (treatment): {T_data.shape}")
            print(f"Shape of Y_data (outcome): {Y_data.shape}")
            if X_data is None:
                print("No control variables (X_data) provided. Proceeding without controls.")
            else:
                print(f"Control variables (X_data) found: {X_data.shape}")

            # Define the DML model
            dml = LinearDML(
                model_y=RandomForestRegressor(n_estimators=100),
                model_t=Lasso(alpha=0.1),
                random_state=42
            )

            # Fit the model
            dml.fit(Y_data, T_data, X=X_data)

            # Compute causal effects
            causal_effects = np.mean(dml.effect(X_data), axis=0) if X_data is not None else np.mean(dml.effect(None), axis=0)

            # Ensure causal_effects is a 1D array
            causal_effects = np.ravel(causal_effects)
            print(f"Estimated causal effect: {causal_effects}")

            # Update link with the new estimated weight
            updated_links.append({
                "startFactor": start_factor,
                "endFactor": end_factor,
                "new_weight": float(causal_effects[0])  # Extract single effect value
            })

        return updated_links

    except Exception as e:
        print(f"Error in estimate_local_causal_effect: {e}")
        return []
