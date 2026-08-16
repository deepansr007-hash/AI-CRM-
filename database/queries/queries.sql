-- AI CRM System SQL Queries Cheat Sheet

-- 1. Authentication
-- Find User by Name
SELECT * FROM users WHERE username = 'admin' LIMIT 1;

-- 2. Leads Management
-- Get High Intent Leads (AI Score > 80%)
SELECT * FROM leads WHERE ai_score >= 80 AND status != 'won' ORDER BY ai_score DESC;

-- Get Lead with details & Interactions counts
SELECT l.*, COUNT(i.id) as interactions_count 
FROM leads l 
LEFT JOIN interactions i ON i.parent_id = l.id AND i.parent_type = 'lead'
GROUP BY l.id;

-- 3. Customers Analytics
-- Get At-Risk Active Customers sorted by Churn Probability
SELECT * FROM customers 
WHERE status = 'at_risk' OR (status = 'active' AND churn_probability > 0.4)
ORDER BY churn_probability DESC;

-- Update churn stats after interaction log addition
UPDATE customers 
SET churn_probability = ?, ai_insights = ?, last_interaction = ? 
WHERE id = ?;

-- 4. Deals Pipeline
-- Aggregate pipeline stages valuation
SELECT stage, COUNT(*) as deals_count, SUM(value) as total_value, SUM(value * ai_probability) as weighted_value
FROM deals 
WHERE stage NOT IN ('won', 'lost')
GROUP BY stage;
