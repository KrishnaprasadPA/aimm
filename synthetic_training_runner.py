
import numpy as np
import pandas as pd
from training import run_analysis  # Assume your training file is named causal_estimation_module.py

def generate_synthetic_time_series(start_year=1994, end_year=2035, n_factors=3, seed=42):
    np.random.seed(seed)
    years = list(range(start_year, end_year + 1))
    n_years = len(years)

    weights = np.round(np.random.uniform(0.3, 1.2, size=(n_factors, n_factors)), 2)
    np.fill_diagonal(weights, 0)

    data = {f'Factor{i+1}': [] for i in range(n_factors)}
    base = np.random.normal(0, 1, (n_years, n_factors))

    for t in range(n_years):
        for i in range(n_factors):
            influence = 0
            if t > 0:
                for j in range(n_factors):
                    influence += weights[j, i] * base[t-1, j]
            value = 0.7 * base[t, i] + 0.3 * influence + np.random.normal(0, 0.1)
            data[f'Factor{i+1}'].append(value)

    factors = {}
    for i in range(n_factors):
        factor_name = f'Factor{i+1}'
        time_series_data = [
            {"year": years[t], "value": data[factor_name][t], "normalized_value": data[factor_name][t]}
            for t in range(n_years)
        ]
        factors[factor_name] = {
            "name": factor_name,
            "data": {
                "time_series_data": time_series_data
            }
        }

    links = []
    for i in range(n_factors):
        for j in range(n_factors):
            if i != j:
                links.append({
                    "startFactor": f"Factor{i+1}",
                    "endFactor": f"Factor{j+1}",
                    "trainable": True,
                    "weight": weights[i, j]
                })

    graph_data = {
        "modelName": "Synthetic model test",
        "factors": factors,
        "links": links
    }

    return graph_data, weights

if __name__ == "__main__":
    graph_data, ground_truth = generate_synthetic_time_series()
    result = run_analysis(graph_data)

    print("\n=== Ground Truth Weights ===")
    print(ground_truth)

    print("\n=== Estimated Weights ===")
    for link in result["updated_links"]:
        print(f"{link['startFactor']} → {link['endFactor']}: {link['weight']:.4f} (trainable={link['trainable']}, error={link.get('error')})")

    print("\nModel Quality Score: {:.2f}%".format(result["model_quality"]))
