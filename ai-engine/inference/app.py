import os
import random
from flask import Flask, request, jsonify

app = Flask(__name__)

# Basic routes for AI modeling inferences
@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "healthy",
        "engine": "AI-ML-PyTorch-XGBoost",
        "models_loaded": ["lead_scorer_v2", "churn_predictor_v1"]
    })

@app.route('/predict/lead-score', methods=['POST'])
def lead_score():
    data = request.json or {}
    
    # Simple rule based scoring mockup simulating XGBoost output
    source = data.get('source', '')
    value = float(data.get('value', 0))
    status = data.get('status', '')
    
    score = 50
    reasons = []
    
    if source == 'Referral':
        score += 20
        reasons.append("Referral source exhibits high trust score.")
    elif source in ['Inbound Search', 'Webinar Attendee']:
        score += 12
        reasons.append("Active search engagement exhibits direct intent.")
    
    if value > 50000:
        score += 15
        reasons.append("Value sits in upper quartile of ICP target companies.")
        
    if status == 'proposal':
        score += 15
        reasons.append("Milestone stage reaches proposal offer.")
        
    score = max(10, min(99, score))
    
    # AI recommendations list
    next_steps = []
    if score > 75:
        next_steps = ["Establish executive buyer alignment", "Send enterprise SLA contract specifications"]
    else:
        next_steps = ["Nurture via personalized email updates", "Schedule discovery session callback"]

    return jsonify({
        "score": int(score),
        "reasons": " ".join(reasons) if reasons else "Average intent signals detected.",
        "next_steps": "; ".join(next_steps)
    })

@app.route('/predict/churn', methods=['POST'])
def churn_probability():
    payload = request.json or {}
    customer = payload.get('customerData', {})
    interactions = payload.get('interactions', [])
    
    prob = 0.08
    insights = []
    
    if customer.get('status') == 'at_risk':
        prob += 0.35
        insights.append("Proactively flagged under at-risk category by staff.")
        
    if len(interactions) == 0:
        prob += 0.25
        insights.append("Log contains zero interaction records in CRM history.")
        
    prob = max(0.01, min(0.99, prob))
    
    if prob < 0.2:
        insights.append("High support engagements. Low churn risk.")
    elif prob < 0.6:
        insights.append("Moderate warnings: Decreased tool usage logs.")
    else:
        insights.append("Immediate churn threat detected. CSM alignment recommended.")

    return jsonify({
        "probability": round(prob, 3),
        "insights": " ".join(insights)
    })

@app.route('/generate/email', methods=['POST'])
def generate_email():
    payload = request.json or {}
    client = payload.get('clientInfo', {})
    context = payload.get('context', '')
    
    name = client.get('name', 'Client')
    company = client.get('company', 'your enterprise')
    
    subject = "AI CRM Intelligence Update"
    body = ""
    
    if context == 'lead_nurturing':
        subject = f"Optimizing efficiency plans for {company}"
        body = f"Hi {name},\n\nFollowing up from our conversation, I prepared a summary mapping how AI CRM tools decrease pipeline drag by 20% at {company}.\n\nLet's coordinate a screen share call early next week.\n\nBest,\nSales Engine Team"
    elif context == 'retention_save':
        subject = f"Urgent: Checkpoint regarding {company} support status"
        body = f"Hi {name},\n\nI want to make sure the integration errors you faced are completely resolved. Let's arrange a direct call with lead engineer to sort it out today.\n\nWarm regards,\nLoyalty Team"
    else:
        body = f"Hi {name},\n\nThank you for working with us. Let us know if you need setup files.\n\nRegards,\nSales team"
        
    return jsonify({
        "subject": subject,
        "body": body
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    print(f"Starting Python AI engine microservice on port {port}...")
    app.run(host='0.0.0.0', port=port)
