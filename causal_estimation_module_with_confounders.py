
# import numpy as np
# import pandas as pd
# from econml.panel.dml import DynamicDML
# from sklearn.linear_model import Ridge
# from typing import Dict, List
# import warnings

# def prepare_panel_data_with_lags_and_confounders(start_series, end_series, confounders_data, lag_years=5):
#     window_size = lag_years + 1
#     treatment_df = pd.DataFrame(start_series).sort_values('year')
#     outcome_df = pd.DataFrame(end_series).sort_values('year')
#     outcome_df = outcome_df.rename(columns={'normalized_value': 'o_normalized_value'})
#     if 'value' in outcome_df.columns:
#         outcome_df = outcome_df.rename(columns={'value': 'o_value'})

#     # Merge treatment and outcome first
#     combined = pd.merge(treatment_df, outcome_df, on='year')

#     # Add confounders
#     for cname, cdata in confounders_data.items():
#         cdf = pd.DataFrame(cdata).sort_values('year')[['year', 'normalized_value']]
#         cdf = cdf.rename(columns={'normalized_value': f'{cname}_conf'})
#         combined = pd.merge(combined, cdf, on='year', how='left')

#     # Standardize treatment and outcome
#     combined['t_value_std'] = (combined['normalized_value'] - combined['normalized_value'].mean()) / (combined['normalized_value'].std() + 1e-8)
#     combined['o_value_std'] = (combined['o_normalized_value'] - combined['o_normalized_value'].mean()) / (combined['o_normalized_value'].std() + 1e-8)

#     # Standardize confounders
#     for cname in confounders_data:
#         cname_std = f'{cname}_conf'
#         mean = combined[cname_std].mean()
#         std = combined[cname_std].std() + 1e-8
#         combined[cname_std] = (combined[cname_std] - mean) / std

#     combined = combined.sort_values('year').reset_index(drop=True)

#     panel_data = []
#     for i in range(len(combined) - window_size + 1):
#         window = combined.iloc[i:i + window_size].copy()
#         window['panel_id'] = i
#         panel_data.append(window)

#     panel_df = pd.concat(panel_data, ignore_index=True)
#     return panel_df

# def estimate_causal_effects(factors: Dict, links: List[Dict], lag_years=5) -> List[Dict]:
#     updated_links = []

#     for link in links:
#         current_link = {
#             "startFactor": link["startFactor"],
#             "endFactor": link["endFactor"],
#             "trainable": link.get("trainable", False),
#             "weight": link.get("weight", 1.0),
#             "error": None
#         }

#         if not current_link["trainable"]:
#             updated_links.append(current_link)
#             continue

#         try:
#             print(f"\n==== Processing: {link['startFactor']} → {link['endFactor']} ====")
#             start_series = factors[link["startFactor"]]["data"]["time_series_data"]
#             end_series = factors[link["endFactor"]]["data"]["time_series_data"]

#             # Identify potential confounders
#             confounders = {
#                 k: v["data"]["time_series_data"]
#                 for k, v in factors.items()
#                 if k not in [link["startFactor"], link["endFactor"]]
#             }

#             panel_df = prepare_panel_data_with_lags_and_confounders(start_series, end_series, confounders, lag_years)

#             Y = panel_df['o_value_std'].values
#             T = panel_df['t_value_std'].values.reshape(-1, 1)

#             if confounders:
#                 X = panel_df[[f"{c}_conf" for c in confounders]].values
#             else:
#                 X = None

#             groups = panel_df['panel_id'].values

#             model = DynamicDML(
#                 model_y=Ridge(alpha=0.1),
#                 model_t=Ridge(alpha=0.1),
#                 cv=2,
#                 random_state=42
#             )

#             with warnings.catch_warnings():
#                 warnings.simplefilter("ignore")
#                 model.fit(Y, T, X=X, groups=groups, inference='auto')

#             effect = float(np.mean(model.effect(X=X)))

#             current_link.update({
#                 "weight": effect,
#                 "years_used": len(panel_df['year'].unique()),
#                 "lag_years": lag_years
#             })

#         except Exception as e:
#             print(f"Error estimating {link['startFactor']} → {link['endFactor']}: {str(e)}")
#             current_link.update({"error": str(e)})

#         updated_links.append(current_link)

#     return updated_links

# def calculate_model_quality(updated_links):
#     trainable_links = [link for link in updated_links if link.get("trainable", False)]
#     effect_validity = sum(1 for link in trainable_links if abs(link.get("weight", 0)) < 2.0) / max(1, len(trainable_links))
#     estimation_success = sum(1 for link in trainable_links if link.get("error") is None) / max(1, len(trainable_links))
#     data_coverage = sum(link.get("years_used", 0) for link in trainable_links) / (len(trainable_links) * 43) if trainable_links else 1.0
#     fixed_links_respected = 1.0

#     quality = (0.3 * effect_validity + 0.2 * fixed_links_respected + 0.2 * data_coverage + 0.3 * estimation_success) * 100
#     return quality

# def run_analysis(graph_data: Dict) -> Dict:
#     try:
#         if not all(k in graph_data for k in ['factors', 'links']):
#             raise ValueError("Missing required fields in graph data")

#         updated_links = estimate_causal_effects(
#             graph_data['factors'],
#             graph_data['links'],
#             lag_years=5
#         )

#         model_quality = calculate_model_quality(updated_links)

#         return {
#             "updated_links": updated_links,
#             "model_quality": model_quality,
#             "status": "success"
#         }

#     except Exception as e:
#         return {
#             "error": str(e),
#             "updated_links": [],
#             "model_quality": 0,
#             "status": "error"
#         }

# import numpy as np
# import pandas as pd
# from econml.panel.dml import DynamicDML
# from sklearn.linear_model import Ridge
# from typing import Dict, List
# import warnings

# def prepare_panel_data_with_lags_and_confounders(start_series, end_series, confounders_data, lag_years=5):
#     window_size = lag_years + 1
#     treatment_df = pd.DataFrame(start_series).sort_values('year')
#     outcome_df = pd.DataFrame(end_series).sort_values('year')
#     outcome_df = outcome_df.rename(columns={'normalized_value': 'o_normalized_value'})
#     if 'value' in outcome_df.columns:
#         outcome_df = outcome_df.rename(columns={'value': 'o_value'})

#     combined = pd.merge(treatment_df, outcome_df, on='year')

#     for cname, cdata in confounders_data.items():
#         cdf = pd.DataFrame(cdata).sort_values('year')[['year', 'normalized_value']]
#         cdf = cdf.rename(columns={'normalized_value': f'{cname}_conf'})
#         combined = pd.merge(combined, cdf, on='year', how='left')

#     combined['t_value_std'] = (combined['normalized_value'] - combined['normalized_value'].mean()) / (combined['normalized_value'].std() + 1e-8)
#     combined['o_value_std'] = (combined['o_normalized_value'] - combined['o_normalized_value'].mean()) / (combined['o_normalized_value'].std() + 1e-8)

#     for cname in confounders_data:
#         cname_std = f'{cname}_conf'
#         mean = combined[cname_std].mean()
#         std = combined[cname_std].std() + 1e-8
#         combined[cname_std] = (combined[cname_std] - mean) / std

#     combined = combined.sort_values('year').reset_index(drop=True)

#     panel_data = []
#     for i in range(len(combined) - window_size + 1):
#         window = combined.iloc[i:i + window_size].copy()
#         window['panel_id'] = i
#         panel_data.append(window)

#     panel_df = pd.concat(panel_data, ignore_index=True)
#     return panel_df
# def prepare_panel_data_with_lags_and_confounders(start_series, end_series, confounders_data, lag_years=5):
#     window_size = lag_years + 1
#     treatment_df = pd.DataFrame(start_series).sort_values('year')
#     outcome_df = pd.DataFrame(end_series).sort_values('year')
#     outcome_df = outcome_df.rename(columns={'normalized_value': 'o_normalized_value'})
#     if 'value' in outcome_df.columns:
#         outcome_df = outcome_df.rename(columns={'value': 'o_value'})

#     print("\n--- Treatment Series ---")
#     print(treatment_df.head())

#     print("\n--- Outcome Series ---")
#     print(outcome_df.head())

#     combined = pd.merge(treatment_df, outcome_df, on='year', how='inner')
#     print("\n✅ After merging treatment and outcome:")
#     print(combined.head())
#     print("NaNs after outcome merge:\n", combined.isna().sum())

#     for cname, cdata in confounders_data.items():
#         cdf = pd.DataFrame(cdata).sort_values('year')[['year', 'normalized_value']]
#         cdf = cdf.rename(columns={'normalized_value': f'{cname}_conf'})
#         combined = pd.merge(combined, cdf, on='year', how='left')
#         print(f"\n✅ After adding confounder '{cname}':")
#         print(combined[[f'{cname}_conf']].describe())
#         print(f"NaNs in '{cname}_conf':", combined[f'{cname}_conf'].isna().sum())

#     combined['t_value_std'] = (combined['normalized_value'] - combined['normalized_value'].mean()) / (combined['normalized_value'].std() + 1e-8)
#     combined['o_value_std'] = (combined['o_normalized_value'] - combined['o_normalized_value'].mean()) / (combined['o_normalized_value'].std() + 1e-8)

#     for cname in confounders_data:
#         cname_std = f'{cname}_conf'
#         mean = combined[cname_std].mean()
#         std = combined[cname_std].std() + 1e-8
#         combined[cname_std] = (combined[cname_std] - mean) / std

#     print("\n✅ Final Combined DataFrame before panelization:")
#     print(combined[['year', 'normalized_value', 'o_normalized_value', 't_value_std', 'o_value_std'] + [f"{c}_conf" for c in confounders_data]].head(10))
#     print("Final NaN count:\n", combined.isna().sum())

#     combined = combined.sort_values('year').reset_index(drop=True)

#     panel_data = []
#     for i in range(len(combined) - window_size + 1):
#         window = combined.iloc[i:i + window_size].copy()
#         window['panel_id'] = i
#         panel_data.append(window)

#     panel_df = pd.concat(panel_data, ignore_index=True)
#     return panel_df



# def estimate_causal_effects(factors: Dict, links: List[Dict], lag_years=5) -> List[Dict]:
#     updated_links = []

#     for link in links:
#         current_link = {
#             "startFactor": link["startFactor"],
#             "endFactor": link["endFactor"],
#             "trainable": link.get("trainable", False),
#             "weight": link.get("weight", 1.0),
#             "error": None
#         }

#         if not current_link["trainable"]:
#             updated_links.append(current_link)
#             continue

#         try:
#             print(f"\n==== Processing: {link['startFactor']} → {link['endFactor']} ====")
#             start_series = factors[link["startFactor"]]["data"]["time_series_data"]
#             end_series = factors[link["endFactor"]]["data"]["time_series_data"]

#             confounders = {
#                 k: v["data"]["time_series_data"]
#                 for k, v in factors.items()
#                 if k not in [link["startFactor"], link["endFactor"]]
#             }

#             panel_df = prepare_panel_data_with_lags_and_confounders(start_series, end_series, confounders, lag_years)

#             if panel_df.shape[0] < 10:
#                 raise ValueError(f"Too few panel samples: {panel_df.shape[0]}")

#             Y = panel_df['o_value_std'].values
#             T = panel_df['t_value_std'].values.reshape(-1, 1)

#             X = panel_df[[f"{c}_conf" for c in confounders]] if confounders else None
#             if X is not None:
#                 X = X.values
#                 if X.shape[0] != len(Y):
#                     raise ValueError("Mismatch in confounder and outcome lengths.")

#             groups = panel_df['panel_id'].values

#             model = DynamicDML(
#                 model_y=Ridge(alpha=0.1),
#                 model_t=Ridge(alpha=0.1),
#                 cv=2,
#                 random_state=42
#             )

#             with warnings.catch_warnings():
#                 warnings.simplefilter("ignore")
#                 model.fit(Y, T, X=X, groups=groups, inference='auto')

#             effect = float(np.mean(model.effect(X=X)))
#             effect = max(min(effect, 5.0), -5.0)  # clamp between -5 and 5

#             current_link.update({
#                 "weight": round(effect, 4),
#                 "years_used": len(panel_df['year'].unique()),
#                 "lag_years": lag_years
#             })

#         except Exception as e:
#             print(f"Error estimating {link['startFactor']} → {link['endFactor']}: {str(e)}")
#             current_link.update({"error": str(e)})

#         updated_links.append(current_link)

#     return updated_links


# def calculate_model_quality(updated_links):
#     trainable_links = [link for link in updated_links if link.get("trainable", False)]
#     if not trainable_links:
#         return 0.0

#     effect_validity = sum(1 for link in trainable_links if abs(link.get("weight", 0)) < 2.0) / len(trainable_links)
#     estimation_success = sum(1 for link in trainable_links if link.get("error") is None) / len(trainable_links)
#     data_coverage = sum(link.get("years_used", 0) for link in trainable_links) / (len(trainable_links) * 43)
#     fixed_links_respected = 1.0

#     quality = (0.3 * effect_validity + 0.2 * fixed_links_respected + 0.2 * data_coverage + 0.3 * estimation_success) * 100
#     return round(quality, 2)


# def run_analysis(graph_data: Dict) -> Dict:
#     try:
#         if not all(k in graph_data for k in ['factors', 'links']):
#             raise ValueError("Missing required fields in graph data")

#         updated_links = estimate_causal_effects(
#             graph_data['factors'],
#             graph_data['links'],
#             lag_years=5
#         )

#         model_quality = calculate_model_quality(updated_links)

#         return {
#             "updated_links": updated_links,
#             "model_quality": model_quality,
#             "status": "success"
#         }

#     except Exception as e:
#         return {
#             "error": str(e),
#             "updated_links": [],
#             "model_quality": 0,
#             "status": "error"
#         }

import numpy as np
import pandas as pd
from econml.panel.dml import DynamicDML
from sklearn.linear_model import Ridge
from typing import Dict, List
import warnings

def prepare_panel_data_with_lags_and_confounders(start_series, end_series, confounders_data, lag_years=5):
    window_size = lag_years + 1

    # Treatment and outcome series using normalized values only
    treatment_df = pd.DataFrame(start_series).sort_values('year')[['year', 'normalized_value']]
    treatment_df = treatment_df.rename(columns={'normalized_value': 'T'})

    outcome_df = pd.DataFrame(end_series).sort_values('year')[['year', 'normalized_value']]
    outcome_df = outcome_df.rename(columns={'normalized_value': 'Y'})

    combined = pd.merge(treatment_df, outcome_df, on='year')

    # Add confounders using normalized values
    for cname, cdata in confounders_data.items():
        cdf = pd.DataFrame(cdata).sort_values('year')[['year', 'normalized_value']]
        cdf = cdf.rename(columns={'normalized_value': f'{cname}_conf'})
        combined = pd.merge(combined, cdf, on='year', how='left')

    # Drop any rows with NaNs (from incomplete confounders)
    combined = combined.dropna()
    combined = combined.sort_values('year').reset_index(drop=True)

    # Panelize the data
    panel_data = []
    for i in range(len(combined) - window_size + 1):
        window = combined.iloc[i:i + window_size].copy()
        window['panel_id'] = i
        panel_data.append(window)

    panel_df = pd.concat(panel_data, ignore_index=True)
    return panel_df

def prepare_self_link_panel(target_series, lag_years=5):
    df = pd.DataFrame(target_series).sort_values('year')
    df = df[['year', 'normalized_value']].dropna().reset_index(drop=True)
    
    values = df['normalized_value'].values
    years = df['year'].values

    X_list = []
    Y_list = []
    group_list = []
    year_list = []

    for i in range(lag_years, len(values)):
        past_values = values[i - lag_years:i]
        target_value = values[i]
        X_list.append(past_values)
        Y_list.append(target_value)
        group_list.append(i - lag_years)
        year_list.append(years[i])

    panel_df = pd.DataFrame({
        'panel_id': group_list,
        'Y': Y_list,
        'year': year_list
    })
    for l in range(lag_years):
        panel_df[f'T_lag_{l}'] = [x[l] for x in X_list]

    return panel_df



def estimate_causal_effects(factors: Dict, links: List[Dict], lag_years=5) -> List[Dict]:
    updated_links = []

    for link in links:
        current_link = {
            "startFactor": link["startFactor"],
            "endFactor": link["endFactor"],
            "trainable": link.get("trainable", False),
            "weight": link.get("weight", 1.0),
            "error": None
        }

        if not current_link["trainable"]:
            updated_links.append(current_link)
            continue

        try:
            print(f"\n==== Processing: {link['startFactor']} → {link['endFactor']} ====")
            start_series = factors[link["startFactor"]]["data"]["time_series_data"]
            end_series = factors[link["endFactor"]]["data"]["time_series_data"]

            confounders = {
                k: v["data"]["time_series_data"]
                for k, v in factors.items()
                if k not in [link["startFactor"], link["endFactor"]]
            }

            panel_df = prepare_panel_data_with_lags_and_confounders(start_series, end_series, confounders, lag_years)

            if panel_df.shape[0] < 10:
                raise ValueError(f"Too few panel samples: {panel_df.shape[0]}")

            Y = panel_df['Y'].values
            T = panel_df['T'].values.reshape(-1, 1)

            X = panel_df[[f"{c}_conf" for c in confounders]] if confounders else None
            if X is not None:
                X = X.values
                if X.shape[0] != len(Y):
                    raise ValueError("Mismatch in confounder and outcome lengths.")

            groups = panel_df['panel_id'].values

            model = DynamicDML(
                model_y=Ridge(alpha=0.1),
                model_t=Ridge(alpha=0.1),
                cv=2,
                random_state=42
            )

            with warnings.catch_warnings():
                warnings.simplefilter("ignore")
                model.fit(Y, T, X=X, groups=groups, inference='auto')

            effect = float(np.mean(model.effect(X=X)))
            effect = max(min(effect, 5.0), -5.0)  # clamp between -5 and 5

            current_link.update({
                "weight": round(effect, 4),
                "years_used": len(panel_df['year'].unique()),
                "lag_years": lag_years
            })

        except Exception as e:
            print(f"Error estimating {link['startFactor']} → {link['endFactor']}: {str(e)}")
            current_link.update({"error": str(e)})

        updated_links.append(current_link)

    return updated_links
def estimate_self_link(factors: Dict, target: str, lag_years=5) -> Dict:
    try:
        print(f"\n==== Estimating SELF-LOOP for Target: {target} ====")
        target_series = factors[target]["data"]["time_series_data"]

        panel_df = prepare_self_link_panel(target_series, lag_years)

        if panel_df.shape[0] < 10:
            raise ValueError("Too few samples for self-loop estimation")

        Y = panel_df["Y"].values
        T = panel_df[[f'T_lag_{i}' for i in range(lag_years)]].values
        groups = panel_df["panel_id"].values

        model = DynamicDML(
            model_y=Ridge(alpha=0.1),
            model_t=Ridge(alpha=0.1),
            cv=2,
            random_state=42
        )

        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            model.fit(Y, T, X=None, groups=groups)

        effect = float(np.mean(model.effect()))
        effect = max(min(effect, 5.0), -5.0)

        return {
            "startFactor": target,
            "endFactor": target,
            "trainable": True,
            "weight": round(effect, 4),
            "error": None,
            "years_used": len(panel_df["year"].unique()),
            "lag_years": lag_years
        }

    except Exception as e:
        print(f"Error estimating self-loop for {target}: {e}")
        return {
            "startFactor": target,
            "endFactor": target,
            "trainable": True,
            "weight": 1.0,
            "error": str(e)
        }




def run_analysis(graph_data: Dict) -> Dict:
    try:
        if not all(k in graph_data for k in ['factors', 'links', 'selectedTarget']):
            raise ValueError("Missing required fields in graph data")

        factors = graph_data['factors']
        links = graph_data['links']
        selected_target = graph_data['selectedTarget']

        updated_links = estimate_causal_effects(factors, links, lag_years=5)

        # Add the self-loop link for target factor
        self_link = estimate_self_link(factors, selected_target, lag_years=5)
        updated_links.append(self_link)


        return {
            "updated_links": updated_links,
            "status": "success"
        }

    except Exception as e:
        return {
            "error": str(e),
            "updated_links": [],
            "status": "error"
        }

