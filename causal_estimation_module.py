
import numpy as np
import pandas as pd
from econml.panel.dml import DynamicDML
from sklearn.linear_model import Ridge
from typing import Dict, List
import warnings

def prepare_panel_data_with_lags(start_series, end_series, lag_years=5):
    print(f"\n--- Preparing panel data with {lag_years}-year lags ---")
    window_size = lag_years + 1

    treatment_df = pd.DataFrame(start_series).sort_values('year')
    outcome_df = pd.DataFrame(end_series).sort_values('year')

    common_years = sorted(set(treatment_df['year']).intersection(set(outcome_df['year'])))
    treatment_df = treatment_df[treatment_df['year'].isin(common_years)].reset_index(drop=True)
    outcome_df = outcome_df[outcome_df['year'].isin(common_years)].reset_index(drop=True)

    outcome_df = outcome_df.rename(columns={'normalized_value': 'o_normalized_value'})
    if 'value' in outcome_df.columns:
        outcome_df = outcome_df.rename(columns={'value': 'o_value'})

    combined = pd.merge(treatment_df, outcome_df, on='year')

    t_mean = combined['normalized_value'].mean()
    t_std = combined['normalized_value'].std() + 1e-8
    o_mean = combined['o_normalized_value'].mean()
    o_std = combined['o_normalized_value'].std() + 1e-8

    combined['t_value_std'] = (combined['normalized_value'] - t_mean) / t_std
    combined['o_value_std'] = (combined['o_normalized_value'] - o_mean) / o_std
    combined = combined.sort_values('year').reset_index(drop=True)

    panel_data = []
    n_years = len(combined)
    if n_years < window_size:
        raise ValueError(f"Need at least {window_size} years of data")

    for i in range(n_years - window_size + 1):
        window = combined.iloc[i:i+window_size].copy()
        window['panel_id'] = i
        panel_data.append(window)

    panel_df = pd.concat(panel_data, ignore_index=True)

    print(f"Panel data created: {panel_df['panel_id'].nunique()} panels of {window_size} years")
    return panel_df

def estimate_causal_effects(factors: Dict, links: List[Dict], lag_years: int = 5) -> List[Dict]:
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
            print(f"\n==== Estimating: {link['startFactor']} → {link['endFactor']} ====")

            start_series = factors[link["startFactor"]]["data"]["time_series_data"]
            end_series = factors[link["endFactor"]]["data"]["time_series_data"]
            panel_df = prepare_panel_data_with_lags(start_series, end_series, lag_years)

            Y = panel_df['o_value_std'].values
            T = panel_df['t_value_std'].values.reshape(-1, 1)
            groups = panel_df['panel_id'].values

            model = DynamicDML(
                model_y=Ridge(alpha=1.0),
                model_t=Ridge(alpha=1.0),
                cv=2,
                random_state=42
            )

            with warnings.catch_warnings():
                warnings.simplefilter("ignore")
                model.fit(Y, T, X=None, groups=groups, inference='auto')

            effect = float(np.mean(model.effect()))
            current_link.update({
                "weight": effect,
                "years_used": len(panel_df['year'].unique()),
                "lag_years": lag_years
            })

        except Exception as e:
            current_link.update({"error": str(e)})

        updated_links.append(current_link)

    return updated_links

def calculate_model_quality(updated_links: List[Dict]) -> float:
    trainable_links = [link for link in updated_links if link.get("trainable", False)]
    effect_validity = sum(1 for link in trainable_links if abs(link.get("weight", 0)) < 2.0) / max(1, len(trainable_links))
    data_coverage = sum(link.get("years_used", 0) for link in trainable_links) / (len(trainable_links) * 43) if trainable_links else 1.0
    estimation_success = sum(1 for link in trainable_links if link.get("error") is None) / max(1, len(trainable_links))

    quality = (0.3 * effect_validity + 0.2 * 1.0 + 0.2 * data_coverage + 0.3 * estimation_success) * 100
    return quality

def run_analysis(graph_data: Dict) -> Dict:
    try:
        if not all(k in graph_data for k in ['factors', 'links']):
            raise ValueError("Missing required fields in graph data")

        updated_links = estimate_causal_effects(graph_data['factors'], graph_data['links'], lag_years=5)
        model_quality = calculate_model_quality(updated_links)

        return {
            "updated_links": updated_links,
            "model_quality": model_quality,
            "status": "success"
        }

    except Exception as e:
        return {
            "error": str(e),
            "updated_links": [],
            "model_quality": 0,
            "status": "error"
        }
