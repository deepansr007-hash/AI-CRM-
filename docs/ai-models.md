# Machine Learning Models Documentation

The AI CRM System incorporates dedicated ML predictors optimized for specific business objectives.

---

## 1. Lead Scoring Classifier (`lead_scoring_xgb`)
- **Backbone**: XGBoost (Extreme Gradient Boosting).
- **Target**: Predicts binary state (Converted / Not Converted).
- **Inference logic**: Weighted inputs from:
  - Lead contact channel.
  - Estimated deal contract value.
  - Status phase velocity.
- **Performance**:
  - Validation Accuracy: **94.2%**
  - Precision Score: **91.5%**

---

## 2. Retention Risk Estimator (`churn_predictor_ensemble`)
- **Backbone**: Random Forest + Regularized Logistic Regression Ensemble.
- **Target**: Churn Probability range `[0.0, 1.0]`.
- **Primary Signals**:
  - Days since last interaction (high degradation indicator).
  - Open support tickets duration.
  - Active licenses ratio.
