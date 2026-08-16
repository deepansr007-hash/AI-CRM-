import * as db from '../config/db.js';
import { predictLeadScore } from '../services/aiService.js';

export const getAllLeads = async (req, res, next) => {
  try {
    const leads = await db.query('SELECT * FROM leads ORDER BY created_at DESC');
    res.json(leads);
  } catch (error) {
    next(error);
  }
};

export const getLeadById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const leads = await db.query('SELECT * FROM leads WHERE id = ?', [id]);
    
    if (leads.length === 0) {
      return res.status(404).json({ error: 'Lead not found.' });
    }

    // Get interactions
    const interactions = await db.query('SELECT * FROM interactions WHERE parent_type = ? AND parent_id = ? ORDER BY date DESC', ['lead', id]);
    
    res.json({
      ...leads[0],
      interactions
    });
  } catch (error) {
    next(error);
  }
};

export const createLead = async (req, res, next) => {
  try {
    const { name, email, phone, company, status, value, source } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required.' });
    }

    // Run AI Lead Scorer
    const aiAssessment = await predictLeadScore({ name, email, phone, company, source, status, value });

    const result = await db.run(
      `INSERT INTO leads (name, email, phone, company, status, value, source, ai_score, ai_reasons, ai_next_steps, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        email,
        phone || '',
        company || '',
        status || 'new',
        parseFloat(value) || 0.0,
        source || 'Web Search',
        aiAssessment.score,
        aiAssessment.reasons,
        aiAssessment.next_steps,
        new Date().toISOString(),
        new Date().toISOString()
      ]
    );

    // If status is won, automatically create corresponding customer record
    if (status === 'won') {
      const ltvVal = parseFloat(value) || 0.0;
      await db.run(
        `INSERT INTO customers (lead_id, name, email, phone, company, status, LTV, last_interaction, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [result.id, name, email, phone, company, 'active', ltvVal, new Date().toISOString(), new Date().toISOString(), new Date().toISOString()]
      );
    }

    // Add log
    await db.run('INSERT INTO system_logs (category, message, severity) VALUES (?, ?, ?)', [
      'Lead',
      `Lead created: ${name} (${company}) with AI Score: ${aiAssessment.score}%`,
      'info'
    ]);

    res.status(201).json({ id: result.id, message: 'Lead created successfully.' });

  } catch (error) {
    next(error);
  }
};

export const updateLead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, phone, company, status, value, source, forceScoreUpdate } = req.body;

    const leads = await db.query('SELECT * FROM leads WHERE id = ?', [id]);
    if (leads.length === 0) {
      return res.status(404).json({ error: 'Lead not found.' });
    }

    const currentLead = leads[0];
    const updatedName = name !== undefined ? name : currentLead.name;
    const updatedEmail = email !== undefined ? email : currentLead.email;
    const updatedSource = source !== undefined ? source : currentLead.source;
    const updatedStatus = status !== undefined ? status : currentLead.status;
    const updatedValue = value !== undefined ? parseFloat(value) : currentLead.value;

    let score = currentLead.ai_score;
    let reasons = currentLead.ai_reasons;
    let next_steps = currentLead.ai_next_steps;

    // Trigger AI prediction if score-impacting fields change
    if (
      forceScoreUpdate || 
      source !== currentLead.source || 
      value !== currentLead.value || 
      status !== currentLead.status
    ) {
      const assessment = await predictLeadScore({
        name: updatedName,
        email: updatedEmail,
        phone: phone || currentLead.phone,
        company: company || currentLead.company,
        source: updatedSource,
        status: updatedStatus,
        value: updatedValue
      });
      score = assessment.score;
      reasons = assessment.reasons;
      next_steps = assessment.next_steps;
    }

    await db.run(
      `UPDATE leads SET name = ?, email = ?, phone = ?, company = ?, status = ?, value = ?, source = ?, ai_score = ?, ai_reasons = ?, ai_next_steps = ?, updated_at = ? 
       WHERE id = ?`,
      [
        updatedName,
        updatedEmail,
        phone !== undefined ? phone : currentLead.phone,
        company !== undefined ? company : currentLead.company,
        updatedStatus,
        updatedValue,
        updatedSource,
        score,
        reasons,
        next_steps,
        new Date().toISOString(),
        id
      ]
    );

    // If change status to 'won' and customer doesn't exist, create it
    if (updatedStatus === 'won' && currentLead.status !== 'won') {
      const customerExists = await db.query('SELECT id FROM customers WHERE lead_id = ?', [id]);
      if (customerExists.length === 0) {
        await db.run(
          `INSERT INTO customers (lead_id, name, email, phone, company, status, LTV, last_interaction, created_at, updated_at) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [id, updatedName, updatedEmail, phone || currentLead.phone, company || currentLead.company, 'active', updatedValue, new Date().toISOString(), new Date().toISOString(), new Date().toISOString()]
        );
      }
    }

    res.json({ message: 'Lead updated successfully.' });
  } catch (error) {
    next(error);
  }
};

export const deleteLead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.run('DELETE FROM leads WHERE id = ?', [id]);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Lead not found.' });
    }

    // Clean connections from deals / interactions
    await db.run('DELETE FROM interactions WHERE parent_type = ? AND parent_id = ?', ['lead', id]);

    res.json({ message: 'Lead deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

export const reScoreLead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const leads = await db.query('SELECT * FROM leads WHERE id = ?', [id]);
    if (leads.length === 0) {
      return res.status(404).json({ error: 'Lead not found.' });
    }

    const lead = leads[0];
    const assessment = await predictLeadScore(lead);

    await db.run(
      'UPDATE leads SET ai_score = ?, ai_reasons = ?, ai_next_steps = ?, updated_at = ? WHERE id = ?',
      [assessment.score, assessment.reasons, assessment.next_steps, new Date().toISOString(), id]
    );

    res.json({
      message: 'AI lead score recalculated.',
      ai_score: assessment.score,
      ai_reasons: assessment.reasons,
      ai_next_steps: assessment.next_steps
    });
  } catch (error) {
    next(error);
  }
};
