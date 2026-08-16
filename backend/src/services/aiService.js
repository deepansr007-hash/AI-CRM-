import { AI_ENGINE_URL } from '../config/config.js';

/**
 * AI Reasoning and Predictions Integration Service
 */

export const predictLeadScore = async (leadData) => {
  try {
    // Try reaching out to python AI service
    const response = await fetch(`${AI_ENGINE_URL}/predict/lead-score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leadData),
      signal: AbortSignal.timeout(1500) // 1.5s timeout
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    }
  } catch (e) {
    console.warn('[AI Service] Python engine offline, running fallback node estimator models...');
  }

  // Fallback Rule-Based Statistical Estimator (Mocking XGBoost/Logistic Regression weights)
  return calculateLocalLeadScore(leadData);
};

export const predictChurnProbability = async (customerData, interactions = []) => {
  try {
    const response = await fetch(`${AI_ENGINE_URL}/predict/churn`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerData, interactions }),
      signal: AbortSignal.timeout(1500)
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (e) {
    console.warn('[AI Service] Python engine offline, running fallback churn predictor...');
  }

  return calculateLocalChurn(customerData, interactions);
};

export const generateSmartEmail = async (clientInfo, context) => {
  try {
    const response = await fetch(`${AI_ENGINE_URL}/generate/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientInfo, context }),
      signal: AbortSignal.timeout(2000)
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (e) {
    console.warn('[AI Service] Python engine offline, running Local GenAI template simulation...');
  }

  return calculateLocalEmail(clientInfo, context);
};


// --- LOCAL MATHEMATICAL MODELS ---

function calculateLocalLeadScore(lead) {
  let score = 50; // Base score
  const reasons = [];
  const nextSteps = [];

  // 1. Source weight
  if (lead.source === 'Referral') {
    score += 15;
    reasons.push("Referral lead channel displays high conversion trust.");
  } else if (lead.source === 'Inbound Search' || lead.source === 'Webinar Attendee') {
    score += 10;
    reasons.push("Organic interest displays active intent.");
  } else if (lead.source === 'Cold Email' || lead.source === 'Cold Phone') {
    score -= 10;
    reasons.push("Cold outreach displays lower initial intent.");
  }

  // 2. Company Size / Deal Value
  const val = parseFloat(lead.value) || 0;
  if (val > 80000) {
    score += 15;
    reasons.push("Enterprise deal tier matches high-priority account profile.");
  } else if (val > 30000) {
    score += 8;
    reasons.push("Mid-market lead size has healthy margins.");
  }

  // 3. Status engagement
  if (lead.status === 'proposal') {
    score += 15;
    reasons.push("Lead is in active proposal review phase.");
  } else if (lead.status === 'qualified') {
    score += 10;
    reasons.push("Lead is validated for budget and timeline.");
  }

  // Bound check
  score = Math.max(10, Math.min(99, score));

  // Build recommendations
  if (score >= 80) {
    nextSteps.push("Schedule deep technical demo with product solutions architect.");
    nextSteps.push("Prepare custom executive pitch deck highlighting security integrations.");
  } else if (score >= 50) {
    nextSteps.push("Send marketing case studies of similar organizations.");
    nextSteps.push("Arrange a call to identify key decision stakeholders.");
  } else {
    nextSteps.push("Enroll in automated email sequence.");
    nextSteps.push("Mark for low priority quarterly touchpoint.");
  }

  return {
    score,
    reasons: reasons.join(" "),
    next_steps: nextSteps.join("; ")
  };
}

function calculateLocalChurn(cust, interactions) {
  let probability = 0.05; // Base probability 5%
  const insights = [];

  // Low interactions raises churn probability
  const lastActiveDate = cust.last_interaction ? new Date(cust.last_interaction) : null;
  const now = new Date();
  
  if (lastActiveDate) {
    const daysSinceActive = (now - lastActiveDate) / (1000 * 60 * 60 * 24);
    if (daysSinceActive > 30) {
      probability += 0.35;
      insights.push(`No logged interaction in the last ${Math.round(daysSinceActive)} days.`);
    } else if (daysSinceActive > 14) {
      probability += 0.15;
      insights.push(`Warning: Inactive for more than two weeks.`);
    }
  } else {
    probability += 0.40;
    insights.push("No history of touchpoint interactions.");
  }

  // Account status weights
  if (cust.status === 'at_risk') {
    probability += 0.30;
    insights.push("Account proactively flagged as 'At Risk' by customer support team.");
  }

  // Churn bound checks
  probability = Math.max(0.01, Math.min(0.99, probability));

  if (probability < 0.20) {
    insights.push("High customer account health. Low likelihood of churn.");
  } else if (probability < 0.60) {
    insights.push("System detects usage drop warning signs. Schedule key client checkup.");
  } else {
    insights.push("Extreme churn threat. Immediate CSM outreach required to fix pending support blockers.");
  }

  return {
    probability: parseFloat(probability.toFixed(3)),
    insights: insights.join(" ")
  };
}

function calculateLocalEmail(client, context) {
  const name = client.name || 'Friend';
  const company = client.company || 'your team';
  
  let subject = `Following up from AI CRM Customer Success`;
  let body = '';

  if (context === 'lead_nurturing') {
    subject = `Enhancing operational productivity at ${company}`;
    body = `Hi ${name},\n\nI noticed you interest in our AI-driven reports platform. I would love to show you how businesses like ${company} save up to 14 hours per week using automated pipeline insights.\n\nDo you have 10 minutes for a quick introductory video call next Tuesday?\n\nBest regards,\nCRM Success Team`;
  } else if (context === 'retention_save') {
    subject = `Support checkup regarding your experience with AI CRM`;
    body = `Dear ${name},\n\nI want to personally reach out to see how we can optimize your experience with our platform. I notice a few technical support queries are still open. Our specialists are ready to address these with a call today.\n\nLet me know your availability for a dedicated diagnostic session.\n\nSincerely,\nCustomer Loyalty Team`;
  } else {
    body = `Hi ${name},\n\nThank you for choosing to partner with us! Please find attached the setup materials to activate your CRM platform. Let us know if you need any engineering assistance.\n\nCheers,\nAI CRM Team`;
  }

  return { subject, body };
}
