import * as db from '../config/db.js';
import { predictChurnProbability, generateSmartEmail } from '../services/aiService.js';

export const getAllCustomers = async (req, res, next) => {
  try {
    const customers = await db.query('SELECT * FROM customers ORDER BY created_at DESC');
    res.json(customers);
  } catch (error) {
    next(error);
  }
};

export const getCustomerById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const customers = await db.query('SELECT * FROM customers WHERE id = ?', [id]);
    
    if (customers.length === 0) {
      return res.status(404).json({ error: 'Customer not found.' });
    }

    const customer = customers[0];
    const interactions = await db.query('SELECT * FROM interactions WHERE parent_type = ? AND parent_id = ? ORDER BY date DESC', ['customer', id]);
    
    res.json({
      ...customer,
      interactions
    });
  } catch (error) {
    next(error);
  }
};

export const createCustomer = async (req, res, next) => {
  try {
    const { name, email, phone, company, status, LTV } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required.' });
    }

    const tempCustomer = { name, email, phone, company, status: status || 'active', LTV: parseFloat(LTV) || 0 };
    const churnAssessment = await predictChurnProbability(tempCustomer, []);

    const result = await db.run(
      `INSERT INTO customers (lead_id, name, email, phone, company, status, LTV, churn_probability, ai_insights, last_interaction, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        null,
        name,
        email,
        phone || '',
        company || '',
        status || 'active',
        parseFloat(LTV) || 0.0,
        churnAssessment.probability,
        churnAssessment.insights,
        new Date().toISOString(),
        new Date().toISOString(),
        new Date().toISOString()
      ]
    );

    res.status(201).json({ id: result.id, message: 'Customer created successfully.' });
  } catch (error) {
    next(error);
  }
};

export const updateCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, phone, company, status, LTV } = req.body;

    const customers = await db.query('SELECT * FROM customers WHERE id = ?', [id]);
    if (customers.length === 0) {
      return res.status(404).json({ error: 'Customer not found.' });
    }

    const currentCustomer = customers[0];
    const updatedName = name !== undefined ? name : currentCustomer.name;
    const updatedEmail = email !== undefined ? email : currentCustomer.email;
    const updatedStatus = status !== undefined ? status : currentCustomer.status;
    const updatedLTV = LTV !== undefined ? parseFloat(LTV) : currentCustomer.LTV;

    // Fetch the client's interactions to pass to the Churn engine
    const interactions = await db.query('SELECT * FROM interactions WHERE parent_type = ? AND parent_id = ?', ['customer', id]);
    
    const churnAssessment = await predictChurnProbability({
      ...currentCustomer,
      name: updatedName,
      email: updatedEmail,
      status: updatedStatus,
      LTV: updatedLTV
    }, interactions);

    await db.run(
      `UPDATE customers SET name = ?, email = ?, phone = ?, company = ?, status = ?, LTV = ?, churn_probability = ?, ai_insights = ?, updated_at = ?
       WHERE id = ?`,
      [
        updatedName,
        updatedEmail,
        phone !== undefined ? phone : currentCustomer.phone,
        company !== undefined ? company : currentCustomer.company,
        updatedStatus,
        updatedLTV,
        churnAssessment.probability,
        churnAssessment.insights,
        new Date().toISOString(),
        id
      ]
    );

    res.json({ message: 'Customer updated successfully.' });
  } catch (error) {
    next(error);
  }
};

export const createCustomerInteraction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { type, direction, description } = req.body;

    if (!type || !description) {
      return res.status(400).json({ error: 'Type and description are required.' });
    }

    const customers = await db.query('SELECT * FROM customers WHERE id = ?', [id]);
    if (customers.length === 0) {
      return res.status(404).json({ error: 'Customer not found.' });
    }

    // Insert interaction
    await db.run(
      'INSERT INTO interactions (parent_type, parent_id, type, direction, description, date) VALUES (?, ?, ?, ?, ?, ?)',
      ['customer', id, type, direction || 'outgoing', description, new Date().toISOString()]
    );

    // Update customer's last interactions key and rerun churn analysis immediately
    await db.run(
      'UPDATE customers SET last_interaction = ? WHERE id = ?',
      [new Date().toISOString(), id]
    );

    const updatedCustomer = (await db.query('SELECT * FROM customers WHERE id = ?', [id]))[0];
    const interactions = await db.query('SELECT * FROM interactions WHERE parent_type = ? AND parent_id = ?', ['customer', id]);

    const churnAssessment = await predictChurnProbability(updatedCustomer, interactions);

    await db.run(
      'UPDATE customers SET churn_probability = ?, ai_insights = ? WHERE id = ?',
      [churnAssessment.probability, churnAssessment.insights, id]
    );

    res.status(201).json({
      message: 'Interaction recorded and churn analysis updated.',
      churn_probability: churnAssessment.probability,
      ai_insights: churnAssessment.insights
    });
  } catch (error) {
    next(error);
  }
};

export const requestSmartEmail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { context } = req.body; // e.g. 'lead_nurturing', 'retention_save'

    if (!context) {
      return res.status(400).json({ error: 'Context is required.' });
    }

    const customers = await db.query('SELECT * FROM customers WHERE id = ?', [id]);
    if (customers.length === 0) {
      return res.status(404).json({ error: 'Customer not found.' });
    }

    const emailPayload = await generateSmartEmail(customers[0], context);
    res.json(emailPayload);
  } catch (error) {
    next(error);
  }
};
