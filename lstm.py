import numpy as np
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Input
from tensorflow.keras.optimizers import Adam

def train_lstm_with_target(graph_data, target_factor_name, lookback_period=10):
    """
    Train an LSTM model considering downstream influence on a target variable
    with a fixed lookback period (e.g., 10 years).

    Parameters:
    - graph_data (dict): Input data containing factors, links, and time-series data.
    - target_factor_name (str): The name of the target factor in the Bayesian network.
    - lookback_period (int): Number of timesteps for the lookback period (e.g., 10 for 10 years of annual data).

    Returns:
    - list: A list of updated weights for trainable links.
    """
    try:
        # Extract links and factors from graph_data
        links = graph_data.get('links', [])
        factors = graph_data.get('factors', {})

        if not links or not factors:
            raise ValueError("Graph data must include 'links' and 'factors'.")

        # Ensure target factor exists
        if target_factor_name not in factors:
            raise ValueError(f"Target factor '{target_factor_name}' not found in factors.")

        # Prepare training data
        X_train = []
        y_train = []

        # Extract normalized time-series data for all links
        for link in links:
            start_factor = link['startFactor']

            # Extract normalized time-series data for the start factor
            time_series = factors[start_factor]['data'].get('time_series_data')
            if not time_series:
                raise ValueError(f"Missing time series data for factor: {start_factor}")

            # Extract normalized values and apply fixed lookback period
            normalized_values = [entry['normalized_value'] for entry in time_series[-lookback_period:]]
            
            # Pad with zeros if time series is shorter than lookback period
            if len(normalized_values) < lookback_period:
                normalized_values = [0] * (lookback_period - len(normalized_values)) + normalized_values

            X_train.append(normalized_values)

        # Prepare target variable's time-series data
        target_time_series = factors[target_factor_name]['data'].get('time_series_data')
        if not target_time_series:
            raise ValueError(f"Missing time series data for target factor: {target_factor_name}")
        
        y_target = [entry['normalized_value'] for entry in target_time_series[-lookback_period:]]

        # Pad with zeros if target series is shorter than lookback period
        if len(y_target) < lookback_period:
            y_target = [0] * (lookback_period - len(y_target)) + y_target

        # Reshape X_train and y_train to ensure matching dimensions
        X_train = np.array(X_train).T  # Transpose to align inputs with outputs
        X_train = X_train.reshape((X_train.shape[0], X_train.shape[1], 1))  # Add feature dimension

        y_train = np.array(y_target)

        # Ensure that X_train and y_train have matching first dimensions
        if X_train.shape[0] != y_train.shape[0]:
            raise ValueError(f"Mismatch between X_train samples ({X_train.shape[0]}) and y_train samples ({y_train.shape[0]}).")

        # Define LSTM model
        model = Sequential([
            Input(shape=(lookback_period, 1)),  # Fixed lookback period as input shape
            LSTM(50, activation='relu'),
            Dense(1)  # Single dense layer for predicting influence on target variable
        ])
        
        model.compile(optimizer=Adam(learning_rate=0.001), loss='mse')

        # Train the model using X_train and y_target as labels
        model.fit(X_train, y_train, epochs=50, batch_size=32, verbose=0)

        # Predict new weights based on trained model
        new_weights = model.predict(X_train).flatten()

        # Update weights in links
        updated_links = []
        for i, link in enumerate(links):
            if link.get('trainable', False):  # Check if link is trainable
                updated_links.append({
                    "startFactor": link['startFactor'],
                    "endFactor": link['endFactor'],
                    "new_weight": float(new_weights[i])
                })

        return updated_links

    except KeyError as e:
        print(f"KeyError in train_lstm_with_target: {e}")
        raise

    except ValueError as e:
        print(f"ValueError in train_lstm_with_target: {e}")
        raise

    except Exception as e:
        print(f"Unexpected error in train_lstm_with_target: {e}")
        raise
