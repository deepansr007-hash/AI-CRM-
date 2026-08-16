import * as db from '../config/db.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    // 1. Core KPIs
    const leadCount = await db.query('SELECT COUNT(*) as count, AVG(ai_score) as avg_score FROM leads');
    const customerCount = await db.query(`
      SELECT 
        COUNT(*) as count, 
        AVG(churn_probability) as avg_churn, 
        SUM(LTV) as total_ltv 
      FROM customers 
      WHERE status != 'churned'
    `);
    
    // Deals pipeline totals
    const pipelineData = await db.query(`
      SELECT 
        SUM(value) as total_val,
        SUM(value * ai_probability) as weighted_val
      FROM deals 
      WHERE stage NOT IN ('won', 'lost')
    `);

    // 2. Stage Breakdown
    const stageCounts = await db.query(`
      SELECT stage, COUNT(*) as count, SUM(value) as total_value
      FROM deals 
      GROUP BY stage
    `);

    // Let's ensure every deal stage is represented in frontend helper array
    const stagesDict = { discovery: 0, demo: 0, negotiation: 0, contract: 0, won: 0, lost: 0 };
    const stagesValDict = { discovery: 0, demo: 0, negotiation: 0, contract: 0, won: 0, lost: 0 };
    stageCounts.forEach(row => {
      if (row.stage in stagesDict) {
        stagesDict[row.stage] = row.count;
        stagesValDict[row.stage] = row.total_value;
      }
    });

    // 3. Lead Source Breakdown
    const sourceCounts = await db.query(`
      SELECT source, COUNT(*) as count 
      FROM leads 
      GROUP BY source
    `);

    // 4. Churn Risk Breakdown
    const churnRisks = await db.query(`
      SELECT 
        SUM(CASE WHEN churn_probability < 0.2 THEN 1 ELSE 0 END) as low,
        SUM(CASE WHEN churn_probability >= 0.2 AND churn_probability < 0.6 THEN 1 ELSE 0 END) as medium,
        SUM(CASE WHEN churn_probability >= 0.6 THEN 1 ELSE 0 END) as high
      FROM customers
    `);

    // 5. AI Engine metrics & System logs
    const aiModels = await db.query('SELECT * FROM ai_models_metrics');
    const recentLogs = await db.query('SELECT * FROM system_logs ORDER BY timestamp DESC LIMIT 8');

    res.json({
      kpis: {
        totalLeads: leadCount[0]?.count || 0,
        averageLeadScore: Math.round(leadCount[0]?.avg_score || 0),
        activeCustomers: customerCount[0]?.count || 0,
        averageChurnProb: parseFloat((customerCount[0]?.avg_churn || 0).toFixed(3)),
        totalArr: customerCount[0]?.total_ltv || 0,
        pipelineValue: pipelineData[0]?.total_val || 0,
        weightedPipeline: Math.round(pipelineData[0]?.weighted_val || 0)
      },
      charts: {
        dealsByStage: Object.keys(stagesDict).map(stage => ({
          stage: stage.charAt(0).toUpperCase() + stage.slice(1),
          deals: stagesDict[stage],
          value: stagesValDict[stage]
        })),
        leadsBySource: sourceCounts.map(row => ({
          name: row.source || 'Other',
          value: row.count
        })),
        crmCustomerHealth: [
          { name: 'Healthy (<20%)', value: churnRisks[0]?.low || 0, color: '#10B981' },
          { name: 'Warning (20-60%)', value: churnRisks[0]?.medium || 0, color: '#F59E0B' },
          { name: 'Critical (>60%)', value: churnRisks[0]?.high || 0, color: '#EF4444' }
        ]
      },
      aiModelsStats: aiModels,
      recentActivity: recentLogs
    });

  } catch (error) {
    next(error);
  }
};

export const getModelMetrics = async (req, res, next) => {
  try {
    const metrics = await db.query('SELECT * FROM ai_models_metrics');
    res.json(metrics);
  } catch (error) {
    next(error);
  }
};

export const retrainModel = async (req, res, next) => {
  try {
    const { modelName } = req.body;

    if (!modelName) {
      return res.status(400).json({ error: 'Model name is required.' });
    }

    const models = await db.query('SELECT * FROM ai_models_metrics WHERE model_name = ?', [modelName]);
    if (models.length === 0) {
      return res.status(444).json({ error: 'Model not registered in registry.' });
    }

    // Simulate training progress output in logging table
    await db.run('INSERT INTO system_logs (category, message, severity) VALUES (?, ?, ?)', [
      'Model',
      `Triggered retraining pipeline for model ${modelName}. Epochs set: 100`,
      'info'
    ]);

    // Random accuracy tuning (slight improvement simulating optimization)
    const currentModel = models[0];
    const newAccuracy = Math.min(0.99, currentModel.accuracy + (Math.random() * 0.015));
    const newPrecision = Math.min(0.99, currentModel.precision + (Math.random() * 0.015));
    
    await db.run(
      `UPDATE ai_models_metrics 
       SET accuracy = ?, precision = ?, last_trained = ? 
       WHERE model_name = ?`,
      [newAccuracy, newPrecision, new Date().toISOString(), modelName]
    );

    // Logging complete
    await db.run('INSERT INTO system_logs (category, message, severity) VALUES (?, ?, ?)', [
      'Model',
      `Retraining completed for ${modelName}. New accuracy: ${(newAccuracy * 100).toFixed(1)}%`,
      'info'
    ]);

    res.json({
      message: `${modelName} successfully refit and saved as latest target registry weights.`,
      metrics: {
        model_name: modelName,
        accuracy: newAccuracy,
        precision: newPrecision,
        last_trained: new Date().toISOString()
      }
    });

  } catch (error) {
    next(error);
  }
};
