# # This is a single factor test
# import numpy as np
# import pandas as pd
# from sklearn.model_selection import train_test_split
# from econml.dml import LinearDML
# from sklearn.linear_model import LinearRegression
# import matplotlib.pyplot as plt

# # Generate synthetic data
# np.random.seed(42)
# n = 1000  # Number of samples
# X1 = np.random.normal(0, 1, n)  # Feature X1 (treatment)
# epsilon = np.random.normal(0, 0.1, n)  # Noise

# # Target variable Y is a linear function of X1 with some noise
# Y = 2 * X1 + epsilon  # True coefficient: 2 for X1

# # Create DataFrame
# df = pd.DataFrame({'X1': X1, 'Y': Y})

# # Split into training and test sets
# X_train, X_test, Y_train, Y_test = train_test_split(df[['X1']], df['Y'], test_size=0.3, random_state=42)

# # Define treatments (X1) and covariates (none in this case)
# T_train = X_train.values  # Treatment (X1)
# X_covariates_train = None  # No additional covariates

# T_test = X_test.values  # Treatment for test set
# X_covariates_test = None  # No additional covariates

# # Define the LinearDML model with LinearRegression for both outcome and treatment models
# model = LinearDML(model_y=LinearRegression(), model_t=LinearRegression(), cv=5)

# # Fit the DML model with explicit treatment and covariate separation
# model.fit(Y_train, T_train, X=X_covariates_train)

# # Estimate average treatment effect using ate()
# ate_dml = model.ate(X=X_covariates_test)

# # Direct regression coefficients for comparison
# regressor = LinearRegression()
# regressor.fit(T_train, Y_train)
# regression_coefficient = regressor.coef_[0]

# # Plot the relationship between X1 and Y
# plt.scatter(X1, Y, alpha=0.5, label="Data")
# plt.xlabel("X1")
# plt.ylabel("Y")
# plt.title("Relationship between X1 and Y")
# plt.legend()
# plt.show()

# # Output results
# print(f"Estimated Treatment Effect (ATE) from DML: {ate_dml}")
# print(f"Direct Regression Coefficient: {regression_coefficient}")


# # This is a 2 factor test with linear relationship

# import numpy as np
# import pandas as pd
# from sklearn.model_selection import train_test_split
# from econml.dml import LinearDML
# from sklearn.linear_model import LinearRegression
# import matplotlib.pyplot as plt

# # Generate synthetic data
# np.random.seed(42)
# n = 1000  # Number of samples
# X1 = np.random.normal(0, 1, n)  # Feature X1 (treatment 1)
# X2 = np.random.normal(0, 1, n)  # Feature X2 (treatment 2)
# epsilon = np.random.normal(0, 0.1, n)  # Noise

# # Target variable Y is a linear function of X1 and X2 with some noise
# Y = 2 * X1 - 1.5 * X2 + epsilon  # True coefficients: 2 for X1, -1.5 for X2

# # Create DataFrame
# df = pd.DataFrame({'X1': X1, 'X2': X2, 'Y': Y})

# # Split into training and test sets
# X_train, X_test, Y_train, Y_test = train_test_split(df[['X1', 'X2']], df['Y'], test_size=0.3, random_state=42)

# # Define treatments (X1 and X2) and covariates (none in this case)
# T_train = X_train.values  # Treatments (X1 and X2)
# X_covariates_train = None  # No additional covariates

# T_test = X_test.values  # Treatments for test set
# X_covariates_test = None  # No additional covariates

# # Define the LinearDML model with LinearRegression for both outcome and treatment models
# model = LinearDML(model_y=LinearRegression(), model_t=LinearRegression(), cv=5)

# # Fit the DML model with explicit treatment and covariate separation
# model.fit(Y_train, T_train, X=X_covariates_train)

# # Estimate average treatment effects using ate()
# ate_dml_X1_X2 = model.const_marginal_effect(X=X_covariates_test)

# # Direct regression coefficients for comparison
# regressor = LinearRegression()
# regressor.fit(T_train, Y_train)
# regression_coefficients = regressor.coef_

# # Output results for treatment effects and regression coefficients
# print(f"Estimated Treatment Effect for X1 from DML: {np.mean(ate_dml_X1_X2[:, 0])}")
# print(f"Estimated Treatment Effect for X2 from DML: {np.mean(ate_dml_X1_X2[:, 1])}")
# print(f"Direct Regression Coefficients: X1={regression_coefficients[0]}, X2={regression_coefficients[1]}")

# # Plot the relationship between each treatment (X1, X2) and Y
# plt.figure(figsize=(10, 5))

# plt.subplot(1, 2, 1)
# plt.scatter(X1, Y, alpha=0.5, label="Data")
# plt.xlabel("X1")
# plt.ylabel("Y")
# plt.title("Relationship between X1 and Y")
# plt.legend()

# plt.subplot(1, 2, 2)
# plt.scatter(X2, Y, alpha=0.5, label="Data")
# plt.xlabel("X2")
# plt.ylabel("Y")
# plt.title("Relationship between X2 and Y")
# plt.legend()

# plt.tight_layout()
# plt.show()



#Non linear DML sin and cos

# import numpy as np
# import pandas as pd
# from sklearn.model_selection import train_test_split
# from econml.dml import NonParamDML
# from sklearn.ensemble import RandomForestRegressor

# # Step 1: Generate synthetic data
# np.random.seed(42)
# n = 1000  # Number of samples
# X1 = np.random.normal(0, 1, n)  # Feature X1 (treatment 1)
# X2 = np.random.normal(0, 1, n)  # Feature X2 (treatment 2)
# epsilon = np.random.normal(0, 0.1, n)  # Noise

# # Nonlinear target variable Y
# Y = 2 * np.sin(X1) - 1.5 * np.cos(X2) + epsilon

# # Create a DataFrame for easier manipulation
# df = pd.DataFrame({'X1': X1, 'X2': X2, 'Y': Y})

# # Step 2: Split into training and test sets
# X_train, X_test, Y_train, Y_test = train_test_split(df[['X1', 'X2']], df['Y'], test_size=0.3, random_state=42)

# # Ensure Y_train is a NumPy array and one-dimensional
# Y_train = Y_train.to_numpy().reshape(-1)  # Ensures Y_train is (n_samples,)
# T_train_X1 = X_train[['X1']].to_numpy()   # Treatment X1 as NumPy array (n_samples, 1)
# T_train_X2 = X_train[['X2']].to_numpy()   # Treatment X2 as NumPy array (n_samples, 1)
# T_test_X1 = X_test[['X1']].to_numpy()     # Test treatment X1 as NumPy array
# T_test_X2 = X_test[['X2']].to_numpy()     # Test treatment X2 as NumPy array

# # Dummy covariates (all zeros)
# X_dummy_train = np.zeros((Y_train.shape[0], 1))  # Shape (700, 1)
# X_dummy_test = np.zeros((T_test_X1.shape[0], 1)) # Shape (300, 1)

# # Validate shapes before fitting (for debugging purposes)
# print(f"Shape of Y_train: {Y_train.shape}")       # Should be (700,)
# print(f"Shape of T_train_X1: {T_train_X1.shape}") # Should be (700, 1)
# print(f"Shape of T_train_X2: {T_train_X2.shape}") # Should be (700, 1)
# print(f"Shape of X_dummy_train: {X_dummy_train.shape}") # Should be (700, 1)

# # Step 3: Define NonParamDML models for X1 and X2

# model_X1 = NonParamDML(
#     model_y=RandomForestRegressor(min_samples_leaf=20),
#     model_t=RandomForestRegressor(min_samples_leaf=20),
#     model_final=RandomForestRegressor(min_samples_leaf=20),
#     discrete_treatment=False
# )

# model_X2 = NonParamDML(
#     model_y=RandomForestRegressor(min_samples_leaf=20),
#     model_t=RandomForestRegressor(min_samples_leaf=20),
#     model_final=RandomForestRegressor(min_samples_leaf=20),
#     discrete_treatment=False
# )

# # Step 4: Fit NonParamDML models with dummy covariates

# model_X1.fit(Y_train, T_train_X1, X=X_dummy_train)
# model_X2.fit(Y_train, T_train_X2, X=X_dummy_train)

# # Step 5: Estimate treatment effects using const_marginal_effect()

# treatment_effects_X1 = model_X1.const_marginal_effect(X=X_dummy_test)
# treatment_effects_X2 = model_X2.const_marginal_effect(X=X_dummy_test)

# # Step 6: Calculate and output the average treatment effects for each factor

# ate_X1 = np.mean(treatment_effects_X1)
# ate_X2 = np.mean(treatment_effects_X2)

# print(f"Estimated Treatment Effect for X1: {ate_X1}")
# print(f"Estimated Treatment Effect for X2: {ate_X2}")

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from econml.dml import NonParamDML
from sklearn.ensemble import GradientBoostingRegressor

# Step 1: Generate synthetic data
np.random.seed(42)
n = 1000  # Number of samples
X1 = np.random.normal(0, 1, n)  # Feature X1 (treatment 1)
X2 = np.random.normal(0, 1, n)  # Feature X2 (treatment 2)
epsilon = np.random.normal(0, 0.1, n)  # Noise

# Nonlinear target variable Y
Y = 2 * np.sin(X1) - 1.5 * np.cos(X2) + epsilon

# Create a DataFrame for easier manipulation
df = pd.DataFrame({'X1': X1, 'X2': X2, 'Y': Y})

# Step 2: Split into training and test sets
X_train, X_test, Y_train, Y_test = train_test_split(df[['X1', 'X2']], df['Y'], test_size=0.3, random_state=42)

# Ensure Y_train is a NumPy array and one-dimensional
Y_train = Y_train.to_numpy().reshape(-1)  # Ensures Y_train is (n_samples,)
T_train_X1 = X_train[['X1']].to_numpy()   # Treatment X1 as NumPy array (n_samples, 1)
T_train_X2 = X_train[['X2']].to_numpy()   # Treatment X2 as NumPy array (n_samples, 1)
T_test_X1 = X_test[['X1']].to_numpy()     # Test treatment X1 as NumPy array
T_test_X2 = X_test[['X2']].to_numpy()     # Test treatment X2 as NumPy array

# Dummy covariates (all zeros)
X_dummy_train = np.zeros((Y_train.shape[0], 1))  # Shape (700, 1)
X_dummy_test = np.zeros((T_test_X1.shape[0], 1)) # Shape (300, 1)

# Validate shapes before fitting (for debugging purposes)
print(f"Shape of Y_train: {Y_train.shape}")       # Should be (700,)
print(f"Shape of T_train_X1: {T_train_X1.shape}") # Should be (700, 1)
print(f"Shape of T_train_X2: {T_train_X2.shape}") # Should be (700, 1)
print(f"Shape of X_dummy_train: {X_dummy_train.shape}") # Should be (700, 1)

# Step 3: Define NonParamDML models for X1 and X2

model_X1 = NonParamDML(
    model_y=GradientBoostingRegressor(),
    model_t=GradientBoostingRegressor(),
    model_final=GradientBoostingRegressor(),
    discrete_treatment=False
)

model_X2 = NonParamDML(
    model_y=GradientBoostingRegressor(),
    model_t=GradientBoostingRegressor(),
    model_final=GradientBoostingRegressor(),
    discrete_treatment=False
)

# Step 4: Fit NonParamDML models with dummy covariates

model_X1.fit(Y_train, T_train_X1, X=X_dummy_train)
model_X2.fit(Y_train, T_train_X2, X=X_dummy_train)

# Step 5: Estimate treatment effects using const_marginal_effect()

treatment_effects_X1 = model_X1.const_marginal_effect(X=X_dummy_test)
treatment_effects_X2 = model_X2.const_marginal_effect(X=X_dummy_test)

# Step 6: Calculate and output the average treatment effects for each factor

ate_X1 = np.mean(treatment_effects_X1)
ate_X2 = np.mean(treatment_effects_X2)

print(f"Estimated Treatment Effect for X1: {ate_X1}")
print(f"Estimated Treatment Effect for X2: {ate_X2}")





