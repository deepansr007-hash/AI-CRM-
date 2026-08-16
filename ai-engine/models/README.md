# AI Model Registry & Serialization

This folder houses the serialized weights and configurations for the active machine learning models utilized in pipeline assessments.

## Active Models
1. **lead_scoring_xgb (v2.1.4)**
   - Algorithmic backbone: XGBoost Classifier.
   - Purpose: Predicts likelihood of lead conversion based on organic interactions, source, company size, and contract tier.
   - Core hyperparameters: `max_depth: 6, learning_rate: 0.1, n_estimators: 150`.

2. **churn_predictor_ensemble (v1.8.8)**
   - Algorithmic backbone: Random Forest + Logistic Regression Ensemble.
   - Purpose: Evaluates probability that an active customer churns in the next 30 days based on communication frequency, days inactive, status logs, and active seats.
   - Core hyperparameters: `n_estimators: 200, min_samples_split: 5`.

3. **sales_forecaster_lstm (v3.0.1)**
   - Algorithmic backbone: Recurrent LSTM neural network.
   - Purpose: Predicts monthly aggregated deal closures and ARR progressions.
