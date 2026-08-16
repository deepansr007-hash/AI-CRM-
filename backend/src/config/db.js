import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure database directory exists
const dbDir = path.resolve(__dirname, '../../../database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const sqliteDbPath = path.resolve(dbDir, 'crm.db');
const jsonDbPath = path.resolve(dbDir, 'crm_store.json');

let dbType = 'sqlite'; // 'sqlite' or 'json'
let sqliteConnection = null;
let jsonData = null;

// Clean helper to check if sqlite works
const initDatabase = async () => {
  return new Promise((resolve) => {
    console.log(`[Database] Attempting to connect to SQLite at ${sqliteDbPath}...`);
    
    // Attempt standard SQLite3
    const tempDb = new sqlite3.Database(sqliteDbPath, (err) => {
      if (err) {
        console.error('[Database] SQLite connection failed, switching to JSON file database:', err.message);
        useJsonDatabase();
        resolve();
      } else {
        sqliteConnection = tempDb;
        console.log('[Database] SQLite connected successfully.');
        setupSqliteTables().then(resolve);
      }
    });
  });
};

function useJsonDatabase() {
  dbType = 'json';
  if (fs.existsSync(jsonDbPath)) {
    try {
      jsonData = JSON.parse(fs.readFileSync(jsonDbPath, 'utf8'));
      console.log('[Database] JSON database loaded.');
    } catch (e) {
      console.error('[Database] Error reading JSON database, resetting:', e.message);
      jsonData = null;
    }
  }
  
  if (!jsonData) {
    jsonData = {
      users: [],
      leads: [],
      customers: [],
      deals: [],
      interactions: [],
      ai_models_metrics: [],
      system_logs: []
    };
    saveJsonDatabase();
    seedJsonDatabase();
  }
}

function saveJsonDatabase() {
  try {
    fs.writeFileSync(jsonDbPath, JSON.stringify(jsonData, null, 2), 'utf8');
  } catch (e) {
    console.error('[Database] Failed to write JSON database:', e.message);
  }
}

// Queries dispatcher
export const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    if (dbType === 'sqlite') {
      sqliteConnection.all(sql, params, (err, rows) => {
        if (err) {
          console.error(`[Database SQL Error]: ${sql}`, err);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    } else {
      // Execute query on JSON store (simulated SQL parser for basic CRUD queries)
      try {
        const result = executeJsonSql(sql, params);
        resolve(result);
      } catch (e) {
        reject(e);
      }
    }
  });
};

export const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    if (dbType === 'sqlite') {
      sqliteConnection.run(sql, params, function(err) {
        if (err) {
          console.error(`[Database SQL Error]: ${sql}`, err);
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    } else {
      try {
        const result = executeJsonSql(sql, params, true);
        resolve(result);
      } catch (e) {
        reject(e);
      }
    }
  });
};

// Database Initializers and Schema Mappings for SQLite
async function setupSqliteTables() {
  const schemas = [
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      role TEXT NOT NULL DEFAULT 'sales',
      avatar TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS leads (
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
    )`,
    `CREATE TABLE IF NOT EXISTS customers (
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
    )`,
    `CREATE TABLE IF NOT EXISTS deals (
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
    )`,
    `CREATE TABLE IF NOT EXISTS interactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      parent_type TEXT NOT NULL CHECK(parent_type IN ('lead', 'customer')),
      parent_id INTEGER NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('email', 'call', 'meeting', 'note')),
      direction TEXT CHECK(direction IN ('incoming', 'outgoing')),
      description TEXT NOT NULL,
      date DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS ai_models_metrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      model_name TEXT UNIQUE NOT NULL,
      version TEXT NOT NULL,
      accuracy REAL,
      precision REAL,
      recall REAL,
      f1_score REAL,
      last_trained DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'active'
    )`,
    `CREATE TABLE IF NOT EXISTS system_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT,
      message TEXT,
      severity TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
  ];

  for (const tableSql of schemas) {
    await new Promise((res, rej) => {
      sqliteConnection.run(tableSql, [], (err) => {
        if (err) rej(err);
        else res();
      });
    });
  }

  // Check if users empty, seed
  sqliteConnection.get("SELECT COUNT(*) as count FROM users", (err, row) => {
    if (!err && row && row.count === 0) {
      console.log('[Database] SQLite is empty. Seeding database metrics and mock entries...');
      seedSqliteDatabase();
    }
  });
}

// SQL Injects / JSON SQL Mock parser for SQLite fall-back
function executeJsonSql(sql, params, isWrite = false) {
  const norm = sql.trim().replace(/\s+/g, ' ').toLowerCase();

  // Logging system
  if (norm.startsWith('insert into system_logs')) {
    const entry = {
      id: jsonData.system_logs.length + 1,
      category: params[0],
      message: params[1],
      severity: params[2],
      timestamp: new Date().toISOString()
    };
    jsonData.system_logs.push(entry);
    saveJsonDatabase();
    return { id: entry.id, changes: 1 };
  }

  // Authentication/Users
  if (norm.startsWith('select * from users where username =')) {
    const username = params[0] || (sql.match(/username\s*=\s*'([^']+)'/) || [])[1];
    const user = jsonData.users.find(u => u.username === username);
    return user ? [user] : [];
  }
  if (norm.startsWith('select * from users where id =')) {
    const user = jsonData.users.find(u => u.id === parseInt(params[0]));
    return user ? [user] : [];
  }
  if (norm.startsWith('select count(*) as count from users')) {
    return [{ count: jsonData.users.length }];
  }
  if (norm.startsWith('insert into users')) {
    const entry = {
      id: jsonData.users.length + 1,
      username: params[0],
      password: params[1],
      email: params[2],
      role: params[3] || 'sales',
      avatar: params[4] || ''
    };
    jsonData.users.push(entry);
    saveJsonDatabase();
    return { id: entry.id, changes: 1 };
  }

  // Leads SELECT queries
  if (norm.startsWith('select * from leads')) {
    // Check for ID filter
    const matchId = norm.match(/where id\s*=\s*\?/);
    if (matchId) {
      const idx = jsonData.leads.find(l => l.id === parseInt(params[0]));
      return idx ? [idx] : [];
    }
    // Sort logic default
    const sorted = [...jsonData.leads].sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
    return sorted;
  }
  if (norm.startsWith('insert into leads')) {
    const entry = {
      id: jsonData.leads.length + 1,
      name: params[0],
      email: params[1],
      phone: params[2],
      company: params[3],
      status: params[4] || 'new',
      value: parseFloat(params[5]) || 0.0,
      source: params[6],
      ai_score: parseInt(params[7]) || 50,
      ai_reasons: params[8] || '',
      ai_next_steps: params[9] || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    jsonData.leads.push(entry);
    saveJsonDatabase();
    return { id: entry.id, changes: 1 };
  }
  if (norm.startsWith('update leads set')) {
    // update leads set status = ?, ai_score = ?, ... where id = ?
    let id;
    if (norm.includes('where id = ?')) {
      id = parseInt(params[params.length - 1]);
    }
    const idx = jsonData.leads.findIndex(l => l.id === id);
    if (idx !== -1) {
      // Find parameter updates
      const setPart = sql.substring(sql.toLowerCase().indexOf('set') + 3, sql.toLowerCase().indexOf('where')).trim();
      const fields = setPart.split(',').map(f => f.split('=')[0].trim());
      fields.forEach((field, i) => {
        jsonData.leads[idx][field] = params[i];
      });
      jsonData.leads[idx].updated_at = new Date().toISOString();
      saveJsonDatabase();
      return { id, changes: 1 };
    }
    return { id: 0, changes: 0 };
  }
  if (norm.startsWith('delete from leads')) {
    const id = parseInt(params[0]);
    const initLen = jsonData.leads.length;
    jsonData.leads = jsonData.leads.filter(l => l.id !== id);
    saveJsonDatabase();
    return { changes: initLen - jsonData.leads.length };
  }

  // Customers
  if (norm.startsWith('select * from customers')) {
    const matchId = norm.match(/where id\s*=\s*\?/);
    if (matchId) {
      const idx = jsonData.customers.find(c => c.id === parseInt(params[0]));
      return idx ? [idx] : [];
    }
    return [...jsonData.customers].sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
  }
  if (norm.startsWith('insert into customers')) {
    const entry = {
      id: jsonData.customers.length + 1,
      lead_id: params[0] ? parseInt(params[0]) : null,
      name: params[1],
      email: params[2],
      phone: params[3],
      company: params[4],
      status: params[5] || 'active',
      churn_probability: parseFloat(params[6]) || 0.05,
      ai_insights: params[7] || '',
      LTV: parseFloat(params[8]) || 0.0,
      last_interaction: params[9] || new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    jsonData.customers.push(entry);
    saveJsonDatabase();
    return { id: entry.id, changes: 1 };
  }
  if (norm.startsWith('update customers set')) {
    let id;
    if (norm.includes('where id = ?')) {
      id = parseInt(params[params.length - 1]);
    }
    const idx = jsonData.customers.findIndex(c => c.id === id);
    if (idx !== -1) {
      const setPart = sql.substring(sql.toLowerCase().indexOf('set') + 3, sql.toLowerCase().indexOf('where')).trim();
      const fields = setPart.split(',').map(f => f.split('=')[0].trim());
      fields.forEach((field, i) => {
        jsonData.customers[idx][field] = params[i];
      });
      jsonData.customers[idx].updated_at = new Date().toISOString();
      saveJsonDatabase();
      return { id, changes: 1 };
    }
    return { id: 0, changes: 0 };
  }

  // Deals
  if (norm.startsWith('select * from deals')) {
    const matchId = norm.match(/where id\s*=\s*\?/);
    if (matchId) {
      const idx = jsonData.deals.find(d => d.id === parseInt(params[0]));
      return idx ? [idx] : [];
    }
    return [...jsonData.deals];
  }
  if (norm.startsWith('insert into deals')) {
    const entry = {
      id: jsonData.deals.length + 1,
      lead_id: params[0] ? parseInt(params[0]) : null,
      title: params[1],
      value: parseFloat(params[2]) || 0.0,
      stage: params[3] || 'discovery',
      close_rate: parseFloat(params[4]) || 0.0,
      ai_probability: parseFloat(params[5]) || 0.5,
      close_date: params[6],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    jsonData.deals.push(entry);
    saveJsonDatabase();
    return { id: entry.id, changes: 1 };
  }
  if (norm.startsWith('update deals set')) {
    let id;
    if (norm.includes('where id = ?')) {
      id = parseInt(params[params.length - 1]);
    }
    const idx = jsonData.deals.findIndex(d => d.id === id);
    if (idx !== -1) {
      const setPart = sql.substring(sql.toLowerCase().indexOf('set') + 3, sql.toLowerCase().indexOf('where')).trim();
      const fields = setPart.split(',').map(f => f.split('=')[0].trim());
      fields.forEach((field, i) => {
        jsonData.deals[idx][field] = params[i];
      });
      jsonData.deals[idx].updated_at = new Date().toISOString();
      saveJsonDatabase();
      return { id, changes: 1 };
    }
    return { id: 0, changes: 0 };
  }

  // Interactions
  if (norm.startsWith('select * from interactions')) {
    // Check filter by parent
    const matchParent = norm.match(/parent_type\s*=\s*\?\s*and\s*parent_id\s*=\s*\?/);
    if (matchParent) {
      const ptype = params[0];
      const pid = parseInt(params[1]);
      return jsonData.interactions.filter(i => i.parent_type === ptype && i.parent_id === pid);
    }
    return [...jsonData.interactions].sort((a,b) => new Date(b.date) - new Date(a.date));
  }
  if (norm.startsWith('insert into interactions')) {
    const entry = {
      id: jsonData.interactions.length + 1,
      parent_type: params[0],
      parent_id: parseInt(params[1]),
      type: params[2],
      direction: params[3],
      description: params[4],
      date: new Date().toISOString()
    };
    jsonData.interactions.push(entry);
    saveJsonDatabase();
    return { id: entry.id, changes: 1 };
  }

  // AI model metrics
  if (norm.startsWith('select * from ai_models_metrics')) {
    return [...jsonData.ai_models_metrics];
  }
  if (norm.startsWith('insert into ai_models_metrics') || norm.startsWith('replace into ai_models_metrics')) {
    // check if exists
    const model_name = params[0];
    const idx = jsonData.ai_models_metrics.findIndex(m => m.model_name === model_name);
    const entry = {
      id: idx !== -1 ? jsonData.ai_models_metrics[idx].id : jsonData.ai_models_metrics.length + 1,
      model_name,
      version: params[1],
      accuracy: parseFloat(params[2]),
      precision: parseFloat(params[3]),
      recall: parseFloat(params[4]),
      f1_score: parseFloat(params[5]),
      last_trained: new Date().toISOString(),
      status: params[6] || 'active'
    };
    if (idx !== -1) {
      jsonData.ai_models_metrics[idx] = entry;
    } else {
      jsonData.ai_models_metrics.push(entry);
    }
    saveJsonDatabase();
    return { id: entry.id, changes: 1 };
  }

  // System Logs
  if (norm.startsWith('select * from system_logs')) {
    return [...jsonData.system_logs].sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 100);
  }

  throw new Error(`Unsupported simulated sql query logic check for query: ${sql}`);
}

// Seed Helpers
import { mockUsers, mockLeads, mockCustomers, mockDeals, mockInteractions, mockMetrics } from './seedData.js';

function seedJsonDatabase() {
  jsonData.users = mockUsers;
  jsonData.leads = mockLeads;
  jsonData.customers = mockCustomers;
  jsonData.deals = mockDeals;
  jsonData.interactions = mockInteractions;
  jsonData.ai_models_metrics = mockMetrics;
  jsonData.system_logs = [
    { id: 1, category: "Model", message: "Lead Scoring Pipeline initialized. Accuracy: 94.2%", severity: "info", timestamp: new Date(Date.now() - 3600000 * 2).toISOString() },
    { id: 2, category: "System", message: "Database seeding successfully finished.", severity: "info", timestamp: new Date().toISOString() }
  ];
  saveJsonDatabase();
  console.log('[Database] JSON database seeded.');
}

async function seedSqliteDatabase() {
  // SQLite seeding
  try {
    for (const u of mockUsers) {
      await run("INSERT INTO users (username, password, email, role, avatar) VALUES (?, ?, ?, ?, ?)", [u.username, u.password, u.email, u.role, u.avatar]);
    }
    for (const l of mockLeads) {
      await run(`INSERT INTO leads (id, name, email, phone, company, status, value, source, ai_score, ai_reasons, ai_next_steps, created_at, updated_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
                [l.id, l.name, l.email, l.phone, l.company, l.status, l.value, l.source, l.ai_score, l.ai_reasons, l.ai_next_steps, l.created_at, l.updated_at]);
    }
    for (const c of mockCustomers) {
      await run(`INSERT INTO customers (id, lead_id, name, email, phone, company, status, churn_probability, ai_insights, LTV, last_interaction, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [c.id, c.lead_id, c.name, c.email, c.phone, c.company, c.status, c.churn_probability, c.ai_insights, c.LTV, c.last_interaction, c.created_at, c.updated_at]);
    }
    for (const d of mockDeals) {
      await run(`INSERT INTO deals (id, lead_id, title, value, stage, close_rate, ai_probability, close_date, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [d.id, d.lead_id, d.title, d.value, d.stage, d.close_rate, d.ai_probability, d.close_date, d.created_at, d.updated_at]);
    }
    for (const i of mockInteractions) {
      await run(`INSERT INTO interactions (id, parent_type, parent_id, type, direction, description, date)
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [i.id, i.parent_type, i.parent_id, i.type, i.direction, i.description, i.date]);
    }
    for (const m of mockMetrics) {
      await run(`INSERT INTO ai_models_metrics (model_name, version, accuracy, precision, recall, f1_score, last_trained, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [m.model_name, m.version, m.accuracy, m.precision, m.recall, m.f1_score, m.last_trained, m.status]);
    }
    await run("INSERT INTO system_logs (category, message, severity, timestamp) VALUES (?, ?, ?, ?)", 
              ["System", "SQLite database seeded with demo data.", "info", new Date().toISOString()]);
    console.log('[Database] SQLite seeded successfully.');
  } catch (error) {
    console.error('[Database] SQLite seeding failed:', error.message);
  }
}

// Auto init
initDatabase().catch(err => {
  console.error('[Database] Setup catastrophically failed, forcing JSON backend:', err.message);
  useJsonDatabase();
});
