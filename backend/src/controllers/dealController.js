import * as db from '../config/db.js';

export const getAllDeals = async (req, res, next) => {
  try {
    const deals = await db.query(`
      SELECT deals.*, leads.name as lead_name, leads.company as lead_company 
      FROM deals 
      LEFT JOIN leads ON deals.lead_id = leads.id
    `);
    res.json(deals);
  } catch (error) {
    next(error);
  }
};

export const getDealById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deals = await db.query(`
      SELECT deals.*, leads.name as lead_name, leads.company as lead_company 
      FROM deals 
      LEFT JOIN leads ON deals.lead_id = leads.id 
      WHERE deals.id = ?
    `, [id]);

    if (deals.length === 0) {
      return res.status(404).json({ error: 'Deal not found.' });
    }

    res.json(deals[0]);
  } catch (error) {
    next(error);
  }
};

export const createDeal = async (req, res, next) => {
  try {
    const { lead_id, title, value, stage, close_date } = req.body;

    if (!title || !value) {
      return res.status(400).json({ error: 'Title and value are required.' });
    }

    // Default probability algorithm based on CRM stage:
    let aiProb = 0.15; // default discovery
    if (stage === 'demo') aiProb = 0.35;
    else if (stage === 'negotiation') aiProb = 0.60;
    else if (stage === 'contract') aiProb = 0.85;
    else if (stage === 'won') aiProb = 1.0;
    else if (stage === 'lost') aiProb = 0.0;

    const result = await db.run(
      `INSERT INTO deals (lead_id, title, value, stage, close_rate, ai_probability, close_date, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        lead_id || null,
        title,
        parseFloat(value),
        stage || 'discovery',
        0.0,
        aiProb,
        close_date || null,
        new Date().toISOString(),
        new Date().toISOString()
      ]
    );

    // If deal won, make sure lead status is updated to won
    if (stage === 'won' && lead_id) {
      await db.run("UPDATE leads SET status = 'won' WHERE id = ?", [lead_id]);
    }

    res.status(201).json({ id: result.id, message: 'Deal created successfully.' });
  } catch (error) {
    next(error);
  }
};

export const updateDeal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, value, stage, close_date, ai_probability } = req.body;

    const deals = await db.query('SELECT * FROM deals WHERE id = ?', [id]);
    if (deals.length === 0) {
      return res.status(404).json({ error: 'Deal not found.' });
    }

    const currentDeal = deals[0];
    const updatedTitle = title !== undefined ? title : currentDeal.title;
    const updatedValue = value !== undefined ? parseFloat(value) : currentDeal.value;
    const updatedStage = stage !== undefined ? stage : currentDeal.stage;
    const updatedCloseDate = close_date !== undefined ? close_date : currentDeal.close_date;

    let updatedProbability = ai_probability !== undefined ? parseFloat(ai_probability) : currentDeal.ai_probability;

    // Recalculate auto probability if stage changes and user didn't force custom prob
    if (stage !== undefined && stage !== currentDeal.stage && ai_probability === undefined) {
      if (updatedStage === 'discovery') updatedProbability = 0.15;
      else if (updatedStage === 'demo') updatedProbability = 0.35;
      else if (updatedStage === 'negotiation') updatedProbability = 0.60;
      else if (updatedStage === 'contract') updatedProbability = 0.85;
      else if (updatedStage === 'won') updatedProbability = 1.0;
      else if (updatedStage === 'lost') updatedProbability = 0.0;
    }

    await db.run(
      `UPDATE deals SET title = ?, value = ?, stage = ?, ai_probability = ?, close_date = ?, updated_at = ? 
       WHERE id = ?`,
      [
        updatedTitle,
        updatedValue,
        updatedStage,
        updatedProbability,
        updatedCloseDate,
        new Date().toISOString(),
        id
      ]
    );

    // Sync back with leads table
    if (updatedStage === 'won' && currentDeal.lead_id) {
      await db.run("UPDATE leads SET status = 'won' WHERE id = ?", [currentDeal.lead_id]);
      
      // Also write customer if not exists
      const leadInfo = (await db.query("SELECT * FROM leads WHERE id = ?", [currentDeal.lead_id]))[0];
      if (leadInfo) {
        const customerExists = await db.query('SELECT id FROM customers WHERE lead_id = ?', [currentDeal.lead_id]);
        if (customerExists.length === 0) {
          await db.run(
            `INSERT INTO customers (lead_id, name, email, phone, company, status, LTV, last_interaction, created_at, updated_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [currentDeal.lead_id, leadInfo.name, leadInfo.email, leadInfo.phone, leadInfo.company, 'active', updatedValue, new Date().toISOString(), new Date().toISOString(), new Date().toISOString()]
          );
        }
      }
    } else if (updatedStage === 'lost' && currentDeal.lead_id) {
      await db.run("UPDATE leads SET status = 'lost' WHERE id = ?", [currentDeal.lead_id]);
    }

    res.json({ message: 'Deal progress updated successfully.' });
  } catch (error) {
    next(error);
  }
};

export const deleteDeal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.run('DELETE FROM deals WHERE id = ?', [id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Deal not found.' });
    }
    res.json({ message: 'Deal deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
