-- Initial CRM Schema Migration File

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'sales',
  avatar TEXT
);

CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  status TEXT CHECK(status IN ('new', 'contacted', 'qualified', 'proposal', 'lost', 'won')) DEFAULT 'new',
  value REAL DEFAULT 0.0,
  source TEXT,
  ai_score INTEGER DEFAULT 50,
  ai_reasons TEXT,
  ai_next_steps TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lead_id INTEGER,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  status TEXT CHECK(status IN ('active', 'at_risk', 'churned')) DEFAULT 'active',
  churn_probability REAL DEFAULT 0.05,
  ai_insights TEXT,
  LTV REAL DEFAULT 0.0,
  last_interaction DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lead_id) REFERENCES leads(id)
);

CREATE TABLE IF NOT EXISTS deals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lead_id INTEGER,
  title TEXT NOT NULL,
  value REAL NOT NULL,
  stage TEXT CHECK(stage IN ('discovery', 'demo', 'negotiation', 'contract', 'won', 'lost')) DEFAULT 'discovery',
  close_rate REAL DEFAULT 0.0,
  ai_probability REAL DEFAULT 0.5,
  close_date TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lead_id) REFERENCES leads(id)
);

CREATE TABLE IF NOT EXISTS interactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  parent_type TEXT NOT NULL CHECK(parent_type IN ('lead', 'customer')),
  parent_id INTEGER NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('email', 'call', 'meeting', 'note')),
  direction TEXT CHECK(direction IN ('incoming', 'outgoing')),
  description TEXT NOT NULL,
  date DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_models_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  model_name TEXT UNIQUE NOT NULL,
  version TEXT NOT NULL,
  accuracy REAL,
  precision REAL,
  recall REAL,
  f1_score REAL,
  last_trained DATETIME DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS system_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT,
  message TEXT,
  severity TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
