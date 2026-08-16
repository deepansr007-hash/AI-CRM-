/**
 * AI CRM System Database Schema ORM Definitions
 * Exposes core fields interfaces mapping columns of tables
 */

export const UserSchema = {
  id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
  username: 'TEXT UNIQUE NOT NULL',
  password: 'TEXT NOT NULL',
  email: 'TEXT UNIQUE NOT NULL',
  role: 'TEXT NOT NULL DEFAULT "sales"', // 'admin' | 'sales'
  avatar: 'TEXT'
};

export const LeadSchema = {
  id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
  name: 'TEXT NOT NULL',
  email: 'TEXT NOT NULL',
  phone: 'TEXT',
  company: 'TEXT',
  status: 'TEXT CHECK(status IN ("new", "contacted", "qualified", "proposal", "lost", "won")) DEFAULT "new"',
  value: 'REAL DEFAULT 0.0',
  source: 'TEXT',
  ai_score: 'INTEGER DEFAULT 50',
  ai_reasons: 'TEXT',
  ai_next_steps: 'TEXT',
  created_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP',
  updated_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP'
};

export const CustomerSchema = {
  id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
  lead_id: 'INTEGER REFERENCES leads(id)',
  name: 'TEXT NOT NULL',
  email: 'TEXT NOT NULL',
  phone: 'TEXT',
  company: 'TEXT',
  status: 'TEXT CHECK(status IN ("active", "at_risk", "churned")) DEFAULT "active"',
  churn_probability: 'REAL DEFAULT 0.05',
  ai_insights: 'TEXT',
  LTV: 'REAL DEFAULT 0.0',
  last_interaction: 'DATETIME',
  created_at: 'DATETIME default CURRENT_TIMESTAMP',
  updated_at: 'DATETIME default CURRENT_TIMESTAMP'
};

export const DealSchema = {
  id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
  lead_id: 'INTEGER REFERENCES leads(id)',
  title: 'TEXT NOT NULL',
  value: 'REAL NOT NULL',
  stage: 'TEXT CHECK(stage IN ("discovery", "demo", "negotiation", "contract", "won", "lost")) DEFAULT "discovery"',
  close_rate: 'REAL DEFAULT 0.0',
  ai_probability: 'REAL DEFAULT 0.5',
  close_date: 'TEXT',
  created_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP',
  updated_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP'
};
