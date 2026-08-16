-- SQL Demo Seeder Script

-- 1. Insert Initial AI Models
INSERT OR REPLACE INTO ai_models_metrics (model_name, version, accuracy, precision, recall, f1_score, last_trained, status)
VALUES ('lead_scoring_xgb', 'v2.1.4', 0.942, 0.915, 0.938, 0.926, CURRENT_TIMESTAMP, 'active');

INSERT OR REPLACE INTO ai_models_metrics (model_name, version, accuracy, precision, recall, f1_score, last_trained, status)
VALUES ('churn_predictor_ensemble', 'v1.8.8', 0.884, 0.822, 0.891, 0.855, CURRENT_TIMESTAMP, 'active');

INSERT OR REPLACE INTO ai_models_metrics (model_name, version, accuracy, precision, recall, f1_score, last_trained, status)
VALUES ('sales_forecaster_lstm', 'v3.0.1', 0.911, 0.895, 0.904, 0.899, CURRENT_TIMESTAMP, 'active');

-- 2. Initial logs
INSERT INTO system_logs (category, message, severity, timestamp)
VALUES ('System', 'Database initialized successfully.', 'info', CURRENT_TIMESTAMP);
