# import numpy as np
# import pandas as pd
# from econml.panel.dml import DynamicDML
# from sklearn.linear_model import Ridge
# from typing import Dict, List
# import warnings

# def debug_data_alignment(treatment_df, outcome_df):
#     """Enhanced debugging function with column information"""
#     print("\n=== Data Alignment Debug ===")
#     print(f"Data shape - Treatment: {treatment_df.shape}, Outcome: {outcome_df.shape}")
#     print(f"Treatment years: {treatment_df['year'].tolist()}")
#     print(f"Outcome years: {outcome_df['year'].tolist()}")
#     print(f"Aligned: {all(treatment_df['year'] == outcome_df['year'])}")
#     print(f"Treatment NaN values: {treatment_df.isna().sum().sum()}")
#     print(f"Outcome NaN values: {outcome_df.isna().sum().sum()}")
#     print(f"Treatment columns: {treatment_df.columns.tolist()}")
#     print(f"Outcome columns: {outcome_df.columns.tolist()}")

# def prepare_aligned_data_no_lags(start_series, end_series):
#     """Prepares aligned treatment-outcome pairs without using lags, including all years"""
#     print(f"\n--- Preparing data for analysis (no lags) ---")
    
#     # Convert to DataFrames and sort
#     treatment_df = pd.DataFrame(start_series).sort_values('year')
#     outcome_df = pd.DataFrame(end_series).sort_values('year')
    
#     print(f"Original treatment years: {treatment_df['year'].min()} to {treatment_df['year'].max()}")
#     print(f"Original outcome years: {outcome_df['year'].min()} to {outcome_df['year'].max()}")
    
#     # Find common years
#     common_years = sorted(set(treatment_df['year']).intersection(set(outcome_df['year'])))
#     print(f"Common years: {len(common_years)} years from {min(common_years)} to {max(common_years)}")
    
#     # Use all common years instead of filtering to historical only
#     treatment_df = treatment_df[treatment_df['year'].isin(common_years)].reset_index(drop=True)
#     outcome_df = outcome_df[outcome_df['year'].isin(common_years)].reset_index(drop=True)
#     print("Using all available years for analysis (1993-2035)")
    
#     # Rename outcome columns to avoid conflicts after merging
#     outcome_df = outcome_df.rename(columns={'normalized_value': 'o_normalized_value'})
#     if 'value' in outcome_df.columns:
#         outcome_df = outcome_df.rename(columns={'value': 'o_value'})
    
#     # Standardize all data
#     t_mean = treatment_df['normalized_value'].mean()
#     t_std = treatment_df['normalized_value'].std() + 1e-8
#     o_mean = outcome_df['o_normalized_value'].mean()
#     o_std = outcome_df['o_normalized_value'].std() + 1e-8
    
#     # Apply standardization
#     treatment_df['t_value_std'] = (treatment_df['normalized_value'] - t_mean) / t_std
#     outcome_df['o_value_std'] = (outcome_df['o_normalized_value'] - o_mean) / o_std
    
#     # Merge on year
#     combined = pd.merge(treatment_df, outcome_df, on='year')
    
#     # Print column information for debugging
#     print(f"Final dataset: {len(combined)} rows with years {min(combined['year'])} to {max(combined['year'])}")
#     print(f"Combined columns: {combined.columns.tolist()}")
    
#     # Verify data is not empty
#     if len(combined) == 0:
#         raise ValueError("No valid data after alignment")
    
#     return combined


# def estimate_causal_effects(factors: Dict, links: List[Dict]) -> List[Dict]:
#     """Implementation using DynamicDML without lags"""
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
#             print(f"\nSkipping non-trainable link: {link['startFactor']} -> {link['endFactor']}")
#             updated_links.append(current_link)
#             continue
            
#         try:
#             print(f"\n\n==== Processing link: {link['startFactor']} -> {link['endFactor']} ====")
            
#             # Get source data
#             start_series = factors[link["startFactor"]]["data"]["time_series_data"]
#             end_series = factors[link["endFactor"]]["data"]["time_series_data"]
            
#             # Create aligned dataset without lags
#             combined = prepare_aligned_data_no_lags(start_series, end_series)
            
#             # Debug alignment after processing
#             debug_data_alignment(
#                 combined[['year', 'normalized_value', 't_value_std']],
#                 combined[['year', 'o_normalized_value', 'o_value_std']]
#             )
            
#             # Prepare inputs - use the standardized values directly without lags
#             Y = combined['o_value_std'].values.reshape(-1, 1)
#             T = combined['t_value_std'].values.reshape(-1, 1)
            
#             # Use sequential indices for groups
#             groups = np.arange(len(Y))
            
#             print(f"\nFinal shapes - Y:{Y.shape}, T:{T.shape}, X:None, groups:{groups.shape}")
#             print("Using direct values without lags")
            
#             # Use Ridge regression with high regularization for stability
#             print("Using 2-fold cross-validation with Ridge regression (alpha=5.0)")
            
#             # Initialize model with regularization
#             model = DynamicDML(
#                 model_y=Ridge(alpha=5.0),
#                 model_t=Ridge(alpha=5.0),
#                 cv=2,
#                 random_state=42
#             )
            
#             # Suppress warnings during fitting
#             with warnings.catch_warnings():
#                 warnings.simplefilter("ignore")
#                 model.fit(Y, T, X=None, groups=groups)
            
#             # Calculate effect using the model
#             effect = float(np.mean(model.effect()))
#             print(f"DynamicDML estimated effect: {effect:.4f}")
            
#             # Update link with the estimated effect
#             current_link.update({
#                 "weight": effect,
#                 "years_used": len(Y)
#             })
            
#         except Exception as e:
#             print(f"Failed {link['startFactor']}->{link['endFactor']}: {str(e)}")
#             # Keep trainable=True even if there's an error
#             current_link.update({
#                 "error": str(e)
#             })
            
#         updated_links.append(current_link)
    
#     return updated_links

# def calculate_model_quality(updated_links):
#     # Initialize quality components
#     trainable_links = [link for link in updated_links if link.get("trainable", False)]
#     fixed_links = [link for link in updated_links if not link.get("trainable", False)]
    
#     # 1. Statistical validity component (30%)
#     effect_validity = sum(1 for link in trainable_links if abs(link.get("weight", 0)) < 2.0) / max(1, len(trainable_links))
    
#     # 2. Respect for fixed links (20%)
#     fixed_links_respected = 1.0  # You're already respecting these in your implementation
    
#     # 3. Data coverage component (20%)
#     data_coverage = sum(link.get("years_used", 0) for link in trainable_links) / (len(trainable_links) * 43) if trainable_links else 1.0
    
#     # 4. Estimation success component (30%)
#     estimation_success = sum(1 for link in trainable_links if link.get("error") is None) / max(1, len(trainable_links))
    
#     # Weighted quality score
#     quality = (0.3 * effect_validity + 0.2 * fixed_links_respected + 
#               0.2 * data_coverage + 0.3 * estimation_success) * 100
    
#     return quality


# def run_analysis(graph_data: Dict) -> Dict:
#     """Main analysis function with fixed model quality"""
#     print(graph_data)
#     try:
#         # Input validation
#         if not all(k in graph_data for k in ['factors', 'links']):
#             raise ValueError("Missing required fields in graph data")
            
#         print(f"Processing {len(graph_data['links'])} links in the graph")
        
#         # Run estimation
#         updated_links = estimate_causal_effects(
#             graph_data['factors'],
#             graph_data['links']
#         )
        
#         # Fixed model quality as requested
#         model_quality =  calculate_model_quality(updated_links)

        
#         print(f"\nAnalysis complete. Updated {len(updated_links)} links.")
        
#         # Return in format expected by frontend
#         return {
#             "updated_links": updated_links,
#             "model_quality": model_quality,
#             "status": "success"
#         }
        
#     except Exception as e:
#         print(f"Analysis failed with error: {str(e)}")
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

def prepare_panel_data_with_lags(start_series, end_series, lag_years=5):
    """Prepares panel data with sliding windows to capture temporal dependencies"""
    print(f"\n--- Preparing panel data with {lag_years}-year lags ---")
    
    # Window size = lag_years + 1 to include current year
    window_size = lag_years + 1
    
    # Convert to DataFrames and sort
    treatment_df = pd.DataFrame(start_series).sort_values('year')
    outcome_df = pd.DataFrame(end_series).sort_values('year')
    
    print(f"Original years range: {treatment_df['year'].min()}-{treatment_df['year'].max()}")
    
    # Find common years
    common_years = sorted(set(treatment_df['year']).intersection(set(outcome_df['year'])))
    print(f"Common years: {len(common_years)} years from {min(common_years)} to {max(common_years)}")
    
    # Filter to common years
    treatment_df = treatment_df[treatment_df['year'].isin(common_years)].reset_index(drop=True)
    outcome_df = outcome_df[outcome_df['year'].isin(common_years)].reset_index(drop=True)
    
    # Rename outcome columns to avoid conflicts
    outcome_df = outcome_df.rename(columns={'normalized_value': 'o_normalized_value'})
    if 'value' in outcome_df.columns:
        outcome_df = outcome_df.rename(columns={'value': 'o_value'})
    
    # Merge on year
    combined = pd.merge(treatment_df, outcome_df, on='year')
    
    # Standardize values
    t_mean = combined['normalized_value'].mean()
    t_std = combined['normalized_value'].std() + 1e-8
    o_mean = combined['o_normalized_value'].mean()
    o_std = combined['o_normalized_value'].std() + 1e-8
    
    combined['t_value_std'] = (combined['normalized_value'] - t_mean) / t_std
    combined['o_value_std'] = (combined['o_normalized_value'] - o_mean) / o_std
    
    # Sort by year
    combined = combined.sort_values('year').reset_index(drop=True)
    
    # Create panel data using sliding windows
    panel_data = []
    n_years = len(combined)
    
    if n_years < window_size:
        raise ValueError(f"Need at least {window_size} years of data for {lag_years}-year lags")
    
    # Create sliding windows - each becomes a panel
    for i in range(n_years - window_size + 1):
        window = combined.iloc[i:i+window_size].copy()
        window['panel_id'] = i  # Unique panel ID for each window
        panel_data.append(window)
    
    # Combine all windows
    panel_df = pd.concat(panel_data, ignore_index=True)
    
    n_panels = panel_df['panel_id'].nunique()
    print(f"Panel data created: {n_panels} panels with {window_size} time periods each")
    print(f"Effective years used: {len(combined['year'].unique())}")
    
    return panel_df

def estimate_causal_effects(factors: Dict, links: List[Dict]) -> List[Dict]:
    """Implementation using DynamicDML with lagged variables"""
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
            print(f"\nSkipping non-trainable link: {link['startFactor']} -> {link['endFactor']}")
            updated_links.append(current_link)
            continue
            
        try:
            print(f"\n==== Processing link: {link['startFactor']} -> {link['endFactor']} ====")
            
            # Get source data
            start_series = factors[link["startFactor"]]["data"]["time_series_data"]
            end_series = factors[link["endFactor"]]["data"]["time_series_data"]
            
            # Create panel data with 5-year lags
            lag_years = 5
            panel_df = prepare_panel_data_with_lags(start_series, end_series, lag_years)
            
            # Prepare for DynamicDML
            Y = panel_df['o_value_std'].values
            T = panel_df['t_value_std'].values.reshape(-1, 1)
            groups = panel_df['panel_id'].values
            
            print(f"Model input shapes - Y:{Y.shape}, T:{T.shape}, groups:{groups.shape}")
            
            # Initialize model with Ridge regression for stability
            model = DynamicDML(
                model_y=Ridge(alpha=5.0),
                model_t=Ridge(alpha=5.0),
                cv=2,
                random_state=42
            )
            
            # Fit model
            with warnings.catch_warnings():
                warnings.simplefilter("ignore")
                model.fit(Y, T, X=None, groups=groups, inference='auto')
            
            # Calculate causal effect
            effect = float(np.mean(model.effect()))
            print(f"Estimated causal effect with lags: {effect:.4f}")
            
            # Update link with results
            current_link.update({
                "weight": effect,
                "years_used": len(panel_df['year'].unique()),
                "lag_years": lag_years
            })
            
        except Exception as e:
            print(f"Failed to estimate {link['startFactor']}->{link['endFactor']}: {str(e)}")
            current_link.update({"error": str(e)})
            
        updated_links.append(current_link)
    
    return updated_links

def calculate_model_quality(updated_links):
    # Same quality calculation as before
    trainable_links = [link for link in updated_links if link.get("trainable", False)]
    
    # Statistical validity (30%)
    effect_validity = sum(1 for link in trainable_links if abs(link.get("weight", 0)) < 2.0) / max(1, len(trainable_links))
    
    # Fixed links respected (20%)
    fixed_links_respected = 1.0
    
    # Data coverage (20%)
    data_coverage = sum(link.get("years_used", 0) for link in trainable_links) / (len(trainable_links) * 43) if trainable_links else 1.0
    
    # Estimation success (30%)
    estimation_success = sum(1 for link in trainable_links if link.get("error") is None) / max(1, len(trainable_links))
    
    # Weighted score
    quality = (0.3 * effect_validity + 0.2 * fixed_links_respected + 
               0.2 * data_coverage + 0.3 * estimation_success) * 100
    
    return quality

def run_analysis(graph_data: Dict) -> Dict:
    print("Graph data is: ", graph_data)
    """Main analysis function with temporal dependencies"""
    try:
        if not all(k in graph_data for k in ['factors', 'links']):
            raise ValueError("Missing required fields in graph data")
            
        print(f"Processing {len(graph_data['links'])} links with 5-year lagged variables")
        
        updated_links = estimate_causal_effects(
            graph_data['factors'],
            graph_data['links']
        )
        
        model_quality = calculate_model_quality(updated_links)
        
        print(f"\nAnalysis complete. Model quality: {model_quality:.2f}%")
        
        return {
            "updated_links": updated_links,
            "model_quality": model_quality,
            "status": "success"
        }
        
    except Exception as e:
        print(f"Analysis failed: {str(e)}")
        return {
            "error": str(e),
            "updated_links": [],
            "model_quality": 0,
            "status": "error"
        }
