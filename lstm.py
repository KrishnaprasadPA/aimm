import numpy as np
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense
from tensorflow.keras.optimizers import Adam

def train_lstm(graph_data):
    """
    Train an LSTM model based on graph data and return updated weights.
    
    Parameters:
    - graph_data (dict): The input data containing factors, links, and target factor.

    Returns:
    - list: A list of updated weights for trainable links.
    """
    try:
        # Extract links and factors from graph_data
        links = graph_data.get('links', [])
        factors = graph_data.get('factors', {})

        if not links or not factors:
            raise ValueError("Graph data must include 'links' and 'factors'.")

        # Prepare training data
        X_train = []
        y_train = []
        for link in links:
            start_factor = link['startFactor']
            end_factor = link['endFactor']
            weight = link['weight']

            # Extract normalized time-series data for the start factor
            time_series = factors[start_factor]['data'].get('time_series_data')
            if not time_series:
                raise ValueError(f"Missing time series data for factor: {start_factor}")

            # Extract normalized values from time series
            normalized_values = [entry['normalized_value'] for entry in time_series]
            X_train.append(normalized_values)
            y_train.append(weight)  # Use the link's weight as the target

        # Convert to NumPy arrays
        X_train = np.array(X_train)
        y_train = np.array(y_train)

        # Reshape input for LSTM [samples, timesteps, features]
        if len(X_train.shape) == 2:  # Add feature dimension if missing
            X_train = X_train.reshape((X_train.shape[0], X_train.shape[1], 1))

        # Define LSTM model
        model = Sequential([
            LSTM(50, activation='relu', input_shape=(X_train.shape[1], 1)),
            Dense(1)  # Single dense layer for weight prediction
        ])
        
        model.compile(optimizer=Adam(learning_rate=0.001), loss='mse')

        # Train the model
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
        print(f"KeyError in train_lstm: {e}")
        raise

    except ValueError as e:
        print(f"ValueError in train_lstm: {e}")
        raise

    except Exception as e:
        print(f"Unexpected error in train_lstm: {e}")
        raise
